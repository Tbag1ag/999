
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { 
  Zap, 
  MessageSquare, 
  Newspaper, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Clock
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

  const getTypeStyle = (type?: EntryType) => {
    switch (type) {
      case '新闻': return { icon: <Newspaper className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case '逻辑': return { icon: <Zap className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      default: return { icon: <MessageSquare className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-0">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex stadium-nav p-1.5 gap-1">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
           共 {filteredEntries.length} 条
        </div>
      </div>

      {/* Intelligence List */}
      <div className="relative pl-6 sm:pl-10 border-l border-white/10 space-y-6 pb-20">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-20 italic font-black text-3xl text-white">
            No Intel...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            
            return (
              <div key={entry.id} className="relative">
                {/* Timeline Dot/Icon */}
                <div className={`absolute -left-[45px] sm:-left-[57px] top-4 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${isExpanded ? 'bg-market-dark dark:bg-amber-500 text-white scale-110 shadow-xl' : 'bg-gray-800/80 text-gray-400 border border-white/5'}`}>
                   {React.cloneElement(style.icon as React.ReactElement, { className: 'w-4 h-4' })}
                </div>

                {/* Collapsible Card */}
                <div 
                  className={`bg-glass rounded-[2.5rem] overflow-hidden transition-all duration-700 ${isExpanded ? 'shadow-2xl' : 'cursor-pointer'}`}
                  onClick={() => !isExpanded && toggleExpand(entry.id)}
                >
                  <div className="p-6 sm:p-8 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-4">
                       <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-2 text-[11px] font-black text-[#000000] dark:text-white uppercase tracking-widest opacity-80">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-xl sm:text-2xl font-black tracking-tighter leading-tight text-[#000000] dark:text-white`}>
                        {entry.title || "未命名简报"}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                        className={`p-1 transition-all duration-500 ${isExpanded ? 'rotate-180 text-amber-500' : 'text-gray-400'}`}
                      >
                         <ChevronDown className={`w-6 h-6`} />
                      </button>
                    </div>
                  </div>

                  <div 
                    className={`transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-8 pb-10 pt-2 border-t border-black/5">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-[16px] sm:text-[18px] text-[#000000] dark:text-white/90 leading-relaxed font-black whitespace-pre-wrap tracking-tight">
                          {entry.content}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between gap-4">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[11px] font-black text-amber-500 hover:underline uppercase tracking-widest"
                           >
                             VIEW SOURCE →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-4 py-2 bg-black/5 dark:bg-white/5 text-[10px] font-black text-gray-700 dark:text-gray-300 rounded-xl"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-4 py-2 bg-red-500/10 text-[10px] font-black text-red-500 rounded-xl"
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
