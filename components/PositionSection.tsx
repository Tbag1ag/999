
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { TrendingUp, Edit2, Trash2, ChevronUp, ChevronDown, Download, Archive } from 'lucide-react';

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
    case '已平仓': return 'bg-white/10 text-gray-400 font-black';
    default: return 'bg-white/5 text-gray-500 font-black';
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
        <ChevronUp className={`w-2 h-2 -mb-1 ${isActive && direction === 'asc' ? 'text-white opacity-100' : 'text-gray-400'}`} />
        <ChevronDown className={`w-2 h-2 ${isActive && direction === 'desc' ? 'text-white opacity-100' : 'text-gray-400'}`} />
      </div>
    );
  };

  const PositionTable = ({ data, isArchived = false }: { data: PositionEntry[], isArchived?: boolean }) => (
    <div className={`bg-glass border border-white/5 overflow-hidden rounded-2xl ${isArchived ? 'opacity-40' : ''}`}>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              {[
                { key: 'symbol', label: '标的' },
                { key: 'status', label: '状态' },
                { key: 'signalType', label: '周期' },
                { key: 'shares', label: '股数' },
                { key: 'entryPrice', label: '入场价' },
                { key: 'yieldRate', label: '收益 %' },
                { key: 'yieldAmount', label: '盈亏 ($)' }
              ].map((col) => (
                <th key={col.key} onClick={() => requestSort(col.key as SortKey)} className="px-8 py-5 group/th cursor-pointer hover:bg-white/5">
                  <div className="flex items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {col.label} <SortArrows columnKey={col.key as SortKey} />
                  </div>
                </th>
              ))}
              {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-widest text-right">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((pos) => (
              <tr key={pos.id} className="group/tr hover:bg-white/5">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-base font-black text-white uppercase tracking-tighter">{pos.symbol}</span>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{pos.category} / {pos.side}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2 py-1 rounded text-[8px] uppercase ${getStatusStyle(pos.status)}`}>{pos.status}</span>
                </td>
                <td className="px-8 py-6 text-[12px] font-bold text-white/80">{translateSignalType(pos.signalType)}</td>
                <td className="px-8 py-6 text-sm font-black text-white">{pos.shares?.toLocaleString()}</td>
                <td className="px-8 py-6 text-sm font-black text-white">{pos.entryPrice || '/'}</td>
                <td className={`px-8 py-6 text-base font-black ${pos.yieldRate > 0 ? 'text-emerald-500' : pos.yieldRate < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {pos.yieldRate > 0 ? '+' : ''}{pos.yieldRate?.toFixed(2)}%
                </td>
                <td className={`px-8 py-6 text-base font-black ${pos.yieldAmount > 0 ? 'text-emerald-500' : pos.yieldAmount < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {pos.yieldAmount > 0 ? '+' : ''}{pos.yieldAmount?.toLocaleString()}
                </td>
                {isAdmin && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/tr:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(pos)} className="p-2 bg-white/5 hover:text-amber-500 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete(pos.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'EQUITY', value: `$${stats.totalEquity.toLocaleString()}` },
          { label: 'DAILY', value: `${stats.dailyReturnRate.toFixed(2)}%` },
          { label: 'MONTHLY', value: `${stats.monthlyReturnRate.toFixed(2)}%` },
          { label: 'TOTAL ROI', value: `${stats.totalReturnRate.toFixed(2)}%`, highlight: true }
        ].map((item, i) => (
          <div key={i} className="bg-glass p-6 sm:p-10 border border-white/5">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">{item.label}</p>
            <p className={`text-xl sm:text-3xl font-black truncate ${item.highlight ? (stats.totalReturnRate >= 0 ? 'text-emerald-500' : 'text-red-500') : 'text-white'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-4 text-[12px] font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {translateSignalType(tab)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-amber-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <button className="hidden sm:flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white transition-colors tracking-widest uppercase">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 ml-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Active Portfolio</h2>
        </div>
        {activePositions.length > 0 ? <PositionTable data={activePositions} /> : (
          <div className="py-24 text-center bg-white/5 rounded-3xl border border-dashed border-white/5 italic font-black text-2xl text-white/5 uppercase tracking-tighter">Scanning for signals...</div>
        )}
      </div>

      {archivedPositions.length > 0 && (
        <div className="space-y-4 pt-10">
          <div className="flex items-center gap-3 ml-2 mb-2">
            <Archive className="w-4 h-4 text-white/20" />
            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Archived History</h2>
          </div>
          <PositionTable data={archivedPositions} isArchived />
        </div>
      )}
    </div>
  );
};

export default PositionSection;
