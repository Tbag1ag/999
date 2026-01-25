
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { 
  Zap, 
  MessageSquare, 
  Newspaper, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Clock,
  LucideIcon
} from 'lucide-react';

interface JournalSectionProps {
  entries: JournalEntry[];
  isAdmin: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const JournalSection: React.FC<JournalSectionProps> = ({ entries, isAdmin, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<EntryType | '全部'>('全部');

  const filteredEntries = useMemo(() => {
    return entries.filter(e => filterType === '全部' || e.type === filterType);
  }, [entries, filterType]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeStyle = (type?: EntryType): { Icon: LucideIcon, color: string, bg: string, badgeBg: string } => {
    switch (type) {
      case '新闻': return { Icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10', badgeBg: 'bg-blue-500/20' };
      case '逻辑': return { Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', badgeBg: 'bg-amber-500/20' };
      default: return { Icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', badgeBg: 'bg-purple-500/20' };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* 顶部过滤器 - 稍微缩小了比例 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex stadium-nav p-1 gap-1">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-5 py-1.5 rounded-full text-[11px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl' 
                : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black text-black/30 dark:text-white/50 uppercase tracking-[0.3em]">
           {filteredEntries.length} SIGNALS
        </div>
      </div>

      {/* 瀑布流容器 - 间距从 space-y-6 缩减到 space-y-3 */}
      <div className="relative pl-8 sm:pl-12 border-l border-black/10 dark:border-white/10 space-y-3 pb-32">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-10 italic font-black text-4xl text-black dark:text-white tracking-tighter">
            Scanning...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            const Icon = style.Icon;
            
            return (
              <div key={entry.id} className="relative group/item">
                {/* 时间轴图标 - 尺寸缩小 */}
                <div className={`absolute -left-[45px] sm:-left-[61px] top-3.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 z-10 border-2 border-[#0d1117] ${isExpanded ? 'bg-amber-500 text-white scale-110' : 'bg-[#1a1d26] text-gray-500 group-hover/item:text-white'}`}>
                   <Icon className="w-3.5 h-3.5" />
                </div>

                {/* 卡片主体 - py 从 7 缩减到 3.5 */}
                <div 
                  className={`bg-glass rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-700 ${isExpanded ? 'shadow-2xl translate-x-1' : 'cursor-pointer hover:bg-white/30 dark:hover:bg-white/10'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="px-6 sm:px-8 py-3.5 flex flex-col items-start">
                    <div className="flex items-center gap-3 mb-1.5">
                       <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest">
                         <Clock className="w-3 h-3" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-4">
                      <h3 className={`text-base sm:text-xl font-[900] italic tracking-tight leading-none uppercase text-black dark:text-white group-hover/item:text-amber-500 transition-colors duration-500 truncate`}>
                        {entry.title || "Untitled Signal"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1 rounded-lg bg-black/5 dark:bg-white/10 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white' : 'text-gray-400 group-hover/item:text-white'}`}
                      >
                         <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 展开内容 */}
                  <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-8 pb-8 pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="strategy-box p-6 mb-6">
                        <p className="text-[14px] sm:text-[16px] text-black dark:text-white leading-relaxed font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 rounded-xl text-[9px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest"
                           >
                             SOURCE →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-4 py-2 bg-black/5 dark:bg-white/10 text-[9px] font-black text-black/50 dark:text-white/50 hover:text-amber-500 dark:hover:text-white rounded-xl transition-all"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-4 py-2 bg-red-500/10 text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                             >
                               DEL
                             </button>
                           </div>
                         )}
                      </div>
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

export default JournalSection;
