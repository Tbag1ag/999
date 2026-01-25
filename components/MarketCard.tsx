
import React from 'react';
import { MarketInsight } from '../types';
import { Edit2, Trash2, TrendingUp, TrendingDown, Activity, Edit3, Clock } from 'lucide-react';

interface MarketCardProps {
  insight: MarketInsight;
  onEdit: (insight: MarketInsight) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  isEditable?: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({ insight, onEdit, onDelete, isEditable = false }) => {
  const isUp = insight.status === '看涨';
  const isDown = insight.status === '看跌';
  
  return (
    <div 
      onClick={() => isEditable && onEdit(insight)}
      className={`group relative bg-glass rounded-[3rem] p-8 sm:p-10 flex flex-col min-h-[460px] transition-all duration-500 ${isEditable ? 'cursor-pointer hover:ring-2 hover:ring-amber-500/50 hover:-translate-y-2' : 'hover:-translate-y-1.5'}`}
    >
      {/* Admin Mode Badge */}
      {isEditable && (
        <div className="absolute top-6 right-8 flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 className="w-3 h-3" /> 编辑模式
        </div>
      )}

      {/* Header: Massive Symbol & Status */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-4xl font-black text-[#12141c] dark:text-white tracking-tighter uppercase italic leading-none">{insight.symbol}</h3>
          <div className="mt-3">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
               {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
               {insight.status}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections - Pure black and bold */}
      <div className="flex-grow space-y-8">
        <div>
          <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] block mb-2 opacity-60">Core Focus</span>
          <p className="text-[18px] font-black text-[#12141c] dark:text-white leading-[1.6] line-clamp-5">
            {insight.focusPoints}
          </p>
        </div>

        <div>
          <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] block mb-2 opacity-60">Strategy Plan</span>
          <div className="strategy-box p-6 rounded-[1.5rem] shadow-inner border border-black/5 dark:border-white/5 bg-white/40 dark:bg-black/20">
             <p className="text-[16px] font-black text-[#12141c] dark:text-amber-500 leading-snug">
               {insight.strategy}
             </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1.5 bg-black/5 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 rounded-lg text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">
              {insight.category}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-tighter">
              <Clock className="w-3 h-3" />
              {new Date(insight.updatedAt).toLocaleDateString()}
            </div>
         </div>
         
         {isEditable && (
           <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(insight); }} 
                className="p-2.5 bg-white/20 hover:bg-amber-500 hover:text-white rounded-xl text-gray-500 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(insight.id); }} 
                className="p-2.5 bg-white/20 hover:bg-red-500 hover:text-white rounded-xl text-gray-500 transition-all"
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
