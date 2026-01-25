
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
      case '新闻': return { Icon: Newspaper, color: 'text-blue-400', bg: 'bg-blue-500/10', badgeBg: 'bg-blue-500/20' };
      case '逻辑': return { Icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', badgeBg: 'bg-amber-500/20' };
      default: return { Icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', badgeBg: 'bg-purple-500/20' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* 顶部过滤器：重构为磨砂圆角胶囊风格 */}
      <div className="flex items-center justify-center sm:justify-between mb-12">
        <div className="flex items-center gap-1 p-1.5 bg-black/10 dark:bg-white/5 backdrop-blur-2xl rounded-full border border-white/5">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-black transition-all uppercase tracking-widest ${
                filterType === t 
                ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
           {filteredEntries.length} Capture Points
        </div>
      </div>

      <div className="relative pl-6 sm:pl-16 border-l border-white/5 space-y-4 pb-32">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-10 italic font-black text-4xl text-white tracking-tighter">
            Waiting for data...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            const Icon = style.Icon;
            
            return (
              <div key={entry.id} className="relative group/item">
                <div className={`absolute -left-[42px] sm:-left-[85px] top-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 z-10 border border-white/10 ${isExpanded ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-gray-500 group-hover/item:text-white'}`}>
                   <Icon className="w-3.5 h-3.5" />
                </div>

                <div 
                  className={`bg-glass border border-white/5 transition-all duration-700 ${isExpanded ? 'shadow-2xl translate-x-1' : 'cursor-pointer hover:bg-white/10'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="px-6 sm:px-12 py-5 flex flex-col items-start">
                    <div className="flex items-center gap-4 mb-2">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-1.5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                         <Clock className="w-3 h-3" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-base sm:text-xl font-black italic tracking-tight leading-none uppercase text-white group-hover/item:text-amber-500 transition-colors truncate`}>
                        {entry.title || "Observation Node"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1.5 rounded-lg bg-white/5 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white' : 'text-gray-500 group-hover/item:text-white'}`}
                      >
                         <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-6 sm:px-12 pb-10 pt-2 border-t border-white/5">
                      <div className="bg-white/5 p-6 sm:p-10 mb-8 rounded-2xl border border-white/5">
                        <p className="text-[14px] sm:text-[17px] text-white/80 leading-loose font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                         {entry.source && (
                           <a href={entry.source} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white/5 rounded-xl text-[9px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest">
                             Reference Source →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="px-5 py-2.5 bg-white/5 text-[9px] font-black text-white/40 hover:text-white rounded-lg transition-all">EDIT</button>
                             <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} className="px-5 py-2.5 bg-red-500/10 text-[9px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">DEL</button>
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
