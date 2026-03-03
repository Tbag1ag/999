
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MarketInsight, Category, CompletionStatus, SortMode, JournalEntry, EntryType, AppNotification, MarketAlert, AlertStatus } from './types';
import { CATEGORIES, INITIAL_INSIGHTS } from './constants';
import MarketCard from './components/MarketCard';
import InsightForm from './components/InsightForm';
import JournalSection from './components/JournalSection';
import JournalForm from './components/JournalForm';
import AlertsSection from './components/AlertsSection';
import AlertForm from './components/AlertForm';
import NotificationCenter from './components/NotificationCenter';
import { sql, initDatabase } from './services/dbService';
import MarketDashboard from './components/MarketDashboard';
import { 
  Plus, 
  LayoutGrid, 
  CalendarDays, 
  Search, 
  Lock,
  KeyRound,
  Zap,
  Filter,
  Sun,
  Moon,
  BellRing,
  ChevronDown,
  Warehouse,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  User,
  Star,
  Building2,
  Briefcase,
  PieChart,
  ClipboardList,
  ChevronRight
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
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editingInsight, setEditingInsight] = useState<MarketInsight | undefined>(undefined);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>(undefined);
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
        const [insData, jrData, alertData, noteData] = await Promise.all([
          sql`SELECT * FROM insights ORDER BY updated_at DESC`,
          sql`SELECT * FROM journals ORDER BY date DESC`,
          sql`SELECT * FROM alerts ORDER BY created_at DESC`,
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
        if (alertData) {
          const mappedAlerts = alertData.map((a: any) => ({ ...a, createdAt: Number(a.created_at) }));
          setAlerts(mappedAlerts);
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
      const sA = localStorage.getItem('local_alerts');
      if (sA) setAlerts(JSON.parse(sA));
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
    setNotifications(prev => [newNote, ...prev].slice(0, 50));
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

  const handleSaveAlert = async (data: Partial<MarketAlert>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert: MarketAlert = {
      id, symbol: data.symbol || '', type: data.type || '方向性', title: data.title || '',
      content: data.content || '', status: '监听中', priority: data.priority || '中', createdAt: Date.now()
    };
    if (sql) {
      try {
        await sql`
          INSERT INTO alerts (id, symbol, type, title, content, status, priority, created_at)
          VALUES (${newAlert.id}, ${newAlert.symbol}, ${newAlert.type}, ${newAlert.title}, ${newAlert.content}, ${newAlert.status}, ${newAlert.priority}, ${newAlert.createdAt})
        `;
      } catch (e) { alert("同步失败"); return; }
    }
    addNotification(`系统警报激活: ${newAlert.symbol}`, `${newAlert.type}警报 - ${newAlert.title}`, 'alert' as any);
    setAlerts(prev => [newAlert, ...prev]);
    setShowAlertForm(false);
  };

  const handleDeleteAlert = async (id: string) => {
    if (sql) { try { await sql`DELETE FROM alerts WHERE id = ${id}`; } catch (e) { return; } }
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAlertStatus = async (id: string, status: AlertStatus) => {
    if (sql) { try { await sql`UPDATE alerts SET status = ${status} WHERE id = ${id}`; } catch (e) { return; } }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    const alertItem = alerts.find(a => a.id === id);
    if (status === '已触发' && alertItem) {
      addNotification(`警报已触发: ${alertItem.symbol}`, alertItem.title, 'alert' as any);
    }
  };

  const handleDeleteInsight = async (id: string) => {
    if (!window.confirm("确定要删除这条观点吗？")) return;
    if (sql) { try { await sql`DELETE FROM insights WHERE id = ${id}`; } catch (e) { alert("删除失败"); return; } }
    setInsights(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('local_insights', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteJournal = async (id: string) => {
    if (sql) { 
      try { 
        await sql`DELETE FROM journals WHERE id = ${id}`; 
      } catch (e) { 
        console.error("Delete Error", e);
        alert("删除失败"); 
        return; 
      } 
    }
    setJournals(prev => {
      const updated = prev.filter(j => j.id !== id);
      localStorage.setItem('local_journals', JSON.stringify(updated));
      return updated;
    });
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
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('local_notifications', JSON.stringify(updated));
      return updated;
    });
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
    const data = sortMode === 'journal' ? journals : insights;
    data.forEach(i => {
      const timestamp = (i as any).date || (i as any).updatedAt;
      const date = new Date(timestamp);
      const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [insights, journals, sortMode]);

  const handleModeSwitch = (mode: SortMode) => {
    setSortMode(mode);
    setSelectedMonth(null);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight">Market Weekly</span>
        </div>

        <div className="px-4 py-2">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">⌘ K</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Favorites</div>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all pl-8">Sales analytics</button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all pl-8">List of warehouses</button>
          </div>

          <nav className="mt-8 space-y-1">
            <button 
              onClick={() => handleModeSwitch('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${sortMode === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <BarChart3 className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => handleModeSwitch('category')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${sortMode === 'category' || sortMode === 'timeline' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3"><Building2 className="w-4 h-4" /> Insights</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => handleModeSwitch('journal')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${sortMode === 'journal' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3"><Briefcase className="w-4 h-4" /> Journals</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => handleModeSwitch('alerts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-xl transition-all ${sortMode === 'alerts' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3"><Zap className="w-4 h-4" /> Alerts</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <div className="flex items-center gap-3"><PieChart className="w-4 h-4" /> Financials</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <div className="flex items-center gap-3"><ClipboardList className="w-4 h-4" /> Operations</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <div className="flex items-center gap-3"><FileText className="w-4 h-4" /> Documents</div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-4 h-4 text-white dark:text-slate-900" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">AI Upgrade</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">AI now handles repetitive tasks, highlights trends, and improves accuracy.</p>
              <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Try it now</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 shadow-sm rounded-lg text-slate-900 dark:text-white">Default layout</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">CRM dashboard</button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">
              <HelpCircle className="w-4 h-4" /> Help
            </button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={handleMarkAsRead} 
              onClearAll={handleClearAllNotifications} 
              onDelete={handleDeleteNotification} 
            />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Admin User</span>
                <span className="text-[10px] font-medium text-slate-400">Pro Plan</span>
              </div>
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8 overflow-y-auto">
          {sortMode === 'dashboard' ? (
            <MarketDashboard />
          ) : sortMode === 'journal' ? (
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-4">信息捕捉瀑布流。</h2>
                <p className="text-slate-500 font-medium">记录市场点滴，捕捉稍纵即逝的灵感。</p>
              </div>
              <JournalSection entries={filteredJournals} isAdmin={isAdmin} onEdit={(j) => { setEditingJournal(j); setShowJournalForm(true); }} onDelete={handleDeleteJournal} />
            </div>
          ) : sortMode === 'alerts' ? (
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-4">系统信号实时监听。</h2>
                <p className="text-slate-500 font-medium">多维度预警，不错过任何关键变盘点。</p>
              </div>
              <AlertsSection alerts={alerts} isAdmin={isAdmin} onDelete={handleDeleteAlert} onUpdateStatus={handleUpdateAlertStatus} />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-4">追踪行情，每日洞察。</h2>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          activeCategory === cat 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                   <button 
                     onClick={() => setSortMode('category')}
                     className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortMode === 'category' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <Filter className="w-3.5 h-3.5" /> 类别
                   </button>
                   <button 
                     onClick={() => setSortMode('timeline')}
                     className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortMode === 'timeline' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <CalendarDays className="w-3.5 h-3.5" /> 时间
                   </button>
                </div>
              </div>

              <div className="space-y-16">
                {groupedInsights.map(([groupLabel, groupItems]) => (
                  <section key={groupLabel}>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-lg">{groupLabel}</span>
                      <div className="flex-grow h-[1px] bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {groupItems.map(i => <MarketCard key={i.id} insight={i} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={handleDeleteInsight} onToggleCompletion={handleToggleCompletionStatus} isEditable={isAdmin} />)}
                    </div>
                  </section>
                ))}
                {archivedItems.length > 0 && (
                  <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-800 opacity-50 hover:opacity-100 transition-opacity">
                     <h3 className="text-2xl font-black mb-12 italic text-slate-900 dark:text-white underline decoration-slate-200 underline-offset-8">历史已归档</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {archivedItems.map(i => <MarketCard key={i.id} insight={i} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={handleDeleteInsight} onToggleCompletion={handleToggleCompletionStatus} isEditable={isAdmin} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button for Admin */}
      {isAdmin && (
        <button 
          onClick={() => {
            if (sortMode === 'journal') setShowJournalForm(true);
            else if (sortMode === 'alerts') setShowAlertForm(true);
            else setShowForm(true);
          }} 
          className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all z-[60]"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {showForm && isAdmin && <InsightForm initialData={editingInsight} onSave={handleSaveInsight} onCancel={() => { setShowForm(false); setEditingInsight(undefined); }} />}
      {showJournalForm && isAdmin && <JournalForm initialData={editingJournal} onSave={handleSaveJournal} onCancel={() => { setShowJournalForm(false); setEditingJournal(undefined); }} />}
      {showAlertForm && isAdmin && <AlertForm onSave={handleSaveAlert} onCancel={() => setShowAlertForm(false)} />}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onVerify={onVerifyAdmin} />
    </div>
  );
};

export default App;
