
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MarketInsight, Category, CompletionStatus, SortMode, JournalEntry, EntryType, AppNotification } from './types';
import { CATEGORIES, INITIAL_INSIGHTS } from './constants';
import MarketCard from './components/MarketCard';
import InsightForm from './components/InsightForm';
import JournalSection from './components/JournalSection';
import JournalForm from './components/JournalForm';
import NotificationCenter from './components/NotificationCenter';
import { sql, initDatabase } from './services/dbService';
import { 
  Plus, 
  LayoutGrid, 
  CalendarDays, 
  Search, 
  Lock,
  KeyRound,
  Zap,
  Filter
} from 'lucide-react';

const ADMIN_PASSWORD = "8888"; 

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onVerify: (pwd: string) => void }> = ({ isOpen, onClose, onVerify }) => {
  const [pwd, setPwd] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setPwd('');
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#12141c]/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 w-[90%] max-w-sm shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600"><KeyRound className="w-8 h-8" /></div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">管理模式解锁</h3>
            <p className="text-gray-400 font-bold text-[10px] sm:text-sm mt-1 uppercase tracking-widest">请输入身份密钥以继续</p>
          </div>
          <input ref={inputRef} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onVerify(pwd)} placeholder="••••" className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 focus:bg-white p-4 sm:p-5 rounded-2xl text-center text-xl sm:text-2xl font-black tracking-[1em] outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-bold" />
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 sm:py-4 px-4 rounded-2xl border border-gray-100 text-gray-400 font-black text-sm hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={() => onVerify(pwd)} className="flex-1 py-3 sm:py-4 px-4 rounded-2xl bg-[#12141c] text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200">确认解锁</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('category');
  const [showForm, setShowForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingInsight, setEditingInsight] = useState<MarketInsight | undefined>(undefined);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [clickCount, setClickCount] = useState(0);

  const fetchAllData = async () => {
    setLoading(true);
    if (sql) {
      try {
        await initDatabase();
        const [insData, jrData, noteData] = await Promise.all([
          sql`SELECT * FROM insights ORDER BY updated_at DESC`,
          sql`SELECT * FROM journals ORDER BY date DESC`,
          sql`SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50`
        ]);

        if (insData) {
          const mapped = insData.map((item: any) => ({
            id: item.id, symbol: item.symbol, category: item.category, status: item.status,
            focusPoints: item.focus_points, strategy: item.strategy, entryLevel: item.entry_level,
            updatedAt: Number(item.updated_at), completionStatus: item.completion_status
          }));
          setInsights(mapped);
        }
        if (jrData) {
          const mappedJr = jrData.map((j: any) => ({ ...j, date: Number(j.date) }));
          setJournals(mappedJr);
        }
        if (noteData) {
          const mappedNotes = noteData.map((n: any) => ({
            id: n.id, title: n.title, message: n.message,
            timestamp: Number(n.timestamp), isRead: n.is_read, type: n.type
          }));
          setNotifications(mappedNotes);
        }
      } catch (e) {
        console.error("Fetch error", e);
      }
    } else {
      const sI = localStorage.getItem('local_insights');
      setInsights(sI ? JSON.parse(sI) : INITIAL_INSIGHTS);
      const sJ = localStorage.getItem('local_journals');
      if (sJ) setJournals(JSON.parse(sJ));
      const sN = localStorage.getItem('local_notifications');
      if (sN) setNotifications(JSON.parse(sN));
    }
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  const addNotification = async (title: string, message: string, type: AppNotification['type']) => {
    const newNote: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title, message, timestamp: Date.now(), isRead: false, type
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO notifications (id, title, message, timestamp, is_read, type)
          VALUES (${newNote.id}, ${newNote.title}, ${newNote.message}, ${newNote.timestamp}, ${newNote.isRead}, ${newNote.type})
        `;
      } catch (e) { console.error("Notification DB Error", e); }
    }
    const updated = [newNote, ...notifications].slice(0, 50);
    setNotifications(updated);
    localStorage.setItem('local_notifications', JSON.stringify(updated));
  };

  const onVerifyAdmin = (pwd: string) => {
    if (pwd === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('is_admin', 'true');
      setShowLogin(false);
      setClickCount(0);
    } else {
      alert("密钥错误，身份验证失败。");
    }
  };

  const handleSaveInsight = async (data: Partial<MarketInsight>) => {
    const isNew = !editingInsight;
    const id = editingInsight ? editingInsight.id : Math.random().toString(36).substr(2, 9);
    const newInsight: MarketInsight = {
      id, symbol: data.symbol || '', category: data.category || '美股', status: data.status || '震荡',
      focusPoints: data.focusPoints || '', strategy: data.strategy || '', entryLevel: data.entryLevel || '',
      updatedAt: data.updatedAt || Date.now(), completionStatus: data.completionStatus || '进行中'
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO insights (id, symbol, category, status, focus_points, strategy, entry_level, updated_at, completion_status)
          VALUES (${newInsight.id}, ${newInsight.symbol}, ${newInsight.category}, ${newInsight.status}, ${newInsight.focusPoints}, ${newInsight.strategy}, ${newInsight.entryLevel}, ${newInsight.updatedAt}, ${newInsight.completionStatus})
          ON CONFLICT (id) DO UPDATE SET symbol = EXCLUDED.symbol, category = EXCLUDED.category, status = EXCLUDED.status, focus_points = EXCLUDED.focus_points, strategy = EXCLUDED.strategy, entry_level = EXCLUDED.entry_level, updated_at = EXCLUDED.updated_at, completion_status = EXCLUDED.completion_status
        `;
      } catch (e) { alert("同步失败"); return; }
    }
    if (isNew) addNotification(`新增洞察: ${newInsight.symbol}`, `策略：${newInsight.strategy.substring(0, 30)}...`, 'market');
    const updated = editingInsight ? insights.map(i => i.id === id ? newInsight : i) : [newInsight, ...insights];
    setInsights(updated);
    localStorage.setItem('local_insights', JSON.stringify(updated));
    setShowForm(false);
    setEditingInsight(undefined);
  };

  const handleSaveJournal = async (data: Partial<JournalEntry>) => {
    const isNew = !editingJournal;
    const id = editingJournal ? editingJournal.id : Math.random().toString(36).substr(2, 9);
    const newEntry: JournalEntry = {
      id, title: data.title || '', content: data.content || '', mood: data.mood || '冷静',
      type: (data.type as EntryType) || '随笔', source: data.source || '', date: data.date || Date.now()
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO journals (id, title, content, mood, type, source, date)
          VALUES (${newEntry.id}, ${newEntry.title}, ${newEntry.content}, ${newEntry.mood}, ${newEntry.type}, ${newEntry.source}, ${newEntry.date})
          ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, mood = EXCLUDED.mood, type = EXCLUDED.type, source = EXCLUDED.source, date = EXCLUDED.date
        `;
      } catch (e) { alert("同步失败"); return; }
    }
    if (isNew) addNotification(`捕捉新动态: ${newEntry.type}`, newEntry.title || newEntry.content.substring(0, 30), newEntry.type as any);
    const updated = editingJournal ? journals.map(j => j.id === id ? newEntry : j) : [newEntry, ...journals];
    setJournals(updated.sort((a, b) => b.date - a.date));
    localStorage.setItem('local_journals', JSON.stringify(updated));
    setShowJournalForm(false);
    setEditingJournal(undefined);
  };

  const handleDeleteInsight = async (id: string) => {
    if (!window.confirm("确定要删除这条观点吗？")) return;
    if (sql) { try { await sql`DELETE FROM insights WHERE id = ${id}`; } catch (e) { alert("删除失败"); return; } }
    const updated = insights.filter(i => i.id !== id);
    setInsights(updated);
    localStorage.setItem('local_insights', JSON.stringify(updated));
  };

  const handleDeleteJournal = async (id: string) => {
    if (!window.confirm("确定要删除这条记录吗？")) return;
    if (sql) { try { await sql`DELETE FROM journals WHERE id = ${id}`; } catch (e) { alert("删除失败"); return; } }
    const updated = journals.filter(j => j.id !== id);
    setJournals(updated);
    localStorage.setItem('local_journals', JSON.stringify(updated));
  };

  const handleToggleCompletionStatus = async (id: string) => {
    const item = insights.find(i => i.id === id);
    if (!item) return;
    const statuses: CompletionStatus[] = ['进行中', '已完成', '已失效'];
    const nextStatus = statuses[(statuses.indexOf(item.completionStatus) + 1) % statuses.length];
    const newTime = Date.now();
    if (sql) { try { await sql`UPDATE insights SET completion_status = ${nextStatus}, updated_at = ${newTime} WHERE id = ${id}`; } catch (e) { return; } }
    setInsights(prev => prev.map(i => i.id === id ? { ...i, completionStatus: nextStatus, updatedAt: newTime } : i));
  };

  const handleMarkAsRead = async (id: string) => {
    if (sql) { try { await sql`UPDATE notifications SET is_read = TRUE WHERE id = ${id}`; } catch (e) {} }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAllNotifications = async () => {
    if (!window.confirm("确定清除所有消息通知吗？")) return;
    if (sql) { try { await sql`DELETE FROM notifications`; } catch (e) {} }
    setNotifications([]);
    localStorage.removeItem('local_notifications');
  };

  const handleDeleteNotification = async (id: string) => {
    if (sql) { try { await sql`DELETE FROM notifications WHERE id = ${id}`; } catch (e) {} }
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('local_notifications', JSON.stringify(updated));
  };

  const filteredInsights = useMemo(() => {
    let result = insights;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(i => i.symbol.toLowerCase().includes(q) || i.focusPoints.toLowerCase().includes(q));
    }
    if (activeCategory !== '全部') result = result.filter(i => i.category === activeCategory);
    if (selectedMonth) result = result.filter(i => `${new Date(i.updatedAt).getFullYear()}年${new Date(i.updatedAt).getMonth() + 1}月` === selectedMonth);
    return result;
  }, [insights, activeCategory, selectedMonth, searchQuery]);

  const { activeItems, archivedItems } = useMemo(() => ({
    activeItems: filteredInsights.filter(i => i.completionStatus === '进行中'),
    archivedItems: filteredInsights.filter(i => i.completionStatus !== '进行中')
  }), [filteredInsights]);

  const groupedInsights = useMemo(() => {
    const groups: { [label: string]: MarketInsight[] } = {};
    activeItems.forEach(insight => {
      let label = insight.category;
      if (sortMode === 'timeline') {
        const date = new Date(insight.updatedAt);
        label = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(insight);
    });

    return Object.entries(groups).sort((a, b) => {
      if (sortMode === 'category') return CATEGORIES.indexOf(a[0] as any) - CATEGORIES.indexOf(b[0] as any);
      return b[1][0].updatedAt - a[1][0].updatedAt;
    });
  }, [activeItems, sortMode]);

  const timelineMonthGroups = useMemo(() => {
    const groups: { [key: string]: number } = {};
    insights.forEach(i => {
      const date = new Date(i.updatedAt);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [insights]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 pb-20">
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-4 sm:px-8 h-[72px]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-full gap-4 sm:gap-8">
          <div onClick={() => !isAdmin && setClickCount(c => c+1 >= 5 ? (setShowLogin(true), 0) : c+1)} className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer select-none active:scale-90 transition-transform">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${isAdmin ? 'bg-amber-500 shadow-xl shadow-amber-200 animate-pulse' : 'bg-[#12141c]'}`}>
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#12141c] tracking-tighter">市场周刊</h1>
          </div>
          
          <div className="flex-grow flex items-center gap-4 max-w-3xl">
            <div className="relative group flex-grow">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input type="text" className="w-full bg-gray-100/60 border border-transparent focus:bg-white focus:border-gray-200 py-2 sm:py-3 pl-9 sm:pl-11 pr-4 sm:pr-10 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none transition-all placeholder:text-gray-400" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={handleMarkAsRead} 
              onClearAll={handleClearAllNotifications} 
              onDelete={handleDeleteNotification} 
            />
            {isAdmin && (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100">
                <button onClick={() => sortMode === 'journal' ? setShowJournalForm(true) : setShowForm(true)} className="bg-[#12141c] text-white flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:scale-105 transition-all shadow-xl shadow-gray-200">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-black">投递</span>
                </button>
                <button onClick={() => { setIsAdmin(false); localStorage.removeItem('is_admin'); }} className="p-2 sm:p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Lock className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full flex flex-col lg:flex-row gap-8 lg:gap-16">
        <aside className="lg:w-64 space-y-8 lg:space-y-12 shrink-0">
          <div className="lg:sticky lg:top-[104px] space-y-6 lg:space-y-10">
            {/* 移动端水平导航菜单 */}
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                  <button onClick={() => setSortMode('category')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-black flex items-center gap-3 transition-all ${sortMode !== 'journal' ? 'bg-[#12141c] text-white shadow-xl shadow-gray-200' : 'text-gray-500 hover:bg-gray-100 bg-gray-50/50'}`}>
                    <LayoutGrid className="w-4 h-4" /> 每日洞察
                  </button>
                  <button onClick={() => setSortMode('journal')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-black flex items-center gap-3 transition-all ${sortMode === 'journal' ? 'bg-amber-500 text-white shadow-xl shadow-amber-200' : 'text-gray-500 hover:bg-gray-100 bg-gray-50/50'}`}>
                    <Zap className="w-4 h-4" /> 信息捕捉瀑布流
                  </button>
              </div>
            </div>
            
            {(sortMode !== 'journal') && (
              <div className="hidden lg:block">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> 历史回溯</h3>
                <div className="space-y-1">
                  <button onClick={() => setSelectedMonth(null)} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[14px] font-black flex items-center justify-between ${selectedMonth === null ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <span>全部日期</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/50">{insights.length}</span>
                  </button>
                  {timelineMonthGroups.map(([month, count]) => (
                    <button key={month} onClick={() => setSelectedMonth(month)} className={`w-full text-left px-4 py-3.5 rounded-2xl text-[14px] font-black flex items-center justify-between ${selectedMonth === month ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}>
                      <span>{month}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/50">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-grow">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-6xl font-black text-[#12141c] tracking-tighter leading-tight italic mb-6 sm:mb-10">
              {sortMode === 'journal' ? <>信息捕捉<br className="hidden sm:block" />瀑布流。</> : <>追踪行情，<br className="hidden sm:block" />每日洞察。</>}
            </h2>

            {sortMode !== 'journal' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar w-full sm:w-auto">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-black whitespace-nowrap transition-all ${
                        activeCategory === cat 
                          ? 'bg-[#12141c] text-white shadow-xl shadow-gray-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center p-1.5 bg-gray-100 rounded-[1.25rem] shrink-0 self-end sm:self-auto">
                   <button 
                     onClick={() => setSortMode('category')}
                     className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[1rem] text-[12px] sm:text-[14px] font-black transition-all ${sortMode === 'category' ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <Filter className="w-4 h-4" /> 类别
                   </button>
                   <button 
                     onClick={() => setSortMode('timeline')}
                     className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[1rem] text-[12px] sm:text-[14px] font-black transition-all ${sortMode === 'timeline' ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <CalendarDays className="w-4 h-4" /> 时间
                   </button>
                </div>
              </div>
            )}
          </div>

          {sortMode === 'journal' ? (
            <JournalSection entries={journals} isAdmin={isAdmin} onEdit={(j) => { setEditingJournal(j); setShowJournalForm(true); }} onDelete={handleDeleteJournal} />
          ) : (
            <div className="space-y-16 sm:space-y-24">
              {groupedInsights.map(([groupLabel, groupItems]) => (
                <section key={groupLabel}>
                  <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <span className="text-[12px] sm:text-[14px] font-black tracking-widest uppercase bg-[#12141c] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl">{groupLabel}</span>
                    <div className="flex-grow h-[1px] bg-gray-100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                    {groupItems.map(i => <MarketCard key={i.id} insight={i} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={handleDeleteInsight} onToggleCompletion={handleToggleCompletionStatus} isEditable={isAdmin} />)}
                  </div>
                </section>
              ))}
              {archivedItems.length > 0 && (
                <div className="mt-24 sm:mt-40 pt-12 sm:pt-20 border-t border-gray-100 opacity-50 hover:opacity-100 transition-opacity">
                   <h3 className="text-xl sm:text-2xl font-black mb-8 sm:mb-12 italic">历史已归档</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                    {archivedItems.map(i => <MarketCard key={i.id} insight={i} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={handleDeleteInsight} onToggleCompletion={handleToggleCompletionStatus} isEditable={isAdmin} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showForm && isAdmin && <InsightForm initialData={editingInsight} onSave={handleSaveInsight} onCancel={() => { setShowForm(false); setEditingInsight(undefined); }} />}
      {showJournalForm && isAdmin && <JournalForm initialData={editingJournal} onSave={handleSaveJournal} onCancel={() => { setShowJournalForm(false); setEditingJournal(undefined); }} />}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onVerify={onVerifyAdmin} />
    </div>
  );
};

export default App;
