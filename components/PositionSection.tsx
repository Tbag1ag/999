
import React, { useState, useMemo } from 'react';
import { PositionEntry, PositionSignalType, PositionStatus } from '../types';
import { Search, TrendingUp, TrendingDown, Edit2, Trash2, Clock, Calendar, Info, ChevronUp, ChevronDown, Download, Zap } from 'lucide-react';

interface PositionSectionProps {
  positions: PositionEntry[];
  livePrices: Record<string, number>;
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

const PositionSection: React.FC<PositionSectionProps> = ({ positions, livePrices, isAdmin, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<PositionSignalType | '全部'>('全部');
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    // 基础资产 = 初始资金 + 已实现盈亏
    const realizedProfit = positions
      .filter(p => p.status === '已平仓')
      .reduce((sum, p) => sum + (p.yieldAmount || 0), 0);
    
    // 未实现盈亏
    const unrealizedProfit = positions
      .filter(p => p.status === '持仓中')
      .reduce((sum, p) => {
        const currentPrice = livePrices[p.symbol];
        if (currentPrice && p.entryPrice) {
          const sideFactor = p.side === 'Buy' ? 1 : -1;
          const profitRate = (currentPrice - p.entryPrice) / p.entryPrice * sideFactor;
          return sum + (p.investedAmount * profitRate);
        }
        return sum + (p.yieldAmount || 0);
      }, 0);

    const totalEquity = INITIAL_CAPITAL + realizedProfit + unrealizedProfit;
    const investedInOpen = positions
      .filter(p => p.status === '持仓中')
      .reduce((sum, p) => sum + (p.investedAmount || 0), 0);
    
    const cash = totalEquity - investedInOpen;

    return {
      totalEquity,
      cash,
      cashPercent: totalEquity > 0 ? (cash / totalEquity) * 100 : 100,
      totalReturn: ((totalEquity - INITIAL_CAPITAL) / INITIAL_CAPITAL * 100)
    };
  }, [positions, livePrices]);

  const filteredPositions = positions.filter(p => {
    const matchesTab = activeTab === '全部' || p.signalType === activeTab;
    const matchesSearch = p.symbol.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] p-10 border-2 border-gray-100 dark:border-white/10 shadow-sm">
           <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter italic mb-10">Real-time Portfolio</h3>
           <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">总资产净值 <Zap className="w-3 h-3 text-amber-500 fill-current" /></div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.totalEquity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">闲置现金</div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">${stats.cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">累计总收益</div>
                <div className={`text-3xl font-black ${stats.totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">现金比率</div>
                <div className="text-3xl font-black text-[#12141c] dark:text-white">{stats.cashPercent.toFixed(1)}%</div>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-[#1a1d26]/50 rounded-[2.5rem] border-2 border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-white/10 text-[11px] font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest bg-gray-50/50">
                <th className="px-8 py-5 text-left">标的</th>
                <th className="px-4 py-5 text-center">状态</th>
                <th className="px-4 py-5 text-center">当前价</th>
                <th className="px-4 py-5 text-center">入场价</th>
                <th className="px-4 py-5 text-center">浮动盈亏</th>
                <th className="px-4 py-5 text-center">持仓额</th>
                {isAdmin && <th className="px-8 py-5 text-right">管理</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredPositions.map((pos) => {
                const livePrice = livePrices[pos.symbol];
                const sideFactor = pos.side === 'Buy' ? 1 : -1;
                const currentROI = (livePrice && pos.entryPrice) 
                  ? ((livePrice - pos.entryPrice) / pos.entryPrice * 100 * sideFactor).toFixed(2)
                  : pos.yieldRate;

                return (
                  <tr key={pos.id} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-[15px] font-black text-[#12141c] dark:text-white uppercase">{pos.symbol}</div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusStyle(pos.status)}`}>{pos.status}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="text-[14px] font-black text-amber-500 italic">
                        {livePrice ? `$${livePrice.toLocaleString()}` : '---'}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center text-[13px] font-medium text-gray-400">${pos.entryPrice?.toLocaleString()}</td>
                    <td className={`px-4 py-5 text-center text-[14px] font-black ${parseFloat(currentROI.toString()) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {parseFloat(currentROI.toString()) >= 0 ? '+' : ''}{currentROI}%
                    </td>
                    <td className="px-4 py-5 text-center text-[14px] font-black text-[#12141c] dark:text-white">
                      ${pos.investedAmount?.toLocaleString()}
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => onDelete(pos.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionSection;
