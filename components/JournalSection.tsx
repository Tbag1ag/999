
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { Trash2, Edit3, Link, MessageSquare, Newspaper, Zap, X, Check } from 'lucide-react';

interface JournalSectionProps {
  entries: JournalEntry[];
  isAdmin: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const getTypeStyles = (type?: EntryType) => {
  const baseBorder = 'border-2 border-gray-100/80 dark:border-white/10';
  switch (type) {
    case '新闻':
      return {
        cardBg: 'bg-blue-50/30 dark:bg-blue-900/10',
        cardBorder: baseBorder,
        iconBg: 'bg-blue-500',
        iconText: 'text-white',
        tagBg: 'bg-blue-100 dark:bg-blue-900/30',
        tagText: 'text-blue-600 dark:text-blue-400',
        hoverShadow: 'group-hover:shadow-blue-200/40 dark:group-hover:shadow-none',
        accentColor: 'text-blue-500'
      };
    case '逻辑':
      return {
        cardBg: 'bg-amber-50/30 dark:bg-amber-900/10',
        cardBorder: baseBorder,
        iconBg: 'bg-amber-500',
        iconText: 'text-white',
        tagBg: 'bg-amber-100 dark:bg-amber-900/30',
        tagText: 'text-amber-700 dark:text-amber-400',
        hoverShadow: 'group-hover:shadow-amber-200/40 dark:group-hover:shadow-none',
        accentColor: 'text-amber-600'
      };
    case '随笔':
    default:
      return {
        cardBg: 'bg-purple-50/30 dark:bg-purple-900/10',
        cardBorder: baseBorder,
        iconBg: 'bg-purple-500',
        iconText: 'text-white',
        tagBg: 'bg-purple-100 dark:bg-purple-900/30',
        tagText: 'text-purple-600 dark:text-purple-400',
        hoverShadow: 'group-hover:shadow-purple-200/40 dark:group-hover:shadow-none',
        accentColor: 'text-purple-500'
      };
  }
};

const TypeIcon = ({ type }: { type?: EntryType }) => {
  switch (type) {
    case '新闻': return <Newspaper className="w-4 h-4" />;
    case '逻辑': return <Zap className="w-4 h-4" />;
    default: return <MessageSquare className="w-4 h-4" />;
  }
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return <><span className="font-bold text-gray-900 dark:text-white">1</span> 分钟内</>;
  
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return <><span className="font-bold text-gray-900 dark:text-white">{mins}</span> 分钟前</>;
  }
  
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return <><span className="font-bold text-gray-900 dark:text-white">{hours}</span> 小时前</>;
  }

  const date = new Date(timestamp);
  const isThisYear = date.getFullYear() === new Date().getFullYear();
  
  return isThisYear 
    ? date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const JournalSection: React.FC<JournalSectionProps> = ({ entries, isAdmin, onEdit, onDelete }) => {
  const [activeFilter, setActiveFilter] = useState<EntryType | '全部'>('全部');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const filters: (EntryType | '全部')[] = ['全部', '随笔', '新闻', '逻辑'];

  const filteredEntries = useMemo(() => {
    if (activeFilter === '全部') return entries;
    return entries.filter(e => e.type === activeFilter);
  }, [entries, activeFilter]);

  return (
    <div className="max-w-3xl mx-auto pb-32 px-4 sm:px-0 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-[13px] font-black transition-all whitespace-nowrap ${
              activeFilter === f 
                ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-lg shadow-gray-200 dark:shadow-none' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest pl-4 hidden sm:block">
          共 {filteredEntries.length} 条记录
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 opacity-30 italic font-serif text-xl dark:text-gray-400">
          暂无相关记录...
        </div>
      ) : (
        <div className="relative space-y-8">
          <div className="absolute left-0 md:-left-12 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent hidden md:block" />

          {filteredEntries.map((entry, index) => {
            const styles = getTypeStyles(entry.type);
            const isConfirming = confirmDeleteId === entry.id;

            return (
              <div 
                key={entry.id} 
                className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute -left-[51.5px] top-[26px] w-2 h-2 rounded-full bg-white dark:bg-[#0f1117] border-2 border-gray-200 dark:border-white/10 hidden md:block z-10 transition-colors group-hover:border-[#12141c] dark:group-hover:border-amber-500`} />

                <div className={`bg-white dark:bg-[#1a1d26] rounded-[2.5rem] ${styles.cardBorder} p-8 shadow-sm transition-all duration-300 ${styles.cardBg} group-hover:shadow-xl group-hover:border-gray-200 dark:group-hover:border-white/20 group-hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg transition-all ${styles.iconBg} ${styles.iconText} group-hover:scale-110`}>
                        <TypeIcon type={entry.type} />
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${styles.tagBg} ${styles.tagText}`}>
                            {entry.type}
                          </span>
                          <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500">
                            {formatTime(entry.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
                        {!isConfirming ? (
                          <>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                              className="p-2 text-gray-400 dark:text-gray-600 hover:text-[#12141c] dark:hover:text-white hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all"
                              title="编辑"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(entry.id); }} 
                              className="p-2 text-gray-400 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-300">
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); setConfirmDeleteId(null); }} 
                              className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-all flex items-center gap-1.5 shadow-lg shadow-red-200 dark:shadow-none"
                            >
                              <Check className="w-3 h-3" /> 确认删除
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} 
                              className="p-1.5 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {entry.title && (
                    <h4 className="text-2xl font-black text-[#12141c] dark:text-white mb-4 tracking-tight leading-tight">
                      {entry.title}
                    </h4>
                  )}

                  <div className="relative">
                    <p className="text-[16px] leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>

                  {entry.source && (
                    <a 
                      href={entry.source.startsWith('http') ? entry.source : `https://${entry.source}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-6 flex items-center gap-2 w-fit px-4 py-2 rounded-xl cursor-pointer transition-all border-2 border-gray-100/50 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md hover:scale-[1.02] active:scale-95 shadow-sm group/link`}
                    >
                      <Link className={`w-3.5 h-3.5 ${styles.accentColor} group-hover/link:rotate-12 transition-transform`} />
                      <span className="text-[11px] font-bold truncate max-w-[180px] sm:max-w-[300px] text-gray-500 dark:text-gray-400">{entry.source}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JournalSection;
