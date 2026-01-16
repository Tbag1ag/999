
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { Search, TrendingUp, TrendingDown, Edit2, Trash2, Clock, Calendar, Info, ChevronUp, ChevronDown, Download } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  isAdmin: boolean;
  onEdit: (entry: PositionEntry) => void;
  onDelete: (id: string) => void;
}

const INITIAL_CAPITAL = 20000;

const getStatusStyle = (status: PositionStatus) => {
  switch (status) {
    case '持仓中': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case '观察中': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case '已平仓': return 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-500';
    default: return 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500';
  }
};

const translateSignalType = (type: PositionSignalType | '全部') => {
  switch (type) {
    case 'Short Term': return '短期';
    case 'Medium Term': return '中期';
    case 'Long Term': return '长期';
    case '全部': return '全部记录';
    default: return type;
  }
};

type SortKey = keyof PositionEntry;

const PositionSection: React.FC<PositionSectionProps> = ({ positions, isAdmin, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<PositionSignalType | '全部'>('全部');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const stats = useMemo(() => {
    const closedPositions = positions.filter(p => p.status === '已平仓');
    const openPositions = positions.filter(p => p.status === '持仓中');
    
    const totalProfit = closedPositions.reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const totalEquity = INITIAL_CAPITAL + totalProfit;
    
    const investedInOpen = openPositions.reduce((sum, p) => sum + (p.investedAmount || 0), 0);
    const cash = totalEquity - investedInOpen;
    const cashPercent = totalEquity > 0 ? (cash / totalEquity) * 100 : 100;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const ytdProfit = closedPositions
      .filter(p => new Date(p.updatedAt).getFullYear() === currentYear)
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const ytdReturn = (ytdProfit / INITIAL_CAPITAL) * 100;

    const mtdProfit = closedPositions
      .filter(p => {
        const d = new Date(p.updatedAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const mtdReturn = (mtdProfit / INITIAL_CAPITAL) * 100;

    return {
      totalEquity,
      cash,
      cashPercent,
      ytdProfit,
      ytdReturn,
      mtdProfit,
      mtdReturn,
      maxDrawdown: 0.00
    };
  }, [positions]);

  const tabs: (PositionSignalType | '全部')[] = ['全部', 'Short Term', 'Medium Term', 'Long Term'];

  const processedPositions = useMemo(() => {
    let filtered = positions.filter(p => {
      const matchesTab = activeTab === '全部' || p.signalType === activeTab;
      const matchesSearch = p.symbol.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [positions, activeTab, search, sortConfig]);

  const exportToCSV = () => {
    const headers = ['标的', '类别', '状态', '方向', '周期', '入场价', '本金', '收益率', '收益额', '记录时间'];
    const rows = processedPositions.map(p => [
      p.symbol,
      p.category,
      p.status,
      p.side === 'Buy' ? '买入' : '卖出',
      translateSignalType(p.signalType),
      p.entryPrice,
      p.investedAmount,
      `${p.yieldRate}%`,
      p.yieldAmount,
      new Date(p.updatedAt).toLocaleDateString('zh-CN')
    ]);

    const csvContent = ['\ufeff' + headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `仓位追踪记录_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortArrows = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortConfig?.key === columnKey;
    const direction = sortConfig?.direction;
    return (
      <div className="flex flex-col ml-1 opacity-20 group-hover/th:opacity-100 transition-opacity">
        <ChevronUp className={`w-2.5 h-2.5 -mb-1 ${isActive && direction === 'asc' ? 'text-amber-500 opacity-100 scale-125' : 'text-gray-400'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${isActive && direction === 'desc' ? 'text-amber-500 opacity-100 scale-125' : 'text-gray-400'}`} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] p-10 border-2 border-gray-100 dark:border-white/10 shadow-sm">
           <div className="flex justify-between items-baseline mb-12">
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">Portfolio</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-10">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">总资产 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">现金 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">现金占比 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">{stats.cashPercent.toFixed(2)}%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">最大回撤 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">{stats.maxDrawdown.toFixed(2)}%</div>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] p-10 border-2 border-gray-100 dark:border-white/10 shadow-sm flex flex-col">
           <div className="flex justify-between items-baseline mb-12">
              <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic">P&L</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-10">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">今年以来 (YTD) 收益率 <Info className="w-3 h-3" /></div>
                <div className={`text-3xl font-black ${stats.ytdReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stats.ytdReturn >= 0 ? '+' : ''}{stats.ytdReturn.toFixed(2)}%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">今年以来 (YTD) 收益额 <Info className="w-3 h-3" /></div>
                <div className={`text-3xl font-black ${stats.ytdProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stats.ytdProfit >= 0 ? '+' : ''}${stats.ytdProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">本月以来 (MTD) 收益率 <Info className="w-3 h-3" /></div>
                <div className={`text-3xl font-black ${stats.mtdReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stats.mtdReturn >= 0 ? '+' : ''}{stats.mtdReturn.toFixed(2)}%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">本月以来 (MTD) 收益额 <Info className="w-3 h-3" /></div>
                <div className={`text-3xl font-black ${stats.mtdProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{stats.mtdProfit >= 0 ? '+' : ''}${stats.mtdProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] shadow-sm border-2 border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="px-8 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap ${
                  activeTab === tab 
                  ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {translateSignalType(tab)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 rounded-xl text-[13px] font-black text-gray-400 transition-all shadow-sm active:scale-95"
              title="导出当前表格数据"
            >
              <Download className="w-4 h-4" />
              <span>导出 CSV</span>
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="搜索资产代码..."
                className="bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:bg-white dark:focus:bg-[#1a1d26] focus:border-gray-100 dark:focus:border-white/10 py-2.5 pl-11 pr-4 rounded-xl outline-none text-[13px] font-bold dark:text-white transition-all w-48 sm:w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y-2 border-gray-100 dark:border-white/10 text-[11px] font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest bg-gray-50/30 dark:bg-white/1">
                <th className="px-8 py-5 text-left font-black group/th cursor-pointer select-none" onClick={() => requestSort('symbol')}>
                  <div className="flex items-center">标的 <SortArrows columnKey="symbol" /></div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('category')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">类别</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="category" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('status')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">状态</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="status" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('side')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">方向</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="side" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('signalType')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">周期</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="signalType" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('entryPrice')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">入场价</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="entryPrice" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('yieldRate')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">收益率</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="yieldRate" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('yieldAmount')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">收益额</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="yieldAmount" /></div>
                  </div>
                </th>
                <th className="px-4 py-5 text-center font-black group/th cursor-pointer select-none" onClick={() => requestSort('updatedAt')}>
                  <div className="flex items-center justify-center">
                    <div className="w-5 shrink-0 invisible" aria-hidden="true" />
                    <span className="flex-grow">记录时间</span>
                    <div className="w-5 shrink-0 flex justify-start"><SortArrows columnKey="updatedAt" /></div>
                  </div>
                </th>
                {isAdmin && <th className="px-8 py-5 text-right font-black">管理</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {processedPositions.map((pos) => (
                <tr key={pos.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-[15px] font-black text-[#12141c] dark:text-white tracking-tight">{pos.symbol}</div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-block text-[12px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">{pos.category}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase ${getStatusStyle(pos.status)}`}>{pos.status}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`text-[14px] font-black ${pos.side === 'Buy' ? 'text-emerald-500' : 'text-red-500'}`}>{pos.side === 'Buy' ? '买入' : '卖出'}</span>
                  </td>
                  <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-500 dark:text-gray-400">{translateSignalType(pos.signalType)}</td>
                  <td className="px-4 py-5 text-center text-[14px] font-black text-[#12141c] dark:text-white">{pos.status === '观察中' && (!pos.entryPrice || pos.entryPrice === 0) ? '/' : pos.entryPrice.toLocaleString()}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center">
                      <div className="w-6 shrink-0 flex justify-end">
                        {pos.yieldRate >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <span className={`flex-grow text-center text-[14px] font-black ${pos.yieldRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {pos.yieldRate}%
                      </span>
                      <div className="w-6 shrink-0 invisible" aria-hidden="true" />
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className={`text-[14px] font-black ${pos.yieldAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{pos.yieldAmount >= 0 ? '+' : ''}${pos.yieldAmount?.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center">
                      <div className="w-6 shrink-0 flex justify-end">
                        <Calendar className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="flex-grow text-center text-[12px] text-gray-400 font-medium">
                        {new Date(pos.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                      </span>
                      <div className="w-6 shrink-0 invisible" aria-hidden="true" />
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(pos); }} title="编辑" className="p-2 text-gray-300 hover:text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(pos.id); }} title="删除" className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {processedPositions.length === 0 && (
            <div className="py-24 text-center">
              <Clock className="w-12 h-12 text-gray-100 dark:text-white/5 mx-auto mb-4" />
              <p className="text-gray-300 italic font-serif text-xl tracking-tight">等待信号触发...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionSection;
