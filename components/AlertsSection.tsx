
import React, { useState } from 'react';
import { MarketAlert, AlertStatus, AlertType } from '../types';
import { BellRing, Radar, Zap, Trash2, CheckCircle, Clock, AlertTriangle, MoreHorizontal } from 'lucide-react';

interface AlertsSectionProps {
  alerts: MarketAlert[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: AlertStatus) => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, isAdmin, onDelete, onUpdateStatus }) => {
  const [filter, setFilter] = useState<AlertStatus | '全部'>('全部');

  const filteredAlerts = alerts.filter(a => filter === '全部' || a.status === filter);

  const getStyle = (type: AlertType) => {
    return type === '交易性' 
      ? { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600', icon: <Zap className="w-4 h-4" />, border: 'border-emerald-200 dark:border-emerald-800/30' }
      : { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-600', icon: <Radar className="w-4 h-4" />, border: 'border-indigo-200 dark:border-indigo-800/30' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {(['全部', '监听中', '已触发', '已失效'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-[13px] font-black transition-all ${
              filter === f 
                ? 'bg-[#12141c] dark:bg-amber-500 text-white' 
                : 'text-gray-400 bg-gray-50 dark:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-20 text-gray-300 italic font-serif text-xl">监控雷达扫描中... 暂无警报</div>
        ) : (
          filteredAlerts.map(alert => {
            const style = getStyle(alert.type);
            return (
              <div key={alert.id} className={`group relative bg-white dark:bg-[#1a1d26] border-2 ${style.border} rounded-3xl p-5 flex items-center gap-6 transition-all hover:shadow-xl hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center shrink-0 shadow-inner`}>
                  {style.icon}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-black text-gray-900 dark:text-white">{alert.symbol}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                      {alert.type}
                    </span>
                    {alert.priority === '高' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                  </div>
                  <h4 className="text-lg font-black text-[#12141c] dark:text-white truncate">{alert.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{alert.content}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 px-4 border-l border-gray-100 dark:border-white/5">
                  <div className="text-right">
                    <div className={`text-[10px] font-black uppercase mb-1 ${alert.status === '监听中' ? 'text-amber-500' : 'text-gray-400'}`}>
                      {alert.status}
                    </div>
                    <div className="text-[10px] text-gray-300 font-medium">
                      {new Date(alert.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onUpdateStatus(alert.id, '已触发')}
                        className="p-2 text-gray-300 hover:text-emerald-500 rounded-lg transition-colors"
                        title="标记触发"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(alert.id)}
                        className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
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
    </div>
  );
};

export default AlertsSection;
