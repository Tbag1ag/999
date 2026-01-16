
import React from 'react';
import { MarketInsight, AssetStatus, CompletionStatus } from '../types';
import { Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Activity, Target, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface MarketCardProps {
  insight: MarketInsight;
  onEdit: (insight: MarketInsight) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  isEditable?: boolean;
}

const getAssetStatusStyle = (status: AssetStatus) => {
  switch (status) {
    case '看涨': return { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100', icon: <TrendingUp className="w-4 h-4" /> };
    case '看跌': return { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100', icon: <TrendingDown className="w-4 h-4" /> };
    default: return { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100', icon: <Activity className="w-4 h-4" /> };
  }
};

const getCompletionStatusStyle = (status: CompletionStatus) => {
  switch (status) {
    case '已完成': return { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="w-3 h-3" /> };
    case '已失效': return { label: '已失效', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20', icon: <XCircle className="w-3 h-3" /> };
    default: return { label: '进行中', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: <Clock className="w-3 h-3" /> };
  }
};

const MarketCard: React.FC<MarketCardProps> = ({ insight, onEdit, onDelete, onToggleCompletion, isEditable = false }) => {
  const date = new Date(insight.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  const assetStyle = getAssetStatusStyle(insight.status);
  const completionStyle = getCompletionStatusStyle(insight.completionStatus);
  const isArchived = insight.completionStatus !== '进行中';

  return (
    <div className={`group relative bg-white dark:bg-[#1a1d26] border-2 border-gray-100/80 dark:border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-white/20 flex flex-col min-h-[420px] overflow-hidden ${isArchived ? 'opacity-80 hover:opacity-100' : ''}`}>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-3xl font-black text-[#12141c] dark:text-white tracking-tighter">{insight.symbol}</h3>
             <span className={`px-4 py-1 rounded-lg text-[14px] font-black uppercase tracking-wider ${assetStyle.bg} ${assetStyle.color}`}>
                {insight.status}
             </span>
          </div>
          <div className="flex items-center text-[12px] text-gray-400 dark:text-gray-500 font-bold gap-2">
            <Calendar className="w-3.5 h-3.5" /> {date}
          </div>
        </div>
        <button 
          onClick={() => isEditable && onToggleCompletion(insight.id)}
          disabled={!isEditable}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${completionStyle.bg} ${completionStyle.color} border-current/10 bg-white/50 dark:bg-white/5`}
        >
          {completionStyle.icon} {completionStyle.label}
        </button>
      </div>

      <div className="flex-grow space-y-6 relative z-10">
        <div>
          <div className="mb-2">
            <span className="inline-block px-1 bg-amber-100/80 dark:bg-amber-500/20 text-[18px] font-black text-[#12141c] dark:text-white uppercase tracking-widest">核心观察</span>
          </div>
          <p className="text-[15px] font-medium leading-relaxed text-gray-700 dark:text-gray-300">{insight.focusPoints}</p>
        </div>

        {insight.entryLevel && (
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Target className="w-4 h-4 text-gray-400 dark:text-gray-600" />
            <span className="text-[14px] font-black underline underline-offset-[6px] decoration-gray-100 dark:decoration-white/5 decoration-4">点位: {insight.entryLevel}</span>
          </div>
        )}

        <div className="pt-4 border-t border-gray-50 dark:border-white/5">
          <div className="mb-2">
            <span className="inline-block px-1 bg-amber-100/80 dark:bg-amber-500/20 text-[18px] font-black text-[#12141c] dark:text-white uppercase tracking-widest">应对策略</span>
          </div>
          <div className="flex items-start gap-3">
             <ChevronRight className={`w-4 h-4 mt-0.5 ${assetStyle.color}`} />
             <p className="text-[15px] font-bold text-[#12141c] dark:text-white leading-snug">{insight.strategy}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex justify-between items-center relative z-10">
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg">{insight.category}</span>
        {isEditable && (
          <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => onEdit(insight)} className="p-2 text-gray-400 dark:text-gray-600 hover:text-[#12141c] dark:hover:text-white rounded-xl"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete(insight.id)} className="p-2 text-gray-400 dark:text-gray-600 hover:text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketCard;
