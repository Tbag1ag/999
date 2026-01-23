
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MarketInsight, Category, CompletionStatus, SortMode, JournalEntry, EntryType, AppNotification, FearGreedIndex, PositionEntry, PositionStatus, PositionSide } from './types';
import { CATEGORIES, INITIAL_INSIGHTS } from './constants';
import MarketCard from './components/MarketCard';
import InsightForm from './components/InsightForm';
import JournalSection from './components/JournalSection';
import JournalForm from './components/JournalForm';
import FearGreedSection from './components/FearGreedSection';
import IndexForm from './components/IndexForm';
import PositionSection from './components/PositionSection';
import PositionForm from './components/PositionForm';
import NotificationCenter from './components/NotificationCenter';
import { sql, initDatabase } from './services/dbService';
import { 
  Plus, 
  LayoutGrid, 
  Search, 
  Lock,
  KeyRound,
  Zap,
  Sun,
  Moon,
  Thermometer,
  TrendingUp,
  History,
  Calendar
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
      <div className="bg-white dark:bg-[#1a1d26] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 w-[90%] max-w-sm shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600"><KeyRound className="w-8 h-8" /></div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">管理模式解锁</h3>
            <p className="text-gray-400 font-bold text-[10px] sm:text-sm mt-1 uppercase tracking-widest">请输入身份密钥以继续</p>
          </div>
          <input ref={inputRef} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onVerify(pwd)} placeholder="••••" className="w-full bg-gray-50 dark:bg-[#0f1117] border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-[#1a1d26] p-4 sm:p-5 rounded-2xl text-center text-xl sm:text-2xl font-black tracking-[1em] outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-bold dark:text-white" />
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 sm:py-4 px-4 rounded-2xl border border-gray-100 dark:border-white/5 text-gray-400 font-black text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">取消</button>
            <button onClick={() => onVerify(pwd)} className="flex-1 py-3 sm:py-4 px-4 rounded-2xl bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none">确认解锁</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [indices, setIndices] = useState<FearGreedIndex[]>([]);
  const [positions, setPositions] = useState<PositionEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('category');
  
  const [showForm, setShowForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showIndexForm, setShowIndexForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const [editingInsight, setEditingInsight] = useState<MarketInsight | undefined>(undefined);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>(undefined);
  const [editingIndex, setEditingIndex] = useState<FearGreedIndex | undefined>(undefined);
  const [editingPosition, setEditingPosition] = useState<PositionEntry | undefined>(undefined);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchAllData = async () => {
    setLoading(true);
    if (sql) {
      try {
        await initDatabase();
        const [insData, jrData, indexData, posData, noteData] = await Promise.all([
          sql`SELECT * FROM insights ORDER BY updated_at DESC`,
          sql`SELECT * FROM journals ORDER BY date DESC`,
          sql`SELECT * FROM indices ORDER BY updated_at DESC`,
          sql`SELECT * FROM positions ORDER BY updated_at DESC`,
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
        if (indexData) {
          const mappedIndices = indexData.map((a: any) => ({ ...a, updatedAt: Number(a.updated_at) }));
          setIndices(mappedIndices);
        }
        if (posData) {
          const mappedPos = posData.map((p: any) => ({
            id: p.id, symbol: p.symbol, category: p.category || '美股', signalType: p.signal_type, 
            side: (p.side || 'Buy') as PositionSide,
            status: (p.status || '观察中') as PositionStatus,
            signalTime: Number(p.signal_time), entryPrice: Number(p.entry_price || 0), 
            investedAmount: Number(p.invested_amount || 0),
            yieldRate: Number(p.yield_rate || 0),
            yieldAmount: Number(p.yield_amount || 0),
            updatedAt: Number(p.updated_at)
          }));
          setPositions(mappedPos);
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
      setInsights(JSON.parse(localStorage.getItem('local_insights') || JSON.stringify(INITIAL_INSIGHTS)));
      setJournals(JSON.parse(localStorage.getItem('local_journals') || '[]'));
      setIndices(JSON.parse(localStorage.getItem('local_indices') || '[]'));
      setPositions(JSON.parse(localStorage.getItem('local_positions') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('local_notifications') || '[]'));
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
    setNotifications(prev => [newNote, ...prev].slice(0, 50));
  };

  const handleSavePosition = async (data: Partial<PositionEntry>) => {
    const isNew = !editingPosition;
    const id = editingPosition ? editingPosition.id : Math.random().toString(36).substr(2, 9);
    const newPos: PositionEntry = {
      id, symbol: data.symbol || '', category: data.category || '美股', signalType: data.signalType || 'Short Term', side: data.side || 'Buy',
      status: data.status || '观察中', signalTime: data.signalTime || Date.now(),
      entryPrice: data.entryPrice || 0, 
      investedAmount: data.investedAmount || 0,
      yieldRate: data.yieldRate || 0, 
      yieldAmount: data.yieldAmount || 0,
      updatedAt: data.updatedAt || Date.now()
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO positions (id, symbol, category, signal_type, side, status, signal_time, entry_price, invested_amount, yield_rate, yield_amount, updated_at)
          VALUES (${newPos.id}, ${newPos.symbol}, ${newPos.category}, ${newPos.signalType}, ${newPos.side}, ${newPos.status}, ${newPos.signalTime}, ${newPos.entryPrice}, ${newPos.investedAmount}, ${newPos.yieldRate}, ${newPos.yieldAmount}, ${newPos.updatedAt})
          ON CONFLICT (id) DO UPDATE SET symbol = EXCLUDED.symbol, category = EXCLUDED.category, signal_type = EXCLUDED.signal_type, side = EXCLUDED.side, status = EXCLUDED.status, signal_time = EXCLUDED.signal_time, entry_price = EXCLUDED.entry_price, invested_amount = EXCLUDED.invested_amount, yield_rate = EXCLUDED.yield_rate, yield_amount = EXCLUDED.yield_amount, updated_at = EXCLUDED.updated_at
        `;
      } catch (e) { alert("同步失败"); return; }
    }
    if (isNew) addNotification(`仓位追踪: ${newPos.symbol}`, `${newPos.status} 收益额: $${newPos.yieldAmount}`, 'position');
    setPositions(prev => {
      const updated = editingPosition ? prev.map(p => p.id === id ? newPos : p) : [newPos, ...prev];
      localStorage.setItem('local_positions', JSON.stringify(updated));
      return updated;
    });
    setShowPositionForm(false);
    setEditingPosition(undefined);
  };

  const handleDeletePosition = async (id: string) => {
    if (!window.confirm("确定删除此交易项？")) return;
    if (sql) {
      try {
        await sql`DELETE FROM positions WHERE id = ${id}`;
      } catch (e) {
        console.error("Database deletion failed", e);
      }
    }
    setPositions(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('local_positions', JSON.stringify(updated));
      return updated;
    });
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
    setInsights(prev => {
      const updated = editingInsight ? prev.map(i => i.id === id ? newInsight : i) : [newInsight, ...prev];
      localStorage.setItem('local_insights', JSON.stringify(updated));
      return updated;
    });
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
    setJournals(prev => {
      const updated = editingJournal ? prev.map(j => j.id === id ? newEntry : j) : [newEntry, ...prev];
      const sorted = updated.sort((a, b) => b.date - a.date);
      localStorage.setItem('local_journals', JSON.stringify(sorted));
      return sorted;
    });
    setShowJournalForm(false);
    setEditingJournal(undefined);
  };

  const handleSaveIndex = async (data: Partial<FearGreedIndex>) => {
    const isNew = !editingIndex;
    const id = editingIndex ? editingIndex.id : Math.random().toString(36).substr(2, 9);
    const newIndex: FearGreedIndex = {
      id, symbol: data.symbol || '', score: data.score || 50, updatedAt: data.updatedAt || Date.now()
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO indices (id, symbol, score, updated_at)
          VALUES (${newIndex.id}, ${newIndex.symbol}, ${newIndex.score}, ${newIndex.updatedAt})
          ON CONFLICT (id) DO UPDATE SET symbol = EXCLUDED.symbol, score = EXCLUDED.score, updated_at = EXCLUDED.updated_at
        `;
      } catch (e) { alert("同步失败"); return; }
    }
    if (isNew) addNotification(`情绪指数更新: ${newIndex.symbol}`, `${newIndex.symbol} 当前分数: ${newIndex.score}`, 'index' as any);
    setIndices(prev => {
      const updated = editingIndex ? prev.map(i => i.id === id ? newIndex : i) : [newIndex, ...prev];
      localStorage.setItem('local_indices', JSON.stringify(updated));
      return updated;
    });
    setShowIndexForm(false);
    setEditingIndex(undefined);
  };

  const handleDeleteIndex = async (id: string) => {
    if (!window.confirm("确定要删除这条指数记录吗？")) return;
    if (sql) { try { await sql`DELETE FROM indices WHERE id = ${id}`; } catch (e) { return; } }
    setIndices(prev => prev.filter(a => a.id !== id));
  };

  const handleDeleteInsight = async (id: string) => {
    if (!window.confirm("确定要删除这条观点吗？")) return;
    if (sql) { try { await sql`DELETE FROM insights WHERE id = ${id}`; } catch (e) { return; } }
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleDeleteJournal = async (id: string) => {
    if (sql) { try { await sql`DELETE FROM journals WHERE id = ${id}`; } catch (e) { return; } }
    setJournals(prev => prev.filter(j => j.id !== id));
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
  };

  const handleDeleteNotification = async (id: string) => {
    if (sql) { try { await sql`DELETE FROM notifications WHERE id = ${id}`; } catch (e) {} }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleModeSwitch = (mode: SortMode) => {
    setSortMode(mode);
    setSelectedMonth(null);
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

  const filteredJournals = useMemo(() => {
    let result = journals;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(j => j.title?.toLowerCase().includes(q) || j.content.toLowerCase().includes(q));
    }
    if (selectedMonth) {
      result = result.filter(j => `${new Date(j.date).getFullYear()}年${new Date(j.date).getMonth() + 1}月` === selectedMonth);
    }
    return result;
  }, [journals, selectedMonth, searchQuery]);

  const groupedInsights = useMemo(() => {
    const groups: { [label: string]: MarketInsight[] } = {};
    filteredInsights.filter(i => i.completionStatus === '进行中').forEach(insight => {
      let label = insight.category;
      if (!groups[label]) groups[label] = [];
      groups[label].push(insight);
    });
    // Cast Object.entries to provide explicit mapping types
    return (Object.entries(groups) as [string, MarketInsight[]][]).sort((a, b) => CATEGORIES.indexOf(a[0] as any) - CATEGORIES.indexOf(b[0] as any));
  }, [filteredInsights]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 dark:selection:bg-amber-900/30 pb-20 transition-colors duration-300">
      <header className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 h-[72px]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-full gap-4 sm:gap-8">
          <div onClick={() => !isAdmin && setClickCount(c => c+1 >= 5 ? (setShowLogin(true), 0) : c+1)} className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer select-none active:scale-90 transition-transform">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${isAdmin ? 'bg-amber-500 shadow-xl shadow-amber-200 dark:shadow-none animate-pulse' : 'bg-[#12141c] dark:bg-amber-500'}`}>
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[#12141c] dark:text-white tracking-tighter text-left">市场周刊</h1>
          </div>
          
          <div className="flex-grow flex items-center gap-4 max-w-3xl">
            <div className="relative group flex-grow">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
              <input type="text" className="w-full bg-gray-100/60 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#1a1d26] focus:border-gray-200 dark:focus:border-white/10 py-2 sm:py-3 pl-9 sm:pl-11 pr-4 sm:pr-10 rounded-2xl text-[13px] sm:text-[14px] font-bold outline-none transition-all placeholder:text-gray-400 dark:text-white" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-95 flex items-center justify-center">
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-gray-400" />}
            </button>
            <NotificationCenter notifications={notifications} onMarkAsRead={handleMarkAsRead} onClearAll={handleClearAllNotifications} onDelete={handleDeleteNotification} />
            {isAdmin && (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100 dark:border-white/5">
                <button 
                  onClick={() => {
                    if (sortMode === 'journal') setShowJournalForm(true);
                    else if (sortMode === 'feargreed') setShowIndexForm(true);
                    else if (sortMode === 'positions') setShowPositionForm(true);
                    else setShowForm(true);
                  }} 
                  className="bg-[#12141c] dark:bg-amber-500 text-white flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-black">投递</span>
                </button>
                <button onClick={() => { setIsAdmin(false); localStorage.removeItem('is_admin'); }} className="p-2 sm:p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Lock className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full flex flex-col lg:flex-row gap-8 lg:gap-16">
        <aside className="lg:w-64 space-y-8 lg:space-y-12 shrink-0">
          <div className="lg:sticky lg:top-[104px] space-y-6 lg:space-y-10">
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
                  <button onClick={() => handleModeSwitch('category')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-black flex items-center gap-3 transition-all ${sortMode === 'category' ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl shadow-gray-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 bg-gray-50/50 dark:bg-white/2'}`}>
                    <LayoutGrid className="w-4 h-4" /> 每日洞察
                  </button>
                  <button onClick={() => handleModeSwitch('journal')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-black flex items-center gap-3 transition-all ${sortMode === 'journal' ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl shadow-gray-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 bg-gray-50/50 dark:bg-white/2'}`}>
                    <Zap className="w-4 h-4" /> 信息捕捉
                  </button>
                  <button onClick={() => handleModeSwitch('positions')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-black flex items-center gap-3 transition-all ${sortMode === 'positions' ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl shadow-gray-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 bg-gray-50/50 dark:bg-white/2'}`}>
                    <TrendingUp className="w-4 h-4" /> 仓位追踪
                  </button>
                  <button onClick={() => handleModeSwitch('feargreed')} className={`px-5 lg:px-4 py-2.5 lg:py-3.5 rounded-2xl text-[13px] font-black flex items-center gap-3 transition-all ${sortMode === 'feargreed' ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl shadow-gray-200 dark:shadow-none' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 bg-gray-50/50 dark:bg-white/2'}`}>
                    <Thermometer className="w-4 h-4" /> 恐慌贪婪
                  </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-6xl font-black text-[#12141c] dark:text-white tracking-tighter leading-tight italic mb-6 sm:mb-10 transition-colors">
              {sortMode === 'journal' ? <>信息捕捉<br />瀑布流。</> 
               : sortMode === 'feargreed' ? <>恐慌贪婪<br />市场热力。</>
               : sortMode === 'positions' ? <>小波小太<br />仓位追踪。</>
               : <>追踪行情，<br />每日洞察。</>}
            </h2>
          </div>

          {sortMode === 'journal' ? (
            <JournalSection entries={filteredJournals} isAdmin={isAdmin} onEdit={(j) => { setEditingJournal(j); setShowJournalForm(true); }} onDelete={handleDeleteJournal} />
          ) : sortMode === 'feargreed' ? (
            <FearGreedSection indices={indices} isAdmin={isAdmin} onEdit={(i) => { setEditingIndex(i); setShowIndexForm(true); }} onDelete={handleDeleteIndex} />
          ) : sortMode === 'positions' ? (
            <PositionSection positions={positions} isAdmin={isAdmin} onEdit={(p) => { setEditingPosition(p); setShowPositionForm(true); }} onDelete={handleDeletePosition} />
          ) : (
            <div className="space-y-16 sm:space-y-24">
              {groupedInsights.map(([groupLabel, groupItems]) => (
                <section key={groupLabel}>
                  <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <span className="text-[12px] sm:text-[14px] font-black tracking-widest uppercase bg-[#12141c] dark:bg-amber-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-2xl transition-colors">{groupLabel}</span>
                    <div className="flex-grow h-[1px] bg-gray-100 dark:bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                    {groupItems.map(i => <MarketCard key={i.id} insight={i} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={handleDeleteInsight} onToggleCompletion={handleToggleCompletionStatus} isEditable={isAdmin} />)}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && isAdmin && <InsightForm initialData={editingInsight} onSave={handleSaveInsight} onCancel={() => { setShowForm(false); setEditingInsight(undefined); }} />}
      {showJournalForm && isAdmin && <JournalForm initialData={editingJournal} onSave={handleSaveJournal} onCancel={() => { setShowJournalForm(false); setEditingJournal(undefined); }} />}
      {showIndexForm && isAdmin && <IndexForm initialData={editingIndex} onSave={handleSaveIndex} onCancel={() => { setShowIndexForm(false); setEditingIndex(undefined); }} />}
      {showPositionForm && isAdmin && <PositionForm initialData={editingPosition} onSave={handleSavePosition} onCancel={() => { setShowPositionForm(false); setEditingPosition(undefined); }} />}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onVerify={onVerifyAdmin} />
    </div>
  );
};

export default App;
