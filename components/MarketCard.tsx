
import React from 'react';
import { MarketInsight } from '../types';
import { Edit2, Trash2, TrendingUp, TrendingDown, Activity, MoreHorizontal, Clock } from 'lucide-react';

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
    <div className="group relative bg-glass rounded-[3.5rem] p-12 flex flex-col min-h-[520px] transition-all hover:-translate-y-3">
      {/* Header: Massive Symbol & More */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-6xl font-black text-[#12141c] dark:text-white tracking-tighter uppercase italic leading-none">{insight.symbol}</h3>
          <div className="mt-4">
            <div className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
               {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
               {insight.status}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <MoreHorizontal className="w-6 h-6 text-gray-400 opacity-50" />
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-grow space-y-12">
        <div>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] block mb-4">Core Focus</span>
          <p className="text-[17px] font-bold text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-4">
            {insight.focusPoints}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] block mb-4">Strategy Plan</span>
          <div className="strategy-box p-7 rounded-[2rem] shadow-inner">
             <p className="text-[16px] font-black text-[#12141c] dark:text-white leading-snug">
               {insight.strategy}
             </p>
          </div>
        </div>
      </div>

      {/* Footer Info - Enhanced Category Label */}
      <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="px-5 py-2 bg-gray-900/10 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 rounded-xl text-[12px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest shadow-sm">
              {insight.category}
            </span>
         </div>
         
         {isEditable && (
           <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(insight)} className="p-2.5 text-gray-400 hover:text-amber-500 transition-all"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(insight.id)} className="p-2.5 text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
           </div>
         )}
      </div>
    </div>
  );
};

export default MarketCard;
