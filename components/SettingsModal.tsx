
import React, { useState } from 'react';
import { X, Mail, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#12141c]/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">推送设置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">邮件预警通知</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">开启后将向指定邮箱发送波动预警</p>
              </div>
              <button 
                onClick={() => setLocalConfig({...localConfig, isEmailEnabled: !localConfig.isEmailEnabled})}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${localConfig.isEmailEnabled ? 'bg-amber-500' : 'bg-gray-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${localConfig.isEmailEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {localConfig.isEmailEnabled && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">接收邮箱地址 Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="email"
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 pl-12 rounded-2xl outline-none text-sm font-black dark:text-white transition-all"
                    placeholder="example@mail.com"
                    value={localConfig.notificationEmail}
                    onChange={e => setLocalConfig({...localConfig, notificationEmail: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3">
            <Shield className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed uppercase tracking-tight">
              系统将根据你标记的“闹钟”图标实时追踪行情，并在触发表单逻辑（如收益率波动 > 5% 或 达到止盈点位）时自动推送邮件。
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              isSaved 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-[#12141c] dark:bg-amber-500 text-white shadow-gray-200 dark:shadow-none hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isSaved ? <><CheckCircle2 className="w-5 h-5" /> 配置已更新</> : <><Save className="w-5 h-5" /> 保存配置</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
