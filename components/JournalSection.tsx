
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { 
  Zap, 
  MessageSquare, 
  Newspaper, 
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
      {/* 顶部过滤器：彻底移除药丸样式背景 */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/5 mb-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`relative px-4 sm:px-8 py-5 text-[11px] sm:text-[13px] font-black transition-all uppercase tracking-widest ${
                filterType === t 
                ? 'text-black dark:text-white' 
                : 'text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
              {filterType === t && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber-500 rounded-full animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.3em]">
           {filteredEntries.length} Capture Points
        </div>
      </div>

      <div className="relative pl-8 sm:pl-16 border-l border-black/10 dark:border-white/10 space-y-4 pb-32">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-10 italic font-black text-4xl text-black dark:text-white tracking-tighter">
            Waiting for data...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            const Icon = style.Icon;
            
            return (
              <div key={entry.id} className="relative group/item">
                <div className={`absolute -left-[45px] sm:-left-[85px] top-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 z-10 border-2 border-[#0d1117] ${isExpanded ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-black/5 dark:bg-[#1a1d26] text-gray-500 group-hover/item:text-white'}`}>
                   <Icon className="w-4 h-4" />
                </div>

                <div 
                  className={`bg-glass rounded-[2rem] overflow-hidden transition-all duration-700 border border-white/5 ${isExpanded ? 'shadow-2xl translate-x-1' : 'cursor-pointer hover:bg-white/30 dark:hover:bg-white/10'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="px-8 sm:px-12 py-5 flex flex-col items-start">
                    <div className="flex items-center gap-4 mb-2">
                       <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-black/40 dark:text-white/50 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-lg sm:text-2xl font-[900] italic tracking-tight leading-none uppercase text-black dark:text-white group-hover/item:text-amber-500 transition-colors duration-500 truncate`}>
                        {entry.title || "Observation Node"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1.5 rounded-xl bg-black/5 dark:bg-white/10 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white shadow-lg' : 'text-gray-400 group-hover/item:text-white'}`}
                      >
                         <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-8 sm:px-12 pb-10 pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="bg-black/5 dark:bg-white/5 p-8 mb-8 rounded-[2rem] border border-white/5">
                        <p className="text-[15px] sm:text-[18px] text-black dark:text-white leading-loose font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                         {entry.source && (
                           <a href={entry.source} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-black/5 dark:bg-white/10 rounded-xl text-[10px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest">
                             Reference Source →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="px-6 py-2.5 bg-black/5 dark:bg-white/5 text-[10px] font-black text-black/40 dark:text-white/40 hover:text-amber-500 dark:hover:text-white rounded-lg transition-all">EDIT</button>
                             <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} className="px-6 py-2.5 bg-red-500/10 text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">DEL</button>
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
