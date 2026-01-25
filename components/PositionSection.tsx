
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { TrendingUp, Edit2, Trash2, Clock, ChevronUp, ChevronDown, Download, Archive, BarChart3 } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  isAdmin: boolean;
  onEdit: (entry: PositionEntry) => void;
  onDelete: (id: string) => void;
}

const INITIAL_CAPITAL = 20000;

const getStatusStyle = (status: PositionStatus) => {
  switch (status) {
    case '持仓中': return 'bg-emerald-500 text-white font-black';
    case '观察中': return 'bg-amber-500 text-white font-black';
    case '已平仓': return 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-black';
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

  const { activePositions, archivedPositions } = useMemo(() => {
    let base = positions.filter(p => activeTab === '全部' || p.signalType === activeTab);
    
    if (sortConfig !== null) {
      base.sort((a, b) => {
        const aValue = a[sortConfig.key] as any;
        const bValue = b[sortConfig.key] as any;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return {
      activePositions: base.filter(p => p.status !== '已平仓'),
      archivedPositions: base.filter(p => p.status === '已平仓')
    };
  }, [positions, activeTab, sortConfig]);

  const stats = useMemo(() => {
    const totalProfit = positions.reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const totalEquity = INITIAL_CAPITAL + totalProfit;
    const totalReturnRate = (totalProfit / INITIAL_CAPITAL) * 100;

    const now = Date.now();
    const dayAgo = now - 86400000;
    const monthAgo = now - 2592000000;

    const dailyProfit = positions
      .filter(p => p.updatedAt > dayAgo)
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const dailyReturnRate = (dailyProfit / INITIAL_CAPITAL) * 100;

    const monthlyProfit = positions
      .filter(p => p.updatedAt > monthAgo)
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const monthlyReturnRate = (monthlyProfit / INITIAL_CAPITAL) * 100;
    
    return { totalEquity, dailyReturnRate, monthlyReturnRate, totalReturnRate };
  }, [positions]);

  const tabs: (PositionSignalType | '全部')[] = ['全部', 'Short Term', 'Medium Term', 'Long Term'];

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

  const PositionTable = ({ data, isArchived = false }: { data: PositionEntry[], isArchived?: boolean }) => (
    <div className={`bg-glass border border-white/10 overflow-hidden shadow-2xl sm:rounded-[2.5rem] rounded-xl ${isArchived ? 'opacity-60' : ''}`}>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              {[
                { key: 'symbol', label: '标的' },
                { key: 'status', label: '状态' },
                { key: 'signalType', label: '周期' },
                { key: 'shares', label: '股数' },
                { key: 'entryPrice', label: '入场价' },
                { key: 'yieldRate', label: '收益 %' },
                { key: 'yieldAmount', label: '盈亏 ($)' }
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key as SortKey)}
                  className="px-8 py-6 group/th cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center text-[10px] font-black text-black/60 dark:text-white/60 uppercase tracking-[0.2em]">
                    {col.label}
                    <SortArrows columnKey={col.key as SortKey} />
                  </div>
                </th>
              ))}
              {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-black/60 dark:text-white/60 uppercase tracking-widest text-right">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {data.map((pos) => (
              <tr key={pos.id} className="group/tr hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-8 py-7">
                  <div className="flex flex-col">
                    <span className="text-lg font-[900] text-black dark:text-white uppercase tracking-tighter">{pos.symbol}</span>
                    <span className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">{pos.category} / {pos.side}</span>
                  </div>
                </td>
                <td className="px-8 py-7">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] ${getStatusStyle(pos.status)}`}>
                    {pos.status}
                  </span>
                </td>
                <td className="px-8 py-7">
                  <span className="text-[12px] font-black text-black dark:text-white/80">{translateSignalType(pos.signalType)}</span>
                </td>
                <td className="px-8 py-7 font-black text-[15px] text-black dark:text-white/90">
                  {pos.shares?.toLocaleString() || '0'}
                </td>
                <td className="px-8 py-7 font-black text-[15px] text-black dark:text-white/90">
                  {pos.entryPrice || '/'}
                </td>
                <td className={`px-8 py-7 font-[900] text-lg ${pos.yieldRate > 0 ? 'text-emerald-500' : pos.yieldRate < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {pos.yieldRate > 0 ? '+' : ''}{pos.yieldRate?.toFixed(2)}%
                </td>
                <td className={`px-8 py-7 font-[900] text-lg ${pos.yieldAmount > 0 ? 'text-emerald-500' : pos.yieldAmount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {pos.yieldAmount > 0 ? '+' : ''}{pos.yieldAmount?.toLocaleString() || '0'}
                </td>
                {isAdmin && (
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(pos)} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-amber-500 hover:text-white rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(pos.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-black/5 dark:divide-white/5">
        {data.map((pos) => (
          <div key={pos.id} className="p-5 space-y-4" onClick={() => isAdmin && onEdit(pos)}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-[900] text-black dark:text-white uppercase tracking-tighter leading-none">{pos.symbol}</h4>
                <p className="text-[10px] font-black text-black/40 dark:text-white/40 mt-1 uppercase tracking-widest">{pos.category} · {pos.side === 'Buy' ? '多' : '空'}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] ${getStatusStyle(pos.status)}`}>
                {pos.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-black/20 p-4 rounded-xl">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase mb-0.5">股数</span>
                  <span className="text-[13px] font-black text-black dark:text-white">{pos.shares?.toLocaleString()}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase mb-0.5">收益 %</span>
                  <span className={`text-[13px] font-[900] ${pos.yieldRate > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                     {pos.yieldRate?.toFixed(1)}%
                  </span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase mb-0.5">盈亏 $</span>
                  <span className={`text-[13px] font-[900] ${pos.yieldAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                     {pos.yieldAmount?.toLocaleString()}
                  </span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 sm:px-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: '总资产 (Equity)', value: `$${stats.totalEquity.toLocaleString()}` },
          { label: '日收益率 (Daily)', value: `${stats.dailyReturnRate.toFixed(2)}%` },
          { label: '月收益率 (Monthly)', value: `${stats.monthlyReturnRate.toFixed(2)}%` },
          { label: '总收益率 (ROI)', value: `${stats.totalReturnRate.toFixed(2)}%`, highlight: true }
        ].map((item, i) => (
          <div key={i} className="bg-glass p-6 sm:p-10 border border-white/10 flex flex-col justify-center">
            <p className="text-[10px] font-black text-black/50 dark:text-white/50 uppercase tracking-[0.2em] mb-2">{item.label}</p>
            <p className={`text-2xl sm:text-4xl font-[900] truncate ${item.highlight ? (stats.totalReturnRate >= 0 ? 'text-emerald-500' : 'text-red-500') : 'text-black dark:text-white'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
        <div className="flex bg-black/5 dark:bg-black/40 p-1.5 rounded-full stadium-nav w-full sm:w-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-6 sm:px-10 py-3 rounded-full text-[11px] sm:text-[13px] font-black transition-all ${activeTab === tab ? 'bg-white dark:bg-amber-500 text-black dark:text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
            >
              {translateSignalType(tab)}
            </button>
          ))}
        </div>
        <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/10 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:bg-black/10">
          <Download className="w-4 h-4" /> 导出报表
        </button>
      </div>

      {/* 活跃持仓 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 ml-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h2 className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">活跃标的 ACTIVE PROBES</h2>
        </div>
        {activePositions.length > 0 ? (
          <PositionTable data={activePositions} />
        ) : (
          <div className="py-20 text-center opacity-10 italic font-black text-2xl text-black dark:text-white tracking-tighter bg-glass">
            Monitoring market signals...
          </div>
        )}
      </div>

      {/* 已归档持仓 */}
      {archivedPositions.length > 0 && (
        <div className="space-y-4 pt-10">
          <div className="flex items-center gap-3 ml-2 mb-2">
            <Archive className="w-4 h-4 text-gray-400" />
            <h2 className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">历史档案 ARCHIVED</h2>
          </div>
          <PositionTable data={archivedPositions} isArchived />
        </div>
      )}
    </div>
  );
};

export default PositionSection;
