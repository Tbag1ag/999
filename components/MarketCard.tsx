
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
      className={`group relative bg-glass rounded-[3.5rem] p-9 sm:p-10 flex flex-col min-h-[480px] transition-all duration-700 ${isEditable ? 'cursor-pointer hover:-translate-y-2' : 'hover:-translate-y-1.5'}`}
    >
      {/* Admin Mode Badge */}
      {isEditable && (
        <div className="absolute top-8 right-10 flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Edit3 className="w-3 h-3" /> 编辑模式
        </div>
      )}

      {/* Header: Massive Symbol & Status */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-5xl font-black text-[#000000] dark:text-white tracking-tighter uppercase italic leading-none opacity-90">{insight.symbol}</h3>
          <div className="mt-4">
            <div className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
               {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
               {insight.status}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-grow space-y-8">
        <div>
          <p className="text-[19px] font-black text-[#000000] dark:text-white/95 leading-[1.6] line-clamp-5 tracking-tight">
            {insight.focusPoints}
          </p>
        </div>

        <div className="dark-glass p-7 rounded-[2.2rem]">
           <p className="text-[16px] font-black text-white dark:text-white/90 leading-relaxed">
             {insight.strategy}
           </p>
        </div>
      </div>

      {/* Footer Info - Date in pure black */}
      <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-xl text-[11px] font-black text-[#000000] dark:text-gray-300 uppercase tracking-widest">
              {insight.category}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-[#000000] dark:text-white/80 uppercase tracking-tighter">
              <Clock className="w-3.5 h-3.5" />
              {new Date(insight.updatedAt).toLocaleDateString()}
            </div>
         </div>
         
         {isEditable && (
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(insight); }} 
                className="p-3 bg-white/20 hover:bg-amber-500 hover:text-white rounded-2xl text-gray-700 dark:text-gray-300 transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(insight.id); }} 
                className="p-3 bg-white/20 hover:bg-red-500 hover:text-white rounded-2xl text-gray-700 dark:text-gray-300 transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default MarketCard;
