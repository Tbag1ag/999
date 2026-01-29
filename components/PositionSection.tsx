
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { TrendingUp, Edit2, Trash2, Clock, ChevronUp, ChevronDown, Download, Archive, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  isAdmin: boolean;
  onEdit: (entry: PositionEntry) => void;
  onDelete: (id: string) => void;
}

const INITIAL_CAPITAL = 20000;

const getStatusStyle = (status: PositionStatus) => {
  switch (status) {
    case '持仓中': return 'bg-green-500 text-white font-black shadow-lg shadow-green-500/20';
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

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // 日收益率：仅统计“已平仓”且更新时间在今天的记录
    const dailyProfit = positions
      .filter(p => p.status === '已平仓' && p.updatedAt >= startOfToday)
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    const dailyReturnRate = (dailyProfit / INITIAL_CAPITAL) * 100;

    // 月收益率：仅统计“已平仓”且更新时间在本月的记录
    const monthlyProfit = positions
      .filter(p => p.status === '已平仓' && p.updatedAt >= startOfMonth)
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
    <div className={`bg-glass border border-white/10 overflow-hidden rounded-[2rem] ${isArchived ? 'opacity-50' : ''}`}>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              {[
                { key: 'symbol', label: '标的 / 方向' },
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-[900] text-black dark:text-white uppercase tracking-tighter">{pos.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${pos.side === 'Buy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {pos.side === 'Buy' ? '多头' : '空头'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">{pos.category}</span>
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
                <td className={`px-8 py-7 font-[900] text-xl ${pos.yieldRate > 0 ? 'text-green-400' : pos.yieldRate < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {pos.yieldRate > 0 ? '+' : ''}{pos.yieldRate?.toFixed(2)}%
                </td>
                <td className={`px-8 py-7 font-[900] text-xl ${pos.yieldAmount > 0 ? 'text-green-400' : pos.yieldAmount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {pos.yieldAmount > 0 ? '+' : ''}{pos.yieldAmount?.toLocaleString() || '0'}
                </td>
                {isAdmin && (
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(pos)} className="p-2 bg-black/5 dark:bg-white/10 hover:bg-amber-500 hover:text-white rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(pos.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
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

      <div className="sm:hidden divide-y divide-black/5 dark:divide-white/5 bg-black/10">
        {data.map((pos) => (
          <div key={pos.id} className="p-4 space-y-3" onClick={() => isAdmin && onEdit(pos)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-[900] text-black dark:text-white uppercase tracking-tighter leading-none">{pos.symbol}</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${pos.side === 'Buy' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    {pos.side === 'Buy' ? '多' : '空'}
                  </span>
                </div>
                <p className="text-[9px] font-black text-black/40 dark:text-white/40 mt-1 uppercase tracking-widest">{pos.category}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[8px] ${getStatusStyle(pos.status)}`}>
                {pos.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-lg border border-white/5">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-black/30 dark:text-white/30 uppercase">股数</span>
                  <span className="text-[12px] font-black text-black dark:text-white">{pos.shares?.toLocaleString()}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-black/30 dark:text-white/30 uppercase">收益 %</span>
                  <span className={`text-[12px] font-[900] ${pos.yieldRate > 0 ? 'text-green-400' : 'text-red-500'}`}>
                     {pos.yieldRate?.toFixed(1)}%
                  </span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-black/30 dark:text-white/30 uppercase">盈亏 $</span>
                  <span className={`text-[12px] font-[900] ${pos.yieldAmount >= 0 ? 'text-green-400' : 'text-red-500'}`}>
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
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '总资产 (Equity)', value: `$${stats.totalEquity.toLocaleString()}`, color: 'text-black dark:text-white' },
          { label: '日实现收益 (Daily)', value: `${stats.dailyReturnRate.toFixed(2)}%`, color: stats.dailyReturnRate >= 0 ? 'text-green-400' : 'text-red-500' },
          { label: '月实现收益 (Monthly)', value: `${stats.monthlyReturnRate.toFixed(2)}%`, color: stats.monthlyReturnRate >= 0 ? 'text-green-400' : 'text-red-500' },
          { label: '总收益率 (ROI)', value: `${stats.totalReturnRate.toFixed(2)}%`, color: stats.totalReturnRate >= 0 ? 'text-green-400' : 'text-red-500' }
        ].map((item, i) => (
          <div key={i} className="bg-glass p-6 sm:p-10 border border-white/10 flex flex-col justify-center">
            <p className="text-[9px] font-black text-black/50 dark:text-white/50 uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <p className={`text-xl sm:text-4xl font-[900] truncate ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center sm:justify-between mb-8">
        <div className="flex items-center gap-1 p-1.5 bg-black/10 dark:bg-white/5 backdrop-blur-2xl rounded-full border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-black transition-all uppercase tracking-widest ${
                activeTab === tab 
                ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {translateSignalType(tab)}
            </button>
          ))}
        </div>
        <button className="hidden sm:flex items-center gap-2 text-[10px] font-black text-black/20 dark:text-white/20 uppercase tracking-[0.3em] hover:text-amber-500 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 ml-1">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <h2 className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">活跃标的 ACTIVE PROBES</h2>
        </div>
        {activePositions.length > 0 ? (
          <PositionTable data={activePositions} />
        ) : (
          <div className="py-20 text-center opacity-10 italic font-black text-xl text-black dark:text-white bg-glass">
            Monitoring market signals...
          </div>
        )}
      </div>

      {archivedPositions.length > 0 && (
        <div className="space-y-4 pt-10 border-t border-black/10 dark:border-white/5">
          <div className="flex items-center gap-2 ml-1">
            <Archive className="w-3.5 h-3.5 text-gray-400" />
            <h2 className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">历史档案 ARCHIVED</h2>
          </div>
          <PositionTable data={archivedPositions} isArchived />
        </div>
      )}
    </div>
  );
};

export default PositionSection;
