
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
      className={`group relative bg-glass rounded-[2.5rem] sm:rounded-[3.5rem] p-7 sm:p-12 flex flex-col min-h-[440px] sm:min-h-[540px] transition-all duration-700 ${effectiveArchived ? 'cursor-help' : isEditable ? 'cursor-pointer hover:-translate-y-2' : 'hover:-translate-y-1.5'} overflow-hidden`}
    >
      {isEditable && !effectiveArchived && (
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
          <Edit3 className="w-3 h-3" /> 点击进入编辑模式
        </div>
      )}

      {effectiveArchived && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-500 ${isRevealed ? 'opacity-0 scale-150' : 'opacity-80 scale-100'}`}>
           <div className="w-40 h-40 sm:w-52 sm:h-52 border-[4px] sm:border-[6px] border-emerald-400 rounded-full flex items-center justify-center -rotate-[15deg] shadow-[0_0_40px_rgba(52,211,153,0.2)]">
              <Check className="w-24 h-24 sm:w-32 sm:h-32 text-emerald-400 stroke-[3px]" />
           </div>
        </div>
      )}

      <div className={`flex flex-col flex-grow transition-all duration-700 ${effectiveArchived && !isRevealed ? 'blur-[12px] opacity-20 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
        <div className="mb-6 sm:mb-10">
          <h3 className="text-4xl sm:text-6xl font-[900] text-black dark:text-white tracking-tighter uppercase italic leading-none opacity-90 mb-4 sm:mb-5">
            {insight.symbol}
          </h3>
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
             {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
             {insight.status}
          </div>
        </div>

        <div className="mb-8 sm:mb-12">
          <p className="text-[17px] sm:text-[21px] font-black text-black dark:text-white leading-[1.6] tracking-tight">
            {insight.focusPoints}
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-end">
          <div className="strategy-box p-6 sm:p-8">
             <p className="text-[14px] sm:text-[17px] font-black text-black dark:text-white/90 leading-relaxed">
               {insight.strategy}
             </p>
          </div>
        </div>
      </div>

      <div className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-black/5 flex items-center justify-between relative z-20 transition-opacity duration-700 ${effectiveArchived && !isRevealed ? 'opacity-30' : 'opacity-100'}`}>
         <div className="flex items-center gap-3 sm:gap-4">
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-500/10 text-emerald-600' : isExpired ? 'bg-red-500/10 text-red-600' : 'bg-black/10 dark:bg-white/10 text-black dark:text-gray-300'}`}>
              {isCompleted ? '已结案' : isExpired ? '已失效' : insight.category}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-black dark:text-white/40 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {new Date(insight.updatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
            </div>
         </div>
         
         {isEditable && (
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(insight); }} 
                className="p-2.5 bg-black/5 dark:bg-white/10 hover:bg-amber-500 hover:text-white rounded-xl text-gray-800 dark:text-white transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(insight.id); }} 
                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default MarketCard;
