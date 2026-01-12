
import React, { useState } from 'react';
import { TrendSignal, SignalStatus, SignalType } from '../types';
import { 
  Radar, 
  Zap, 
  Trash2, 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  Activity,
  History,
  Radio,
  Clock,
  TrendingUp,
  Waves
} from 'lucide-react';

interface TrendMonitoringSectionProps {
  signals: TrendSignal[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: SignalStatus) => void;
}

const TrendMonitoringSection: React.FC<TrendMonitoringSectionProps> = ({ signals, isAdmin, onDelete, onUpdateStatus }) => {
  const [filter, setFilter] = useState<SignalStatus | '全部'>('全部');

  const stats = {
    active: signals.filter(a => a.status === '监听中').length,
    captured: signals.filter(a => a.status === '已捕获').length,
    expired: signals.filter(a => a.status === '已失效').length
  };

  const filteredSignals = signals.filter(a => filter === '全部' || a.status === filter);

  const getSignalConfig = (type: SignalType, status: SignalStatus) => {
    const isCaptured = status === '已捕获';
    if (type === '执行信号') {
      return {
        bg: isCaptured ? 'bg-red-500' : 'bg-red-50 dark:bg-red-900/10',
        text: isCaptured ? 'text-white' : 'text-red-600',
        icon: <Target className={`w-5 h-5 ${isCaptured ? 'animate-ping' : ''}`} />,
        border: isCaptured ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.25)]' : 'border-red-100 dark:border-red-900/30',
        label: '执行'
      };
    }
    return {
      bg: isCaptured ? 'bg-indigo-500' : 'bg-indigo-50 dark:bg-indigo-900/10',
      text: isCaptured ? 'text-white' : 'text-indigo-600',
      icon: <Waves className={`w-5 h-5 ${!isCaptured ? 'animate-pulse' : ''}`} />,
      border: isCaptured ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.25)]' : 'border-indigo-100 dark:border-indigo-900/30',
      label: '结构'
    };
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-24">
      {/* 核心监控仪表盘 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a1d26] p-8 rounded-[2.5rem] border-2 border-amber-100/30 dark:border-white/5 flex items-center justify-between group hover:border-amber-400 transition-all shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">正在监听趋势</p>
              <h3 className="text-3xl font-black text-[#12141c] dark:text-white mt-1">{stats.active}</h3>
            </div>
          </div>
          <Activity className="text-gray-100 dark:text-white/5 w-14 h-14" />
        </div>
        <div className="bg-white dark:bg-[#1a1d26] p-8 rounded-[2.5rem] border-2 border-emerald-100/30 dark:border-white/5 flex items-center justify-between group hover:border-emerald-400 transition-all shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">成功捕获转折</p>
              <h3 className="text-3xl font-black text-[#12141c] dark:text-white mt-1">{stats.captured}</h3>
            </div>
          </div>
          <Zap className="text-gray-100 dark:text-white/5 w-14 h-14" />
        </div>
        <div className="bg-white dark:bg-[#1a1d26] p-8 rounded-[2.5rem] border-2 border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-gray-400 transition-all shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner">
              <History className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">已失效监控</p>
              <h3 className="text-3xl font-black text-[#12141c] dark:text-white mt-1">{stats.expired}</h3>
            </div>
          </div>
          <Clock className="text-gray-100 dark:text-white/5 w-14 h-14" />
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {(['全部', '监听中', '已捕获', '已失效'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-3 rounded-2xl text-[13px] font-black transition-all ${
              filter === f 
                ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-2xl shadow-gray-200 dark:shadow-none' 
                : 'text-gray-400 bg-gray-50 dark:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSignals.length === 0 ? (
          <div className="col-span-full text-center py-40 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]">
            <Radar className="w-16 h-16 text-gray-200 dark:text-white/5 mx-auto mb-6 animate-spin-slow" />
            <p className="italic font-serif text-2xl text-gray-300 dark:text-gray-600">Deep scanning market structure...</p>
          </div>
        ) : (
          filteredSignals.map(signal => {
            const config = getSignalConfig(signal.type, signal.status);
            const isCaptured = signal.status === '已捕获';

            return (
              <div 
                key={signal.id} 
                className={`relative group bg-white dark:bg-[#1a1d26] border-2 ${config.border} rounded-[3rem] p-10 transition-all duration-700 hover:-translate-y-2 overflow-hidden flex flex-col min-h-[320px] shadow-sm`}
              >
                {/* 状态徽章 */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                   {signal.priority === '高' && (
                    <div className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-lg shadow-red-200/50">
                      CRITICAL
                    </div>
                  )}
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
                    {config.label}
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 rounded-[1.25rem] ${config.bg} ${config.text} flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 duration-500`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{signal.symbol}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(signal.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <h4 className="text-2xl font-black text-[#12141c] dark:text-white leading-[1.2] tracking-tight group-hover:text-amber-500 transition-colors">
                    {signal.title}
                  </h4>
                  <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-4">
                    {signal.content}
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${signal.status === '监听中' ? 'bg-amber-500 animate-ping' : isCaptured ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">{signal.status}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-3">
                      {!isCaptured && signal.status !== '已失效' && (
                        <button 
                          onClick={() => onUpdateStatus(signal.id, '已捕获')}
                          className="px-8 py-3 bg-[#12141c] dark:bg-amber-500 text-white text-[12px] font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200/50 dark:shadow-none"
                        >
                          确认捕获
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(signal.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TrendMonitoringSection;
