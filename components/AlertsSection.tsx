
import React, { useState } from 'react';
import { MarketAlert, AlertStatus, AlertType } from '../types';
// Added Clock to the imports from lucide-react
import { 
  BellRing, 
  Radar, 
  Zap, 
  Trash2, 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  Activity,
  History,
  Radio,
  Clock
} from 'lucide-react';

interface AlertsSectionProps {
  alerts: MarketAlert[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: AlertStatus) => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, isAdmin, onDelete, onUpdateStatus }) => {
  const [filter, setFilter] = useState<AlertStatus | '全部'>('全部');

  const stats = {
    active: alerts.filter(a => a.status === '监听中').length,
    triggered: alerts.filter(a => a.status === '已触发').length,
    expired: alerts.filter(a => a.status === '已失效').length
  };

  const filteredAlerts = alerts.filter(a => filter === '全部' || a.status === filter);

  const getAlertConfig = (type: AlertType, status: AlertStatus) => {
    const isTriggered = status === '已触发';
    if (type === '交易性') {
      return {
        bg: isTriggered ? 'bg-red-500' : 'bg-red-50 dark:bg-red-900/10',
        text: isTriggered ? 'text-white' : 'text-red-600',
        icon: <Target className={`w-5 h-5 ${isTriggered ? 'animate-ping' : ''}`} />,
        border: isTriggered ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-red-100 dark:border-red-900/30',
        label: '执行指令'
      };
    }
    return {
      bg: isTriggered ? 'bg-indigo-500' : 'bg-indigo-50 dark:bg-indigo-900/10',
      text: isTriggered ? 'text-white' : 'text-indigo-600',
      icon: <Radar className={`w-5 h-5 ${!isTriggered ? 'animate-spin-slow' : ''}`} />,
      border: isTriggered ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-indigo-100 dark:border-indigo-900/30',
      label: '方向研判'
    };
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
      {/* 顶部监控统计栏 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1d26] p-6 rounded-[2rem] border-2 border-amber-100/50 dark:border-white/5 flex items-center justify-between group hover:border-amber-400 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">监听中信号</p>
              <h3 className="text-2xl font-black text-[#12141c] dark:text-white">{stats.active}</h3>
            </div>
          </div>
          <Activity className="text-gray-100 dark:text-white/5 w-12 h-12" />
        </div>
        <div className="bg-white dark:bg-[#1a1d26] p-6 rounded-[2rem] border-2 border-emerald-100/50 dark:border-white/5 flex items-center justify-between group hover:border-emerald-400 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">已触发执行</p>
              <h3 className="text-2xl font-black text-[#12141c] dark:text-white">{stats.triggered}</h3>
            </div>
          </div>
          <Zap className="text-gray-100 dark:text-white/5 w-12 h-12" />
        </div>
        <div className="bg-white dark:bg-[#1a1d26] p-6 rounded-[2rem] border-2 border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-gray-400 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">已失效记录</p>
              <h3 className="text-2xl font-black text-[#12141c] dark:text-white">{stats.expired}</h3>
            </div>
          </div>
          <Clock className="text-gray-100 dark:text-white/5 w-12 h-12" />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6">
        <div className="flex gap-2">
          {(['全部', '监听中', '已触发', '已失效'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[12px] font-black transition-all ${
                filter === f 
                  ? 'bg-[#12141c] dark:bg-amber-500 text-white shadow-xl shadow-gray-200 dark:shadow-none' 
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full text-center py-32 opacity-20 italic font-serif text-3xl dark:text-white">
            System Monitoring...
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const config = getAlertConfig(alert.type, alert.status);
            const isTriggered = alert.status === '已触发';

            return (
              <div 
                key={alert.id} 
                className={`relative group bg-white dark:bg-[#1a1d26] border-2 ${config.border} rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
              >
                {/* 背景装饰动效 */}
                {isTriggered && (
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      {config.icon}
                   </div>
                )}

                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{alert.symbol}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  {alert.priority === '高' && (
                    <div className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse flex items-center gap-1.5 shadow-lg shadow-red-200">
                      <AlertTriangle className="w-3 h-3" /> 紧急
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-[#12141c] dark:text-white leading-tight tracking-tight">
                    {alert.title}
                  </h4>
                  <p className="text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    {alert.content}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${alert.status === '监听中' ? 'bg-amber-500 animate-pulse' : isTriggered ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{alert.status}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      {!isTriggered && (
                        <button 
                          onClick={() => onUpdateStatus(alert.id, '已触发')}
                          className="px-6 py-2 bg-[#12141c] dark:bg-amber-500 text-white text-[11px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200"
                        >
                          标记触发
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(alert.id)}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
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
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AlertsSection;
