
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
    case '持仓中': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black';
    case '观察中': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black';
    case '已平仓': return 'bg-black/5 text-gray-500 dark:text-gray-400 font-black';
    default: return 'bg-gray-100 text-gray-400 font-black';
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
    
    return {
      totalEquity,
      cash,
      cashPercent,
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

  const SortArrows = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortConfig?.key === columnKey;
    const direction = sortConfig?.direction;
    return (
      <div className="flex flex-col ml-1 opacity-20 group-hover/th:opacity-100 transition-opacity">
        <ChevronUp className={`w-2.5 h-2.5 -mb-1 ${isActive && direction === 'asc' ? 'text-amber-500 opacity-100' : 'text-gray-400'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${isActive && direction === 'desc' ? 'text-amber-500 opacity-100' : 'text-gray-400'}`} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Portfolio Stats Card */}
        <div className="bg-glass rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
           <div className="flex justify-between items-baseline mb-10">
              <h3 className="text-4xl font-black text-[#12141c] dark:text-white tracking-tighter italic">Portfolio</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-10">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">总资产 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">现金 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">现金占比 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">{stats.cashPercent.toFixed(1)}%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">最大回撤 <Info className="w-3 h-3" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">{stats.maxDrawdown.toFixed(1)}%</div>
              </div>
           </div>
        </div>

        {/* P&L Stats Card */}
        <div className="bg-glass rounded-[2.5rem] p-8 sm:p-10 shadow-sm flex flex-col">
           <div className="flex justify-between items-baseline mb-10">
              <h3 className="text-4xl font-black text-[#12141c] dark:text-white tracking-tighter italic">P&L</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-10">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">YTD 收益率</div>
                <div className="text-3xl font-black text-emerald-500">+11.6%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">YTD 收益额</div>
                <div className="text-3xl font-black text-emerald-500">+$2,322</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">MTD 收益率</div>
                <div className="text-3xl font-black text-emerald-500">+11.6%</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">MTD 收益额</div>
                <div className="text-3xl font-black text-emerald-500">+$2,322</div>
              </div>
           </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-glass rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-2xl gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[12px] font-black transition-all ${
                  activeTab === tab 
                  ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {translateSignalType(tab)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/10 rounded-xl text-[12px] font-black text-gray-500 hover:bg-amber-500 hover:text-white transition-all">
              <Download className="w-4 h-4" /> CSV
            </button>
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="搜索资产..."
                className="w-full sm:w-64 bg-black/5 dark:bg-white/10 border-none py-2.5 pl-11 pr-4 rounded-xl outline-none text-[13px] font-bold dark:text-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-y border-black/5 dark:border-white/5 text-[11px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest bg-black/5">
                <th className="px-8 py-5 text-left group/th cursor-pointer" onClick={() => requestSort('symbol')}>
                  <div className="flex items-center">标的 <SortArrows columnKey="symbol" /></div>
                </th>
                <th className="px-4 py-5 text-center group/th cursor-pointer" onClick={() => requestSort('category')}>
                  <div className="flex items-center justify-center">类别 <SortArrows columnKey="category" /></div>
                </th>
                <th className="px-4 py-5 text-center group/th cursor-pointer" onClick={() => requestSort('status')}>
                  <div className="flex items-center justify-center">状态 <SortArrows columnKey="status" /></div>
                </th>
                <th className="px-4 py-5 text-center">方向</th>
                <th className="px-4 py-5 text-center">周期</th>
                <th className="px-4 py-5 text-center">入场价</th>
                <th className="px-4 py-5 text-center">收益率</th>
                <th className="px-4 py-5 text-center">收益额</th>
                <th className="px-4 py-5 text-center">记录时间</th>
                {isAdmin && <th className="px-8 py-5 text-right">管理</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {processedPositions.map((pos) => (
                <tr key={pos.id} className="group hover:bg-white/10 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-[15px] font-black text-[#12141c] dark:text-white">{pos.symbol}</div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="text-[12px] font-black text-gray-500 dark:text-gray-400 bg-black/5 px-2.5 py-1 rounded-lg">{pos.category}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[11px] uppercase ${getStatusStyle(pos.status)}`}>{pos.status}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`text-[14px] font-black ${pos.side === 'Buy' ? 'text-emerald-500' : 'text-red-500'}`}>{pos.side === 'Buy' ? '买入' : '卖出'}</span>
                  </td>
                  <td className="px-4 py-5 text-center text-[13px] font-black text-gray-500">{translateSignalType(pos.signalType)}</td>
                  <td className="px-4 py-5 text-center text-[14px] font-black text-[#12141c] dark:text-white">{pos.entryPrice || '/'}</td>
                  <td className="px-4 py-5 text-center">
                    <div className={`text-[14px] font-black ${pos.yieldRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                       {pos.yieldRate >= 0 ? '+' : ''}{pos.yieldRate}%
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className={`text-[14px] font-black ${pos.yieldAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                       {pos.yieldAmount >= 0 ? '+$' : '-$'}{Math.abs(pos.yieldAmount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400 font-black">
                      <Calendar className="w-3 h-3" />
                      {new Date(pos.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(pos)} className="p-2 text-gray-400 hover:text-amber-500"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(pos.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionSection;
