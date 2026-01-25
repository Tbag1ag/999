
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MarketInsight, Category, CompletionStatus, SortMode, JournalEntry, EntryType, FearGreedIndex, PositionEntry, PositionStatus, PositionSide } from './types';
import { CATEGORIES, INITIAL_INSIGHTS } from './constants';
import MarketCard from './components/MarketCard';
import InsightForm from './components/InsightForm';
import JournalSection from './components/JournalSection';
import JournalForm from './components/JournalForm';
import FearGreedSection from './components/FearGreedSection';
import IndexForm from './components/IndexForm';
import PositionSection from './components/PositionSection';
import PositionForm from './components/PositionForm';
import { getLatestPrices } from './services/priceService';
import { sql, initDatabase } from './services/dbService';
import { 
  Plus, 
  LayoutGrid, 
  Search, 
  Lock,
  Zap,
  Sun,
  Moon,
  Thermometer,
  TrendingUp,
  History,
  Settings,
  X,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

const ADMIN_PASSWORD = "8888"; 
// 更新为用户指定的 4K 迷雾森林背景
const DEFAULT_BG = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3840";

const App: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [indices, setIndices] = useState<FearGreedIndex[]>([]);
  const [positions, setPositions] = useState<PositionEntry[]>([]);
  
  // 实时价格状态
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('category');
  const [showForm, setShowForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showIndexForm, setShowIndexForm] = useState(false);
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('app_bg_url') || DEFAULT_BG);

  const [editingInsight, setEditingInsight] = useState<MarketInsight | undefined>(undefined);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const updatePrices = async () => {
    if (isRefreshingPrices) return;
    setIsRefreshingPrices(true);
    const symbols = [...new Set([
      ...insights.map(i => i.symbol),
      ...positions.map(p => p.symbol)
    ])];
    if (symbols.length > 0) {
      const latest = await getLatestPrices(symbols);
      setPrices(prev => ({ ...prev, ...latest }));
    }
    setIsRefreshingPrices(false);
  };

  // 轮询价格
  useEffect(() => {
    const timer = setInterval(updatePrices, 60000); // 每分钟更新一次
    updatePrices();
    return () => clearInterval(timer);
  }, [insights.length, positions.length]);

  const fetchData = async () => {
    setLoading(true);
    if (sql) {
      try {
        await initDatabase();
        const [insData, jrData, idxData, posData] = await Promise.all([
          sql`SELECT * FROM insights ORDER BY updated_at DESC`,
          sql`SELECT * FROM journals ORDER BY date DESC`,
          sql`SELECT * FROM indices ORDER BY updated_at DESC`,
          sql`SELECT * FROM positions ORDER BY updated_at DESC`
        ]);
        setInsights(insData.map((i: any) => ({ ...i, updatedAt: Number(i.updated_at), focusPoints: i.focus_points, entryLevel: i.entry_level, completionStatus: i.completion_status })));
        setJournals(jrData.map((j: any) => ({ ...j, date: Number(j.date) })));
        setIndices(idxData.map((i: any) => ({ ...i, updatedAt: Number(i.updated_at) })));
        setPositions(posData.map((p: any) => ({ ...p, signalTime: Number(p.signal_time), entryPrice: Number(p.entry_price), investedAmount: Number(p.invested_amount), yieldRate: Number(p.yield_rate), yieldAmount: Number(p.yield_amount), updatedAt: Number(p.updated_at), signalType: p.signal_type })));
      } catch (e) { console.error(e); }
    } else {
       setInsights(INITIAL_INSIGHTS);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveInsight = async (data: any) => {
    const newId = data.id || Math.random().toString(36).substr(2, 9);
    const item = { ...data, id: newId, updatedAt: Date.now() };
    if (sql) {
      await sql`INSERT INTO insights (id, symbol, category, status, focus_points, strategy, entry_level, updated_at, completion_status)
                VALUES (${item.id}, ${item.symbol}, ${item.category}, ${item.status}, ${item.focusPoints}, ${item.strategy}, ${item.entryLevel}, ${item.updatedAt}, ${item.completionStatus})
                ON CONFLICT (id) DO UPDATE SET symbol=EXCLUDED.symbol, status=EXCLUDED.status, focus_points=EXCLUDED.focus_points, strategy=EXCLUDED.strategy, entry_level=EXCLUDED.entry_level, updated_at=EXCLUDED.updated_at, completion_status=EXCLUDED.completion_status`;
    }
    setInsights(prev => data.id ? prev.map(i => i.id === data.id ? item : i) : [item, ...prev]);
    setShowForm(false);
    updatePrices();
  };

  const handleUpdateBg = () => {
    const newUrl = prompt("请输入背景图片的 URL 地址:", bgImage);
    if (newUrl !== null && newUrl.trim() !== "") {
      setBgImage(newUrl.trim());
      localStorage.setItem('app_bg_url', newUrl.trim());
    }
  };

  const filteredInsights = useMemo(() => {
    return insights.filter(i => i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || i.focusPoints.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [insights, searchQuery]);

  return (
    <div className="min-h-screen pt-28 pb-32">
      <img src={bgImage} className="main-bg" alt="app background" />
      <div className="main-bg-overlay" />

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl">
        <div className="bg-glass stadium-nav px-6 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Market Weekly</h1>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'category', icon: <LayoutGrid className="w-4 h-4" />, label: '洞察' },
              { id: 'journal', icon: <Zap className="w-4 h-4" />, label: '情报' },
              { id: 'positions', icon: <TrendingUp className="w-4 h-4" />, label: '持仓' },
              { id: 'feargreed', icon: <Thermometer className="w-4 h-4" />, label: '指数' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setSortMode(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black transition-all ${sortMode === tab.id ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl' : 'text-gray-500 hover:bg-white/50'}`}
              >
                {tab.icon} <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             <button onClick={updatePrices} className={`p-2 hover:bg-white/50 rounded-full transition-all ${isRefreshingPrices ? 'animate-spin text-amber-500' : 'text-gray-400'}`} title="手动刷新价格">
               <RefreshCw className="w-4 h-4" />
             </button>
             <button onClick={handleUpdateBg} className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-500" title="修改背景图">
               <ImageIcon className="w-4 h-4" />
             </button>
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-white/50 rounded-full transition-colors" title="切换模式">
               {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
             </button>
             <button onClick={() => { if(!isAdmin) { const p = prompt('请输入密码'); if(p==='8888') {setIsAdmin(true); localStorage.setItem('is_admin','true');} } else {setIsAdmin(false); localStorage.removeItem('is_admin');} }} className={`p-2 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-600' : 'hover:bg-white/50 text-gray-500'}`} title="管理员后台">
                <Settings className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {sortMode === 'category' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {filteredInsights.map(i => (
                   <MarketCard key={i.id} insight={i} currentPrice={prices[i.symbol]} onEdit={(ins) => { setEditingInsight(ins); setShowForm(true); }} onDelete={() => {}} onToggleCompletion={() => {}} isEditable={isAdmin} />
                 ))}
                 {isAdmin && (
                   <button onClick={() => { setEditingInsight(undefined); setShowForm(true); }} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border-4 border-dashed border-white/30 rounded-[3rem] h-full min-h-[420px] flex flex-col items-center justify-center group hover:border-amber-500/50 transition-all">
                     <Plus className="w-8 h-8 text-amber-500" />
                     <span className="text-xl font-black text-gray-400 mt-4 group-hover:text-amber-500">投递新策略</span>
                   </button>
                 )}
              </div>
            )}

            {sortMode === 'journal' && <JournalSection entries={journals} isAdmin={isAdmin} onEdit={() => {}} onDelete={() => {}} />}
            {sortMode === 'positions' && (
              <div className="bg-white/70 dark:bg-[#1a1d26]/70 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/20">
                <PositionSection positions={positions} livePrices={prices} isAdmin={isAdmin} onEdit={() => {}} onDelete={() => {}} />
              </div>
            )}
            {sortMode === 'feargreed' && <FearGreedSection indices={indices} isAdmin={isAdmin} onEdit={() => {}} onDelete={() => {}} />}
          </div>
        )}
      </main>

      {isAdmin && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
           <button onClick={() => { if(sortMode === 'category') setShowForm(true); else if(sortMode === 'journal') setShowJournalForm(true); }} className="w-16 h-16 bg-[#12141c] dark:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
             <Plus className="w-8 h-8" />
           </button>
        </div>
      )}

      {showForm && <InsightForm initialData={editingInsight} onSave={handleSaveInsight} onCancel={() => setShowForm(false)} />}
      {showJournalForm && <JournalForm onSave={() => {}} onCancel={() => setShowJournalForm(false)} />}
    </div>
  );
};

export default App;
