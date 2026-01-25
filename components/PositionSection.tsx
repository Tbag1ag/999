
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { Search, TrendingUp, TrendingDown, Edit2, Trash2, Clock, Calendar, ChevronUp, ChevronDown, Download } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  isAdmin: boolean;
  onEdit: (entry: PositionEntry) => void;
  onDelete: (id: string) => void;
}

const INITIAL_CAPITAL = 20000;

// 状态标签样式
const getStatusStyle = (status: PositionStatus) => {
  switch (status) {
    case '持仓中': return 'bg-emerald-500/15 text-emerald-600 font-black';
    case '观察中': return 'bg-amber-500/15 text-amber-600 font-black';
    case '已平仓': return 'bg-gray-100 text-gray-500 font-black';
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
    return { totalEquity, cash, cashPercent, maxDrawdown: 0.00 };
  }, [positions]);

  const tabs: (PositionSignalType | '全部')[] = ['全部', 'Short Term', 'Medium Term', 'Long Term'];

  const processedPositions = useMemo(() => {
    let filtered = positions.filter(p => {
      const matchesTab = activeTab === '全部' || p.signalType === activeTab;
      return matchesTab;
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
  }, [positions, activeTab, sortConfig]);

  const SortArrows = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortConfig?.key === columnKey;
    const direction = sortConfig?.direction;
    return (
      <div className="flex flex-col ml-1 opacity-20 group-hover/th:opacity-100 transition-opacity">
        <ChevronUp className={`w-2.5 h-2.5 -mb-1 ${isActive && direction === 'asc' ? 'text-[#000000] opacity-100' : 'text-gray-400'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${isActive && direction === 'desc' ? 'text-[#000000] opacity-100' : 'text-gray-400'}`} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* 顶部白色磨砂卡片区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white/85 backdrop-blur-[60px] rounded-[3.5rem] p-10 sm:p-12 shadow-sm">
           <div className="flex justify-between items-baseline mb-12">
              <h3 className="text-5xl font-[900] text-[#000000] tracking-tighter italic">Portfolio</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-12">
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">总资产</div>
                <div className="text-4xl font-[900] text-[#000000] tracking-tight">${stats.totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">现金</div>
                <div className="text-4xl font-[900] text-[#000000] tracking-tight">${stats.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">现金占比</div>
                <div className="text-4xl font-[900] text-[#000000] tracking-tight">{stats.cashPercent.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">最大回撤</div>
                <div className="text-4xl font-[900] text-[#000000] tracking-tight">{stats.maxDrawdown.toFixed(1)}%</div>
              </div>
           </div>
        </div>

        <div className="bg-white/85 backdrop-blur-[60px] rounded-[3.5rem] p-10 sm:p-12 shadow-sm flex flex-col">
           <div className="flex justify-between items-baseline mb-12">
              <h3 className="text-5xl font-[900] text-[#000000] tracking-tighter italic">P&L</h3>
           </div>
           <div className="grid grid-cols-2 gap-y-12">
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">YTD 收益率</div>
                <div className="text-4xl font-[900] text-emerald-500 tracking-tight">+11.6%</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">YTD 收益额</div>
                <div className="text-4xl font-[900] text-emerald-500 tracking-tight">+$2,322</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">MTD 收益率</div>
                <div className="text-4xl font-[900] text-emerald-500 tracking-tight">+11.6%</div>
              </div>
              <div>
                <div className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] mb-3">MTD 收益额</div>
                <div className="text-4xl font-[900] text-emerald-500 tracking-tight">+$2,322</div>
              </div>
           </div>
        </div>
      </div>

      {/* 白色磨砂表格区域 */}
      <div className="bg-white/85 backdrop-blur-[60px] rounded-[3.5rem] overflow-hidden shadow-sm">
        <div className="px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex bg-black/5 p-1.5 rounded-[1.25rem] gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-[1rem] text-[13px] font-black transition-all ${
                  activeTab === tab 
                  ? 'bg-[#000000] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-black'
                }`}
              >
                {activeTab === tab ? '全部记录' : translateSignalType(tab)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-black/5 rounded-[1rem] text-[12px] font-black text-black/50 hover:bg-black hover:text-white transition-all">
              <Download className="w-4 h-4" /> 导出 CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-y border-black/5 text-[11px] font-black text-black/40 uppercase tracking-[0.2em] bg-black/[0.02]">
                <th className="px-10 py-6 text-left group/th cursor-pointer" onClick={() => requestSort('symbol')}>
                  <div className="flex items-center">标的 <SortArrows columnKey="symbol" /></div>
                </th>
                <th className="px-4 py-6 text-center group/th cursor-pointer" onClick={() => requestSort('category')}>
                  <div className="flex items-center justify-center">类别 <SortArrows columnKey="category" /></div>
                </th>
                <th className="px-4 py-6 text-center group/th cursor-pointer" onClick={() => requestSort('status')}>
                  <div className="flex items-center justify-center">状态 <SortArrows columnKey="status" /></div>
                </th>
                <th className="px-4 py-6 text-center">方向</th>
                <th className="px-4 py-6 text-center">周期</th>
                <th className="px-4 py-6 text-center">入场价</th>
                <th className="px-4 py-6 text-center">收益率</th>
                <th className="px-4 py-6 text-center">收益额</th>
                <th className="px-4 py-6 text-center">记录时间</th>
                {isAdmin && <th className="px-10 py-6 text-right">管理</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {processedPositions.map((pos) => (
                <tr key={pos.id} className="group hover:bg-black/[0.02] transition-colors">
                  <td className="px-10 py-6">
                    <div className="text-[16px] font-[900] text-[#000000]">{pos.symbol}</div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <span className="text-[11px] font-black text-black/40 bg-black/5 px-3 py-1 rounded-lg uppercase">{pos.category}</span>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest ${getStatusStyle(pos.status)}`}>{pos.status}</span>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <span className={`text-[15px] font-[900] ${pos.side === 'Buy' ? 'text-emerald-500' : 'text-red-500'}`}>{pos.side === 'Buy' ? '买入' : '卖出'}</span>
                  </td>
                  <td className="px-4 py-6 text-center text-[14px] font-black text-black/60">{translateSignalType(pos.signalType)}</td>
                  <td className="px-4 py-6 text-center text-[15px] font-[900] text-[#000000] italic">{pos.entryPrice || '/'}</td>
                  <td className="px-4 py-6 text-center">
                    <div className={`text-[16px] font-[900] ${pos.yieldRate >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                       {pos.yieldRate >= 0 ? '+' : ''}{pos.yieldRate}%
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <div className={`text-[16px] font-[900] ${pos.yieldAmount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                       {pos.yieldAmount >= 0 ? '+$' : '-$'}{Math.abs(pos.yieldAmount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-[12px] text-black/50 font-black">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(pos.updatedAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(pos)} className="p-2.5 bg-black/5 rounded-xl text-black/40 hover:text-black hover:bg-amber-400 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(pos.id)} className="p-2.5 bg-black/5 rounded-xl text-black/40 hover:text-white hover:bg-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {processedPositions.length === 0 && (
          <div className="py-20 text-center opacity-20 italic font-black text-xl text-black tracking-tight">
            No positions matched your current view
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionSection;
