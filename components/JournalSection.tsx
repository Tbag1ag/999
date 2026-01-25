
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
    <div className="max-w-5xl mx-auto px-4 sm:px-10">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
        <div className="flex stadium-nav p-1.5 gap-1">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-8 py-2.5 rounded-full text-[13px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl scale-105' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">
           TOTAL INTEL: {filteredEntries.length}
        </div>
      </div>

      {/* Intelligence List - Wider container */}
      <div className="relative pl-12 sm:pl-20 border-l-2 border-white/5 space-y-8 pb-32">
        {filteredEntries.length === 0 ? (
          <div className="py-60 text-center opacity-10 italic font-black text-5xl text-white tracking-tighter">
            No Market Signals Found
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            const Icon = style.Icon;
            
            return (
              <div key={entry.id} className="relative group/item">
                {/* Timeline Icon - Styled as a floating badge */}
                <div className={`absolute -left-[74px] sm:-left-[106px] top-6 w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 z-10 border-4 border-[#0d1117] ${isExpanded ? 'bg-amber-500 text-white scale-110 rotate-12 shadow-2xl shadow-amber-500/20' : 'bg-[#1a1d26] text-gray-500 group-hover/item:text-white group-hover/item:bg-gray-700'}`}>
                   <Icon className="w-6 h-6" />
                </div>

                {/* Card - Wider "Pill" shape */}
                <div 
                  className={`bg-white/85 dark:bg-white/10 backdrop-blur-[60px] rounded-[3.5rem] overflow-hidden transition-all duration-700 border border-white/5 ${isExpanded ? 'shadow-2xl ring-1 ring-white/10' : 'cursor-pointer hover:bg-white/95 dark:hover:bg-white/15'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="p-8 sm:p-10 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-5">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-2 text-[12px] font-black text-black/50 dark:text-white/40 uppercase tracking-widest">
                         <Clock className="w-4 h-4" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-8">
                      <h3 className={`text-2xl sm:text-3xl font-black tracking-tighter leading-tight text-[#000000] dark:text-white group-hover/item:text-amber-500 transition-colors duration-500`}>
                        {entry.title || "未命名简报"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-2 rounded-2xl bg-black/5 dark:bg-white/5 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white' : 'text-gray-400'}`}
                      >
                         <ChevronDown className="w-8 h-8" />
                      </button>
                    </div>
                  </div>

                  <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-10 pb-12 pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-[18px] sm:text-[20px] text-[#000000] dark:text-white/80 leading-relaxed font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="mt-12 flex items-center justify-between gap-6">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="group flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 rounded-2xl text-[11px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-[0.2em]"
                           >
                             ORIGINAL SOURCE <span className="group-hover:translate-x-1 transition-transform">→</span>
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-3">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-6 py-3 bg-black/5 dark:bg-white/5 text-[11px] font-black text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-2xl transition-all uppercase tracking-widest"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-6 py-3 bg-red-500/10 text-[11px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all uppercase tracking-widest"
                             >
                               DELETE
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
