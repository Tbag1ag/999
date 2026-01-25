
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
      className={`group relative bg-glass rounded-[3.5rem] p-10 sm:p-12 flex flex-col min-h-[540px] transition-all duration-700 ${isEditable ? 'cursor-pointer hover:-translate-y-2' : 'hover:-translate-y-1.5'}`}
    >
      {/* Admin Mode Badge */}
      {isEditable && (
        <div className="absolute top-10 right-10 flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Edit3 className="w-3 h-3" /> 编辑模式
        </div>
      )}

      {/* Header: Large Bold Symbol */}
      <div className="mb-10">
        <h3 className="text-6xl font-[900] text-[#000000] dark:text-white tracking-tighter uppercase italic leading-none opacity-90 mb-5">{insight.symbol}</h3>
        <div className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
           {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
           {insight.status}
        </div>
      </div>

      {/* Content Section: Focused Content without CORE FOCUS label */}
      <div className="mb-12">
        <p className="text-[21px] font-black text-[#000000] dark:text-white/95 leading-[1.6] tracking-tight">
          {insight.focusPoints}
        </p>
      </div>

      {/* Strategy Section: Boxed Content without STRATEGY PLAN label */}
      <div className="flex-grow flex flex-col justify-end">
        <div className="strategy-box p-8">
           <p className="text-[17px] font-black text-[#000000] dark:text-white/90 leading-relaxed">
             {insight.strategy}
           </p>
        </div>
      </div>

      {/* Footer: Labels & Date in Pure Black */}
      <div className="mt-12 pt-8 border-t border-black/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-xl text-[10px] font-black text-[#000000] dark:text-gray-300 uppercase tracking-widest">
              {insight.category}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black text-[#000000] dark:text-white/60 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              {new Date(insight.updatedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })}
            </div>
         </div>
         
         {isEditable && (
           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(insight); }} 
                className="p-3 bg-white/20 hover:bg-amber-500 hover:text-white rounded-2xl text-gray-800 dark:text-gray-200 transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(insight.id); }} 
                className="p-3 bg-white/20 hover:bg-red-500 hover:text-white rounded-2xl text-gray-800 dark:text-gray-200 transition-all shadow-sm"
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
