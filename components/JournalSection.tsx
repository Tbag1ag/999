
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top Filter Bar - More Compact */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
        <div className="flex stadium-nav p-1 gap-1">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-lg' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
           {filteredEntries.length} SIGNALS
        </div>
      </div>

      {/* Intelligence List - Thinner cards & Tight layout */}
      <div className="relative pl-10 sm:pl-16 border-l border-white/5 space-y-4 pb-32">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-10 italic font-black text-4xl text-white tracking-tighter">
            Scanning...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            const Icon = style.Icon;
            
            return (
              <div key={entry.id} className="relative group/item">
                {/* Timeline Icon - Smaller & Sleeker */}
                <div className={`absolute -left-[61px] sm:-left-[89px] top-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-2 border-[#0d1117] ${isExpanded ? 'bg-amber-500 text-white scale-110' : 'bg-[#1a1d26] text-gray-500'}`}>
                   <Icon className="w-4 h-4" />
                </div>

                {/* Card - "Thin Pill" shape */}
                <div 
                  className={`bg-white/85 dark:bg-white/10 backdrop-blur-[60px] rounded-[2.5rem] overflow-hidden transition-all duration-500 border border-white/5 ${isExpanded ? 'shadow-2xl' : 'cursor-pointer hover:bg-white/95 dark:hover:bg-white/15'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="px-8 py-5 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.badgeBg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-black/40 dark:text-white/30 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug text-[#000000] dark:text-white group-hover/item:text-amber-500 transition-colors duration-500`}>
                        {entry.title || "Untitled Signal"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1.5 rounded-xl bg-black/5 dark:bg-white/5 transition-all duration-700 ${isExpanded ? 'rotate-180 bg-amber-500 text-white' : 'text-gray-400'}`}
                      >
                         <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div 
                    className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-8 pb-10 pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-[16px] sm:text-[17px] text-[#000000] dark:text-white/80 leading-relaxed font-bold whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between gap-4">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-5 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] font-black text-amber-500 hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest"
                           >
                             SOURCE →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-4 py-2.5 bg-black/5 dark:bg-white/5 text-[10px] font-black text-gray-500 hover:text-black dark:hover:text-white rounded-xl transition-all"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-4 py-2.5 bg-red-500/10 text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
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
