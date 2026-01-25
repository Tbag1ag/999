
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { TrendingUp, Edit2, Trash2, Clock, ChevronUp, ChevronDown, Download, BarChart3 } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  isAdmin: boolean;
  onEdit: (entry: PositionEntry) => void;
  onDelete: (id: string) => void;
}

const INITIAL_CAPITAL = 20000;

const getStatusStyle = (status: PositionStatus) => {
  switch (status) {
    case '持仓中': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black';
    case '观察中': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black';
    case '已平仓': return 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 font-black';
    default: return 'bg-gray-100 dark:bg-white/10 text-gray-400 font-black';
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
    const totalProfit = positions.reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const totalEquity = INITIAL_CAPITAL + totalProfit;
    const investedInOpen = openPositions.reduce((sum, p) => sum + (p.investedAmount || 0), 0);
    const cash = totalEquity - investedInOpen;
    const cashPercent = totalEquity > 0 ? (cash / totalEquity) * 100 : 100;
    const totalReturnRate = (totalProfit / INITIAL_CAPITAL) * 100;
    
    return { totalEquity, cash, cashPercent, totalReturnRate };
  }, [positions]);

  const tabs: (PositionSignalType | '全部')[] = ['全部', 'Short Term', 'Medium Term', 'Long Term'];

  const processedPositions = useMemo(() => {
    let filtered = positions.filter(p => activeTab === '全部' || p.signalType === activeTab);
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] as any;
        const bValue = b[sortConfig.key] as any;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [positions, activeTab, sortConfig]);

  const SortArrows = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortConfig?.key === columnKey;
    const direction = sortConfig?.direction;
    return (
      <div className="flex flex-col ml-1 opacity-20 group-hover/th:opacity-100 transition-opacity">
        <ChevronUp className={`w-2 h-2 -mb-1 ${isActive && direction === 'asc' ? 'text-black dark:text-white opacity-100' : 'text-gray-400'}`} />
        <ChevronDown className={`w-2 h-2 ${isActive && direction === 'desc' ? 'text-black dark:text-white opacity-100' : 'text-gray-400'}`} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Portfolio Stats Bar - Optimized for Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
        {[
          { label: '总资产 (Equity)', value: `$${stats.totalEquity.toLocaleString()}` },
          { label: '现金余额 (Cash)', value: `$${stats.cash.toLocaleString()}` },
          { label: '可用现金 %', value: `${stats.cashPercent.toFixed(1)}%` },
          { label: '总收益率 (ROI)', value: `${stats.totalReturnRate > 0 ? '+' : ''}${stats.totalReturnRate.toFixed(2)}%`, highlight: true }
        ].map((item, i) => (
          <div key={i} className="bg-glass p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex flex-col justify-center">
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">{item.label}</p>
            <p className={`text-lg sm:text-2xl font-black truncate ${item.highlight ? (stats.totalReturnRate >= 0 ? 'text-emerald-500' : 'text-red-500') : 'text-[#12141c] dark:text-white'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Positions Container */}
      <div className="bg-glass sm:rounded-[2.5rem] rounded-[1.5rem] border border-white/10 overflow-hidden shadow-2xl mx-4 sm:mx-0">
        <div className="p-5 sm:p-8 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-full overflow-hidden w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-[11px] font-black transition-all ${activeTab === tab ? 'bg-white dark:bg-amber-500 text-black dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {translateSignalType(tab)}
              </button>
            ))}
          </div>
          <button className="hidden sm:flex items-center gap-2 px-5 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-[11px] font-black text-gray-500 hover:text-black dark:hover:text-white transition-all uppercase tracking-widest">
            <Download className="w-3.5 h-3.5" /> 导出报告
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                {[
                  { key: 'symbol', label: '标的' },
                  { key: 'status', label: '状态' },
                  { key: 'signalType', label: '周期' },
                  { key: 'investedAmount', label: '本金 ($)' },
                  { key: 'entryPrice', label: '入场价' },
                  { key: 'yieldRate', label: '收益 %' },
                  { key: 'yieldAmount', label: '盈亏 ($)' }
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key as SortKey)}
                    className="px-8 py-6 group/th cursor-pointer hover:bg-black/2 transition-colors"
                  >
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {col.label}
                      <SortArrows columnKey={col.key as SortKey} />
                    </div>
                  </th>
                ))}
                {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">操作</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {processedPositions.map((pos) => (
                <tr key={pos.id} className="group/tr hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#12141c] dark:text-white uppercase tracking-tight">{pos.symbol}</span>
                      <span className="text-[10px] font-bold text-gray-400">{pos.category} / {pos.side}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] ${getStatusStyle(pos.status)}`}>
                      {pos.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-gray-500">{translateSignalType(pos.signalType)}</span>
                  </td>
                  <td className="px-8 py-6 font-bold text-sm text-gray-600 dark:text-gray-300">
                    {pos.investedAmount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-8 py-6 font-bold text-sm text-gray-600 dark:text-gray-300">
                    {pos.entryPrice || '/'}
                  </td>
                  <td className={`px-8 py-6 font-black text-sm ${pos.yieldRate > 0 ? 'text-emerald-500' : pos.yieldRate < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {pos.yieldRate > 0 ? '+' : ''}{pos.yieldRate?.toFixed(2)}%
                  </td>
                  <td className={`px-8 py-6 font-black text-sm ${pos.yieldAmount > 0 ? 'text-emerald-500' : pos.yieldAmount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {pos.yieldAmount > 0 ? '+' : ''}{pos.yieldAmount?.toLocaleString() || '0'}
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(pos)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-amber-500 hover:text-white rounded-lg transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(pos.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Responsive Card List */}
        <div className="sm:hidden divide-y divide-black/5 dark:divide-white/5">
          {processedPositions.map((pos) => (
            <div key={pos.id} className="p-5 space-y-4" onClick={() => isAdmin && onEdit(pos)}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-black text-[#12141c] dark:text-white uppercase tracking-tight leading-none">{pos.symbol}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{pos.category} · {pos.side === 'Buy' ? '多' : '空'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] ${getStatusStyle(pos.status)}`}>
                    {pos.status}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase">{translateSignalType(pos.signalType)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">本金</span>
                    <span className="text-xs font-bold dark:text-gray-200">${pos.investedAmount?.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">收益 %</span>
                    <span className={`text-xs font-black ${pos.yieldRate > 0 ? 'text-emerald-500' : pos.yieldRate < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                       {pos.yieldRate > 0 ? '+' : ''}{pos.yieldRate?.toFixed(2)}%
                    </span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">盈亏 $</span>
                    <span className={`text-xs font-black ${pos.yieldAmount > 0 ? 'text-emerald-500' : pos.yieldAmount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                       {pos.yieldAmount > 0 ? '+' : ''}{pos.yieldAmount?.toLocaleString()}
                    </span>
                 </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(pos.id); }} 
                    className="p-2 bg-red-500/10 text-red-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {processedPositions.length === 0 && (
          <div className="py-20 text-center text-gray-300 dark:text-white/10 italic font-black text-xl">
            No active positions recorded
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionSection;
