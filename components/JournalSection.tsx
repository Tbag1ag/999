
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
    <div className="max-w-4xl mx-auto">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[2rem] gap-1 shadow-inner">
          {['全部', '随笔', '新闻', '逻辑'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-8 py-2.5 rounded-full text-[13px] font-black transition-all ${
                filterType === t 
                ? 'bg-market-dark text-white dark:bg-amber-500 shadow-xl' 
                : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black text-white/40 uppercase tracking-widest">
           共 {filteredEntries.length} 条记录
        </div>
      </div>

      {/* Intelligence List with Timeline Line */}
      <div className="relative pl-8 sm:pl-12 border-l-2 border-white/5 space-y-8 pb-20">
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
                <div className={`absolute -left-[45px] sm:-left-[61px] top-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 ${isExpanded ? 'bg-market-dark dark:bg-amber-500 text-white scale-110 shadow-lg' : 'bg-gray-800 text-gray-400 border border-white/5'}`}>
                   {style.icon}
                </div>

                {/* Collapsible Card */}
                <div 
                  className={`bg-glass rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 ${isExpanded ? 'border-amber-500/30 ring-1 ring-amber-500/10 shadow-2xl' : 'border-transparent hover:border-white/10'}`}
                >
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="p-8 sm:p-10 cursor-pointer flex flex-col items-start gap-4"
                  >
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                         {entry.type}
                       </span>
                       <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(entry.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                       </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-6">
                      <h3 className={`text-2xl sm:text-3xl font-black tracking-tighter leading-tight transition-colors text-[#12141c] dark:text-white`}>
                        {entry.title || "未命名简报"}
                      </h3>
                      <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                         <ChevronDown className={`w-8 h-8 ${isExpanded ? 'text-market-dark dark:text-amber-500' : 'text-gray-300'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content Area */}
                  <div 
                    className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <div className="px-10 pb-12 pt-4 border-t border-black/5 dark:border-white/5">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-[18px] sm:text-[20px] text-black dark:text-white leading-relaxed font-black whitespace-pre-wrap italic-none">
                          {entry.content}
                        </p>
                      </div>

                      <div className="mt-12 flex items-center justify-between gap-4">
                         {entry.source && (
                           <a 
                             href={entry.source} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[12px] font-black text-amber-500 hover:underline uppercase tracking-widest"
                           >
                             查看来源情报 →
                           </a>
                         )}
                         <div className="flex-grow"></div>
                         {isAdmin && (
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                               className="px-6 py-2.5 bg-gray-900/10 dark:bg-white/5 text-[11px] font-black text-gray-400 hover:text-amber-500 transition-all rounded-xl border border-white/5"
                             >
                               EDIT
                             </button>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
                               className="px-6 py-2.5 bg-red-500/10 text-[11px] font-black text-red-400 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-red-500/20"
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
