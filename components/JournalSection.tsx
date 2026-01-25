
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* 顶部过滤器 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <div className="flex stadium-nav p-1 gap-1">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-6 py-2 rounded-full text-[11px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl' 
                : 'text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-black/30 dark:text-white/50 uppercase tracking-[0.3em]">
           {filteredEntries.length} SIGNALS
        </div>
      </div>

      {/* 瀑布流容器 */}
      <div className="relative pl-8 sm:pl-16 border-l border-black/10 dark:border-white/10 space-y-4 pb-32">
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
                {/* 时间轴图标 */}
                <div className={`absolute -left-[45px] sm:-left-[85px] top-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 z-10 border-2 border-[#0d1117] ${isExpanded ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-[#1a1d26] text-gray-500 group-hover/item:text-white'}`}>
                   <Icon className="w-4 h-4" />
                </div>

                {/* 卡片主体 */}
                <div 
                  className={`bg-glass rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-700 ${isExpanded ? 'shadow-2xl translate-x-1' : 'cursor-pointer hover:bg-white/30 dark:hover:bg-white/10'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="px-8 sm:px-12 py-4 sm:py-5 flex flex-col items-start">
                    <div className="flex items-center gap-4 mb-2">
                       <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-lg sm:text-2xl font-[900] italic tracking-tight leading-none uppercase text-black dark:text-white group-hover/item:text-amber-500 transition-colors duration-500 truncate`}>
                        {entry.title || "Untitled Signal"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1.5 rounded-xl bg-black/5 dark:bg-white/10 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white shadow-lg' : 'text-gray-400 group-hover/item:text-white'}`}
                      >
                         <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* 展开内容区 - 移除 max-height 限制和滚动 */}
                  <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-8 sm:px-12 pb-10 pt-2 border-t border-black/5 dark:border-white/5">
                      {/* 内容容器：移除最大高度和滚动，直接完全撑开 */}
                      <div className="strategy-box p-8 mb-8">
                        <p className="text-[15px] sm:text-[18px] text-black dark:text-white leading-loose font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/10 rounded-2xl text-[10px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest"
                           >
                             SOURCE →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-6 py-3 bg-black/5 dark:bg-white/10 text-[10px] font-black text-black/50 dark:text-white/50 hover:text-amber-500 dark:hover:text-white rounded-2xl transition-all"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-6 py-3 bg-red-500/10 text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
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
