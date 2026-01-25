
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { 
  Zap, 
  MessageSquare, 
  Newspaper, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Filter
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
    <div className="max-w-2xl mx-auto">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex bg-white/10 dark:bg-black/20 p-1.5 rounded-[2rem] gap-1 shadow-inner backdrop-blur-md">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-5 py-2 rounded-full text-[12px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl' 
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
           共 {filteredEntries.length} 条记录
        </div>
      </div>

      {/* Intelligence List */}
      <div className="relative pl-6 sm:pl-10 border-l border-white/10 space-y-6 pb-20">
        {filteredEntries.length === 0 ? (
          <div className="py-40 text-center opacity-20 italic font-black text-3xl text-white">
            No Intel Captured...
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const style = getTypeStyle(entry.type);
            
            return (
              <div key={entry.id} className="relative">
                {/* Timeline Dot/Icon */}
                <div className={`absolute -left-[45px] sm:-left-[57px] top-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 z-10 ${isExpanded ? 'bg-market-dark dark:bg-amber-500 text-white scale-110 shadow-lg' : 'bg-gray-800 text-gray-400 border border-white/5'}`}>
                   {React.cloneElement(style.icon as React.ReactElement, { className: 'w-4 h-4' })}
                </div>

                {/* Collapsible Card */}
                <div 
                  className={`bg-glass rounded-[2rem] overflow-hidden transition-all duration-500 ${isExpanded ? 'ring-2 ring-amber-500/30 shadow-2xl scale-[1.01]' : 'hover:bg-white/15'}`}
                >
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="p-6 sm:p-8 cursor-pointer flex flex-col items-start gap-3"
                  >
                    <div className="flex items-center gap-4">
                       <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-2 text-[10px] font-black text-[#12141c] dark:text-white uppercase tracking-widest">
                         <Clock className="w-3 h-3" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors text-[#12141c] dark:text-white`}>
                        {entry.title || "未命名简报"}
                      </h3>
                      <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                         <ChevronDown className={`w-6 h-6 ${isExpanded ? 'text-market-dark dark:text-amber-500' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-8 pb-10 pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-[16px] sm:text-[18px] text-black dark:text-white leading-relaxed font-black whitespace-pre-wrap">
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
                             查看来源情报 →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-5 py-2 bg-black/5 dark:bg-white/5 text-[10px] font-black text-gray-500 hover:text-amber-500 transition-all rounded-xl"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-5 py-2 bg-red-500/10 text-[10px] font-black text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl"
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
