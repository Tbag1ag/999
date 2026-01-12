
import React, { useState } from 'react';
import { MarketAlert, AlertType, AlertStatus } from '../types';
import { X, BellRing, Target, Radar, Send } from 'lucide-react';

interface AlertFormProps {
  onSave: (data: Partial<MarketAlert>) => void;
  onCancel: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MarketAlert>>({
    symbol: '',
    type: '方向性',
    title: '',
    content: '',
    priority: '中',
    status: '监听中'
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-[#12141c]/60 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500">
        <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${formData.type === '交易性' ? 'bg-red-500' : 'bg-indigo-500'}`}>
              {formData.type === '交易性' ? <Target className="w-6 h-6" /> : <Radar className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">发布信号指令</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">部署实时行情监控探针</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-10 space-y-8">
          <div className="flex gap-4 p-2 bg-gray-100 dark:bg-black/20 rounded-[1.5rem]">
            {(['方向性', '交易性'] as AlertType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({...formData, type: t})}
                className={`flex-1 py-3.5 rounded-[1.25rem] text-[12px] font-black transition-all ${formData.type === t ? 'bg-white dark:bg-[#1a1d26] text-gray-900 dark:text-white shadow-md' : 'text-gray-400'}`}
              >
                {t === '方向性' ? '🔍 方向研判' : '🎯 交易执行'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">资产代码</label>
              <input 
                required
                className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-sm font-black dark:text-white transition-all"
                placeholder="例如: BTC"
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">紧急程度</label>
              <select
                className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-sm font-black dark:text-white appearance-none cursor-pointer transition-all"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="低">低优先级</option>
                <option value="中">中优先级</option>
                <option value="高">🚨 高优先级</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">警报标题</label>
            <input 
              required
              className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-lg font-black dark:text-white transition-all"
              placeholder="信号核心点..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">详细研判 / 执行逻辑</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-5 rounded-[2rem] outline-none text-sm font-medium dark:text-white resize-none transition-all leading-relaxed"
              placeholder="详细描述你的观察结果或具体的挂单、止损点位..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-5 rounded-[2rem] bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-gray-200 dark:shadow-none">
            <Send className="w-5 h-5" /> 部署全球监控网络
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;
