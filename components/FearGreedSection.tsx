
import React from 'react';
import { FearGreedIndex } from '../types';
import { Trash2, Edit3, Clock } from 'lucide-react';

interface FearGreedSectionProps {
  indices: FearGreedIndex[];
  isAdmin: boolean;
  onEdit: (index: FearGreedIndex) => void;
  onDelete: (id: string) => void;
}

const getScoreConfig = (score: number) => {
  // 分数越高越红（贪婪），越低越绿（恐惧）
  if (score >= 80) return { color: 'text-red-600', bg: 'bg-red-500', shadow: 'shadow-red-200', label: '极度贪婪', gradient: 'from-red-600 to-orange-500' };
  if (score >= 60) return { color: 'text-orange-600', bg: 'bg-orange-500', shadow: 'shadow-orange-200', label: '贪婪', gradient: 'from-orange-500 to-amber-500' };
  if (score >= 40) return { color: 'text-amber-600', bg: 'bg-amber-500', shadow: 'shadow-amber-200', label: '中立', gradient: 'from-amber-500 to-yellow-500' };
  if (score >= 20) return { color: 'text-emerald-600', bg: 'bg-emerald-500', shadow: 'shadow-emerald-200', label: '恐惧', gradient: 'from-emerald-500 to-green-500' };
  return { color: 'text-green-600', bg: 'bg-green-600', shadow: 'shadow-green-200', label: '极度恐惧', gradient: 'from-green-600 to-teal-500' };
};

const FearGreedSection: React.FC<FearGreedSectionProps> = ({ indices, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="max-w-[1400px] mx-auto pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {indices.length === 0 ? (
          <div className="col-span-full py-48 text-center opacity-20 italic font-serif text-5xl dark:text-white">
            Market Pulse Idle...
          </div>
        ) : (
          indices.map((index) => {
            const config = getScoreConfig(index.score);
            return (
              <div 
                key={index.id} 
                className="group relative bg-white dark:bg-[#1a1d26] rounded-[4rem] p-12 sm:p-14 border-4 border-black/5 dark:border-white/5 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_80px_120px_-30px_rgba(0,0,0,0.2)] dark:hover:shadow-none overflow-hidden"
              >
                {/* 动态背景光晕 */}
                <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${config.bg}`} />
                
                <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-[400px]">
                  {/* 顶部标题与操作 */}
                  <div className="w-full flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Sentiment</span>
                      <h3 className="text-5xl font-black text-[#12141c] dark:text-white tracking-tighter italic">{index.symbol}</h3>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(index)} className="p-3 bg-gray-50 dark:bg-white/5 text-gray-300 hover:text-amber-500 rounded-2xl transition-all"><Edit3 className="w-5 h-5" /></button>
                        <button onClick={() => onDelete(index.id)} className="p-3 bg-gray-50 dark:bg-white/5 text-gray-300 hover:text-red-500 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    )}
                  </div>

                  {/* 大字报分数展示 */}
                  <div className="relative flex flex-col items-center group/score py-12">
                    <div className={`text-[180px] sm:text-[220px] font-black leading-none tracking-tighter ${config.color} animate-shimmer bg-clip-text transition-all duration-700 group-hover/score:scale-110 select-none`}>
                      {index.score}
                    </div>
                    <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-10 py-3 rounded-full ${config.bg} text-white text-[16px] font-black uppercase tracking-[0.2em] shadow-2xl ${config.shadow} whitespace-nowrap`}>
                      {config.label}
                    </div>
                  </div>

                  {/* 底部信息栏 */}
                  <div className="w-full mt-auto pt-10 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-300 dark:text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Last Update: {new Date(index.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FearGreedSection;
