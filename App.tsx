
import React, { useState, useEffect, useMemo } from 'react';
import { MarketInsight, SortMode, JournalEntry, PositionEntry } from './types';
import { INITIAL_INSIGHTS } from './constants';
import MarketCard from './components/MarketCard';
import InsightForm from './components/InsightForm';
import JournalSection from './components/JournalSection';
import JournalForm from './components/JournalForm';
import PositionSection from './components/PositionSection';
import PositionForm from './components/PositionForm';
import { sql, initDatabase } from './services/dbService';
import { 
  Plus, 
  LayoutGrid, 
  Zap, 
  Sun, 
  Moon, 
  TrendingUp,
  Search,
  X,
  Archive
} from 'lucide-react';

const ADMIN_PASSWORD = "8888"; 
const DEFAULT_BG = 'https://images.pexels.com/photos/3458700/pexels-photo-3458700.jpeg';

const App: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [positions, setPositions] = useState<PositionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [bgImage] = useState(DEFAULT_BG);
  const [sortMode, setSortMode] = useState<SortMode>('category');
  const [logoClicks, setLogoClicks] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');

  const [showInsightForm, setShowInsightForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<MarketInsight | undefined>(undefined);
  
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>(undefined);

  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionEntry | undefined>(undefined);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const fetchData = async () => {
    setLoading(true);
    if (sql) {
      try {
        await initDatabase();
        const [insData, jrData, posData] = await Promise.all([
          sql`SELECT * FROM insights ORDER BY updated_at DESC`,
          sql`SELECT * FROM journals ORDER BY date DESC`,
          sql`SELECT * FROM positions ORDER BY updated_at DESC`
        ]);
        setInsights(insData.map((i: any) => ({ 
          ...i, 
          updatedAt: Number(i.updated_at), 
          focusPoints: i.focus_points, 
          entryLevel: i.entry_level, 
          completionStatus: i.completion_status,
          imageUrl: i.image_url
        })));
        setJournals(jrData.map((j: any) => ({ ...j, date: Number(j.date) })));
        setPositions(posData.map((p: any) => ({ 
          ...p, 
          signalTime: Number(p.signal_time), 
          entryPrice: Number(p.entry_price), 
          shares: Number(p.shares), 
          yieldRate: Number(p.yield_rate), 
          yieldAmount: Number(p.yield_amount), 
          updatedAt: Number(p.updated_at), 
          signalType: p.signal_type 
        })));
      } catch (e) { console.error(e); }
    } else {
       setInsights(INITIAL_INSIGHTS);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const { activeInsights, archivedInsights } = useMemo(() => {
    const searchFiltered = !globalSearch 
      ? insights 
      : insights.filter(i => 
          i.symbol.toLowerCase().includes(globalSearch.toLowerCase()) || 
          i.category.toLowerCase().includes(globalSearch.toLowerCase()) || 
          i.focusPoints.toLowerCase().includes(globalSearch.toLowerCase())
        );

    return {
      activeInsights: searchFiltered.filter(i => i.completionStatus === '进行中'),
      archivedInsights: searchFiltered.filter(i => i.completionStatus !== '进行中')
    };
  }, [insights, globalSearch]);

  const filteredJournals = useMemo(() => {
    if (!globalSearch) return journals;
    const s = globalSearch.toLowerCase();
    return journals.filter(j => 
      (j.title?.toLowerCase().includes(s)) || 
      j.content.toLowerCase().includes(s)
    );
  }, [journals, globalSearch]);

  const filteredPositions = useMemo(() => {
    if (!globalSearch) return positions;
    const s = globalSearch.toLowerCase();
    return positions.filter(p => 
      p.symbol.toLowerCase().includes(s) || 
      p.category.toLowerCase().includes(s)
    );
  }, [positions, globalSearch]);

  const handleToggleAdmin = () => {
    if (!isAdmin) {
      const password = prompt("请输入管理密码开启编辑模式:");
      if (password === ADMIN_PASSWORD) {
        setIsAdmin(true);
        localStorage.setItem('is_admin', 'true');
      }
    } else {
      setIsAdmin(false);
      localStorage.removeItem('is_admin');
    }
  };

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 4) {
      handleToggleAdmin();
      setLogoClicks(0);
    } else {
      setLogoClicks(nextClicks);
      setTimeout(() => setLogoClicks(0), 3000); 
    }
  };

  const handleSaveInsight = async (data: Partial<MarketInsight>) => {
    if (!sql) return;
    const id = editingInsight?.id || crypto.randomUUID();
    const finalData = { ...data, id, updatedAt: Date.now() };
    try {
      if (editingInsight) {
        await sql`UPDATE insights SET symbol=${finalData.symbol}, category=${finalData.category}, status=${finalData.status}, focus_points=${finalData.focusPoints}, strategy=${finalData.strategy}, entry_level=${finalData.entryLevel}, updated_at=${finalData.updatedAt}, completion_status=${finalData.completionStatus}, image_url=${finalData.imageUrl || null} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO insights (id, symbol, category, status, focus_points, strategy, entry_level, updated_at, completion_status, image_url) VALUES (${id}, ${finalData.symbol}, ${finalData.category}, ${finalData.status}, ${finalData.focusPoints}, ${finalData.strategy}, ${finalData.entryLevel}, ${finalData.updatedAt}, ${finalData.completionStatus}, ${finalData.imageUrl || null})`;
      }
      setShowInsightForm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteInsight = async (id: string) => {
    if (!sql || !confirm('确认删除此观点?')) return;
    await sql`DELETE FROM insights WHERE id=${id}`;
    fetchData();
  };

  const handleSaveJournal = async (data: Partial<JournalEntry>) => {
    if (!sql) return;
    const id = editingJournal?.id || crypto.randomUUID();
    const finalData = { ...data, id };
    try {
      if (editingJournal) {
        await sql`UPDATE journals SET title=${finalData.title}, content=${finalData.content}, mood=${finalData.mood}, type=${finalData.type}, source=${finalData.source}, date=${finalData.date} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO journals (id, title, content, mood, type, source, date) VALUES (${id}, ${finalData.title}, ${finalData.content}, ${finalData.mood}, ${finalData.type}, ${finalData.source}, ${finalData.date})`;
      }
      setShowJournalForm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!sql || !confirm('确认删除此情报?')) return;
    await sql`DELETE FROM journals WHERE id=${id}`;
    fetchData();
  };

  const handleSavePosition = async (data: Partial<PositionEntry>) => {
    if (!sql) return;
    const id = editingPosition?.id || crypto.randomUUID();
    const finalData = { 
      ...data, 
      id, 
      signalTime: data.signalTime || Date.now(),
      updatedAt: Date.now() 
    };
    
    try {
      if (editingPosition) {
        await sql`UPDATE positions SET symbol=${finalData.symbol}, category=${finalData.category}, signal_type=${finalData.signalType}, side=${finalData.side}, status=${finalData.status}, signal_time=${finalData.signalTime}, entry_price=${finalData.entryPrice}, shares=${finalData.shares}, yield_rate=${finalData.yieldRate}, yield_amount=${finalData.yieldAmount}, updated_at=${finalData.updatedAt} WHERE id=${id}`;
      } else {
        await sql`INSERT INTO positions (id, symbol, category, signal_type, side, status, signal_time, entry_price, shares, yield_rate, yield_amount, updated_at) VALUES (${id}, ${finalData.symbol}, ${finalData.category}, ${finalData.signalType}, ${finalData.side}, ${finalData.status}, ${finalData.signalTime}, ${finalData.entryPrice}, ${finalData.shares}, ${finalData.yieldRate}, ${finalData.yieldAmount}, ${finalData.updatedAt})`;
      }
      setShowPositionForm(false);
      fetchData();
    } catch (e) { 
      console.error("Position Save Error:", e);
      alert("保存持仓失败，请检查数据库配置。");
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!sql || !confirm('确认删除此持仓?')) return;
    await sql`DELETE FROM positions WHERE id=${id}`;
    fetchData();
  };

  const handleOpenAddForm = () => {
    if (sortMode === 'category') { setEditingInsight(undefined); setShowInsightForm(true); }
    else if (sortMode === 'journal') { setEditingJournal(undefined); setShowJournalForm(true); }
    else if (sortMode === 'positions') { setEditingPosition(undefined); setShowPositionForm(true); }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-32 sm:pb-40 relative">
      <div className="app-bg" style={{ backgroundImage: `url('${bgImage}')` }}></div>
      <div className="app-bg-overlay"></div>

      <header className="fixed top-0 sm:top-8 left-1/2 -translate-x-1/2 z-[100] w-full sm:w-[94%] max-w-6xl">
        <div className="stadium-nav px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between sm:rounded-full rounded-b-[1.5rem] shadow-lg">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 sm:gap-4 group active:scale-95 transition-all"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:bg-amber-600 transition-colors">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h1 className="hidden sm:block text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">市场周刊V2.0</h1>
          </button>

          <nav className="flex items-center gap-1 sm:gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full">
            {[
              { id: 'category', icon: <LayoutGrid className="w-4 h-4" />, label: '洞察' },
              { id: 'journal', icon: <Zap className="w-4 h-4" />, label: '情报' },
              { id: 'positions', icon: <TrendingUp className="w-4 h-4" />, label: '持仓' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setSortMode(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-black transition-all ${sortMode === tab.id ? 'bg-market-dark text-white shadow-xl dark:bg-amber-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
             <div className="relative flex items-center">
                <div className={`flex items-center bg-black/5 dark:bg-white/10 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-500 border border-transparent focus-within:border-amber-500/50 focus-within:bg-white dark:focus-within:bg-black/40 ${globalSearch ? 'w-32 sm:w-64' : 'w-8 sm:w-48'}`}>
                   <Search className={`w-3.5 h-3.5 shrink-0 ${globalSearch ? 'text-amber-500' : 'text-gray-400'}`} />
                   <input 
                     type="text"
                     placeholder="搜索..."
                     className={`bg-transparent outline-none text-[12px] font-bold dark:text-white transition-all duration-500 ml-1.5 sm:ml-2 w-full ${!globalSearch && 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto'}`}
                     value={globalSearch}
                     onChange={(e) => setGlobalSearch(e.target.value)}
                   />
                </div>
             </div>

             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
               {isDarkMode ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-10 relative z-10">
        {loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-5">
            {sortMode === 'category' && (
              <div className="space-y-16 sm:space-y-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {activeInsights.map(i => (
                    <MarketCard 
                      key={i.id} 
                      insight={i} 
                      onEdit={(ins) => { setEditingInsight(ins); setShowInsightForm(true); }} 
                      onDelete={handleDeleteInsight} 
                      onToggleCompletion={() => {}} 
                      isEditable={isAdmin} 
                    />
                  ))}
                  {isAdmin && !globalSearch && (
                    <button 
                      onClick={handleOpenAddForm}
                      className="bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] sm:rounded-[3rem] h-[320px] sm:h-full sm:min-h-[540px] flex flex-col items-center justify-center group hover:border-amber-500/40 transition-all backdrop-blur-sm"
                    >
                      <Plus className="w-10 h-10 text-white/20 group-hover:text-white transition-all" />
                      <span className="text-sm font-black text-white/20 mt-4 group-hover:text-white uppercase tracking-widest">New Probe</span>
                    </button>
                  )}
                </div>

                {archivedInsights.length > 0 && (
                  <div className="pt-16 sm:pt-20 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-8 sm:mb-12">
                      <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400/50" />
                      <h2 className="text-lg sm:text-xl font-black text-white/30 uppercase tracking-[0.4em]">已归档 ARCHIVED</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {archivedInsights.map(i => (
                        <MarketCard 
                          key={i.id} 
                          insight={i} 
                          onEdit={(ins) => { setEditingInsight(ins); setShowInsightForm(true); }} 
                          onDelete={handleDeleteInsight} 
                          onToggleCompletion={() => {}} 
                          isEditable={isAdmin} 
                          isArchived={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {sortMode === 'journal' && (
              <JournalSection 
                entries={filteredJournals} 
                isAdmin={isAdmin} 
                onEdit={(entry) => { setEditingJournal(entry); setShowJournalForm(true); }} 
                onDelete={handleDeleteJournal} 
              />
            )}
            
            {sortMode === 'positions' && (
              <PositionSection 
                positions={filteredPositions} 
                isAdmin={isAdmin} 
                onEdit={(pos) => { setEditingPosition(pos); setShowPositionForm(true); }} 
                onDelete={handleDeletePosition} 
              />
            )}
          </div>
        )}
      </main>

      {isAdmin && (
        <div className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 z-[110] mb-[env(safe-area-inset-bottom)]">
           <button onClick={handleOpenAddForm} className="w-14 h-14 sm:w-16 sm:h-16 bg-market-dark dark:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
             <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
           </button>
        </div>
      )}

      {showInsightForm && (
        <InsightForm 
          initialData={editingInsight} 
          onSave={handleSaveInsight} 
          onCancel={() => setShowInsightForm(false)} 
        />
      )}

      {showJournalForm && (
        <JournalForm 
          initialData={editingJournal} 
          onSave={handleSaveJournal} 
          onCancel={() => setShowJournalForm(false)} 
        />
      )}

      {showPositionForm && (
        <PositionForm 
          initialData={editingPosition} 
          onSave={handleSavePosition} 
          onCancel={() => setShowPositionForm(false)} 
        />
      )}
    </div>
  );
};

export default App;
