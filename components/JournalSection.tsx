
import React, { useState, useMemo } from 'react';
import { JournalEntry, EntryType } from '../types';
import { Trash2, Edit3, Link, MessageSquare, Newspaper, Zap } from 'lucide-react';

interface JournalSectionProps {
  entries: JournalEntry[];
  isAdmin: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const getTypeStyles = (type?: EntryType) => {
  switch (type) {
    case '新闻':
      return {
        cardBg: 'bg-blue-50/50',
        cardBorder: 'border-blue-100',
        iconBg: 'bg-blue-500',
        iconText: 'text-white',
        tagBg: 'bg-blue-100',
        tagText: 'text-blue-600',
        hoverShadow: 'group-hover:shadow-blue-100/50',
        accentColor: 'text-blue-500'
      };
    case '逻辑':
      return {
        cardBg: 'bg-amber-50/50',
        cardBorder: 'border-amber-100',
        iconBg: 'bg-amber-500',
        iconText: 'text-white',
        tagBg: 'bg-amber-100',
        tagText: 'text-amber-700',
        hoverShadow: 'group-hover:shadow-amber-100/50',
        accentColor: 'text-amber-600'
      };
    case '随笔':
    default:
      return {
        cardBg: 'bg-purple-50/50',
        cardBorder: 'border-purple-100',
        iconBg: 'bg-purple-500',
        iconText: 'text-white',
        tagBg: 'bg-purple-100',
        tagText: 'text-purple-600',
        hoverShadow: 'group-hover:shadow-purple-100/50',
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
  
  if (diff < 60000) return <><span className="font-bold text-gray-900">1</span> 分钟内</>;
  
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return <><span className="font-bold text-gray-900">{mins}</span> 分钟前</>;
  }
  
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return <><span className="font-bold text-gray-900">{hours}</span> 小时前</>;
  }

  const date = new Date(timestamp);
  const isThisYear = date.getFullYear() === new Date().getFullYear();
  
  return isThisYear 
    ? date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const JournalSection: React.FC<JournalSectionProps> = ({ entries, isAdmin, onEdit, onDelete }) => {
  const [activeFilter, setActiveFilter] = useState<EntryType | '全部'>('全部');
  const filters: (EntryType | '全部')[] = ['全部', '随笔', '新闻', '逻辑'];

  const filteredEntries = useMemo(() => {
    if (activeFilter === '全部') return entries;
    return entries.filter(e => e.type === activeFilter);
  }, [entries, activeFilter]);

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* 瀑布流分类导航 */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-[13px] font-black transition-all whitespace-nowrap ${
              activeFilter === f 
                ? 'bg-[#12141c] text-white shadow-lg shadow-gray-200' 
                : 'text-gray-400 hover:text-gray-900 bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto text-[10px] font-black text-gray-300 uppercase tracking-widest pl-4">
          共 {filteredEntries.length} 条记录
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 opacity-30 italic font-serif text-xl">
          暂无相关记录...
        </div>
      ) : (
        <div className="relative space-y-8">
          {/* 垂直时间线装饰 */}
          <div className="absolute left-0 md:-left-12 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent hidden md:block" />

          {filteredEntries.map((entry, index) => {
            const styles = getTypeStyles(entry.type);
            return (
              <div 
                key={entry.id} 
                className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* 时间点标记 */}
                <div className={`absolute -left-[51.5px] top-[26px] w-2 h-2 rounded-full bg-white border-2 border-gray-200 hidden md:block z-10 transition-colors group-hover:border-[#12141c]`} />

                <div className={`bg-white rounded-[2.5rem] border ${styles.cardBorder} p-8 shadow-sm transition-all duration-300 ${styles.cardBg} ${styles.hoverShadow} group-hover:shadow-2xl`}>
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
                          <span className="text-[12px] font-medium text-gray-400">
                            {formatTime(entry.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(entry)} className="p-2 text-gray-400 hover:text-[#12141c] hover:bg-white rounded-xl transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDelete(entry.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>

                  {entry.title && (
                    <h4 className="text-2xl font-black text-[#12141c] mb-4 tracking-tight leading-tight">
                      {entry.title}
                    </h4>
                  )}

                  <div className="relative">
                    <p className="text-[16px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                      {entry.content}
                    </p>
                    {entry.content.length > 300 && (
                       <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none group-hover:hidden" />
                    )}
                  </div>

                  {entry.source && (
                    <div className={`mt-6 flex items-center gap-2 w-fit px-4 py-2 rounded-xl cursor-pointer transition-all border ${styles.cardBorder} bg-white/50 hover:bg-white shadow-sm`}>
                      <Link className={`w-3.5 h-3.5 ${styles.accentColor}`} />
                      <span className="text-[11px] font-bold truncate max-w-[200px] text-gray-500">{entry.source}</span>
                    </div>
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
