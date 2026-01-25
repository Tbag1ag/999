
import React, { useState } from 'react';
import { Bell, X, Trash2, Info, Zap, Newspaper, Inbox, MessageSquare, Sparkles } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll, 
  onDelete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h前`;
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  const getTypeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case '随笔':
        return { bg: 'bg-purple-50', text: 'text-purple-500', icon: <MessageSquare className="w-5 h-5" />, accent: 'border-purple-100 ring-purple-50' };
      case '新闻':
        return { bg: 'bg-blue-50', text: 'text-blue-500', icon: <Newspaper className="w-5 h-5" />, accent: 'border-blue-100 ring-blue-50' };
      case '逻辑':
        return { bg: 'bg-amber-50', text: 'text-amber-500', icon: <Sparkles className="w-5 h-5" />, accent: 'border-amber-100 ring-amber-50' };
      case 'market':
        return { bg: 'bg-red-50', text: 'text-red-500', icon: <Zap className="w-5 h-5" />, accent: 'border-red-100 ring-red-50' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-400', icon: <Info className="w-5 h-5" />, accent: 'border-gray-100 ring-gray-50' };
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all group active:scale-95"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-amber-500 fill-amber-50' : 'text-gray-400 group-hover:text-gray-900 dark:text-gray-500 dark:group-hover:text-white'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#1a1d26] rounded-full animate-pulse shadow-sm" />
        )}
      </button>

      {/* 遮罩层 - 使用极高的 z-index */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div className={`fixed top-0 right-0 h-[100dvh] w-full sm:max-w-[380px] bg-white dark:bg-[#1a1d26] z-[9999] shadow-[-20px_0_50px_-15px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out flex flex-col border-l border-gray-100 dark:border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="px-6 py-5 border-b border-gray-50 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-white/2 backdrop-blur-md">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-[#12141c] dark:text-white tracking-tight">消息中心</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">共 {notifications.length} 条通知</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }} 
            className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                <Inbox className="w-8 h-8 text-gray-200 dark:text-gray-700" />
              </div>
              <p className="font-serif italic text-xl text-gray-300 dark:text-gray-600">目前空空如也...</p>
            </div>
          ) : (
            notifications.map((n, index) => {
              const style = getTypeStyle(n.type);
              return (
                <div 
                  key={n.id} 
                  className="group relative p-5 rounded-[2rem] border dark:border-white/5 transition-all animate-in fade-in slide-in-from-right-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => !n.isRead && onMarkAsRead(n.id)}
                >
                  <div className={`absolute inset-0 rounded-[2rem] transition-opacity ${n.isRead ? 'opacity-0' : `opacity-100 shadow-sm border ${style.accent} ring-1`}`} />
                  <div className="relative flex gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${style.bg} ${style.text}`}>
                      {style.icon}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">{formatTime(n.timestamp)}</span>
                        {!n.isRead && <span className={`h-2 w-2 rounded-full ${n.type === 'market' ? 'bg-red-500' : 'bg-amber-500'}`} />}
                      </div>
                      <h4 className="text-sm font-black text-[#12141c] dark:text-white mb-1 truncate">{n.title}</h4>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-6 border-t border-gray-50 dark:border-white/5 bg-white/50 dark:bg-[#1a1d26]/50 backdrop-blur-md shrink-0">
            <button onClick={onClearAll} className="w-full py-4 rounded-2xl bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl">
              <Trash2 className="w-4 h-4" /> 全部清除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
