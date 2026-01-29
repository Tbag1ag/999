
import React, { useState, useEffect, useRef } from 'react';
import { MarketInsight } from '../types';
import { Edit2, Trash2, TrendingUp, TrendingDown, Activity, Edit3, Clock, Check } from 'lucide-react';

interface MarketCardProps {
  insight: MarketInsight;
  onEdit: (insight: MarketInsight) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  isEditable?: boolean;
  isArchived?: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({ insight, onEdit, onDelete, isEditable = false, isArchived = false }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const revealTimer = useRef<number | null>(null);

  const isUp = insight.status === '看涨';
  const isDown = insight.status === '看跌';
  const isCompleted = insight.completionStatus === '已完成';
  const isExpired = insight.completionStatus === '已失效';
  
  const effectiveArchived = isArchived || isCompleted || isExpired;

  const handleCardClick = (e: React.MouseEvent) => {
    if (effectiveArchived) {
      setIsRevealed(true);
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
      revealTimer.current = window.setTimeout(() => {
        setIsRevealed(false);
        revealTimer.current = null;
      }, 5000);
    } else if (isEditable) {
      onEdit(insight);
    }
  };

  useEffect(() => {
    return () => {
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
    };
  }, []);

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-glass rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 flex flex-col min-h-[380px] sm:min-h-[540px] transition-all duration-700 ${effectiveArchived ? 'cursor-help' : isEditable ? 'cursor-pointer hover:-translate-y-2' : 'hover:-translate-y-1.5'} overflow-hidden`}
    >
      {isEditable && !effectiveArchived && (
        <div className="absolute top-4 right-4 sm:top-10 sm:right-10 flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 shadow-lg">
          <Edit3 className="w-2.5 h-2.5 sm:w-3 h-3" /> 编辑模式
        </div>
      )}

      {effectiveArchived && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-500 ${isRevealed ? 'opacity-0 scale-150' : 'opacity-80 scale-100'}`}>
           <div className="w-32 h-32 sm:w-52 sm:h-52 border-[3px] sm:border-[6px] border-green-400 rounded-full flex items-center justify-center -rotate-[15deg] shadow-[0_0_30px_rgba(74,222,128,0.15)]">
              <Check className="w-20 h-20 sm:w-32 sm:h-32 text-green-400 stroke-[3px]" />
           </div>
        </div>
      )}

      <div className={`flex flex-col flex-grow transition-all duration-700 ${effectiveArchived && !isRevealed ? 'blur-[8px] sm:blur-[12px] opacity-20 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
        <div className="mb-5 sm:mb-10">
          <h3 className="text-3xl sm:text-6xl font-[900] text-black dark:text-white tracking-tighter uppercase italic leading-none opacity-90 mb-3 sm:mb-5">
            {insight.symbol}
          </h3>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-green-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
             {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
             {insight.status}
          </div>
        </div>

        {/* 动态图文区域 */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-12">
          {insight.imageUrl && (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/5">
              <img src={insight.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={insight.symbol} />
            </div>
          )}
          <p className="text-[15px] sm:text-[21px] font-black text-black dark:text-white leading-[1.6] tracking-tight">
            {insight.focusPoints}
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-end">
          <div className="strategy-box p-5 sm:p-8">
             <p className="text-[13px] sm:text-[17px] font-black text-black dark:text-white/90 leading-relaxed">
               {insight.strategy}
             </p>
          </div>
        </div>
      </div>

      <div className={`mt-6 sm:mt-12 pt-5 sm:pt-8 border-t border-black/5 flex items-center justify-between relative z-20 transition-opacity duration-700 ${effectiveArchived && !isRevealed ? 'opacity-30' : 'opacity-100'}`}>
         <div className="flex items-center gap-2 sm:gap-4">
            <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'bg-green-500/10 text-green-600' : isExpired ? 'bg-red-500/10 text-red-600' : 'bg-black/10 dark:bg-white/10 text-black dark:text-gray-300'}`}>
              {isCompleted ? '已结案' : isExpired ? '已失效' : insight.category}
            </span>
            <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-black dark:text-white/40 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {new Date(insight.updatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </div>
         </div>
         
         {isEditable && (
           <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(insight); }} 
                className="p-2 sm:p-2.5 bg-black/5 dark:bg-white/10 sm:hover:bg-amber-500 sm:hover:text-white rounded-xl text-gray-800 dark:text-white transition-all shadow-sm active:bg-amber-500 active:text-white"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(insight.id); }} 
                className="p-2 sm:p-2.5 bg-red-500/10 sm:hover:bg-red-500 text-red-500 sm:hover:text-white rounded-xl transition-all shadow-sm active:bg-red-500 active:text-white"
              >
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default MarketCard;
