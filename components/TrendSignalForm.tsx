
import React, { useState } from 'react';
import { TrendSignal, SignalType } from '../types';
import { X, Target, Waves, Send, Zap } from 'lucide-react';

interface TrendSignalFormProps {
  onSave: (data: Partial<TrendSignal>) => void;
  onCancel: () => void;
}

const TrendSignalForm: React.FC<TrendSignalFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TrendSignal>>({
    symbol: '',
    type: '结构转折',
    title: '',
    content: '',
    priority: '中',
    status: '监听中'
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 bg-[#12141c]/70 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-20 sm:zoom-in-95 duration-700">
        <div className="px-12 py-10 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/2">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${formData.type === '执行信号' ? 'bg-red-500 rotate-12' : 'bg-indigo-600 -rotate-6'}`}>
              {formData.type === '执行信号' ? <Target className="w-7 h-7" /> : <Waves className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">部署趋势探针</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Deployment of Market Structural Probe</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-4 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-7 h-7 text-gray-300" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-12 space-y-10">
          <div className="flex gap-5 p-2 bg-gray-100 dark:bg-black/30 rounded-[2rem]">
            {(['结构转折', '执行信号'] as SignalType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({...formData, type: t})}
                className={`flex-1 py-4 rounded-[1.5rem] text-[13px] font-black transition-all ${formData.type === t ? 'bg-white dark:bg-[#1a1d26] text-gray-900 dark:text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t === '结构转折' ? '🌊 结构转折' : '🎯 执行信号'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">资产/标的代码</label>
              <input 
                required
                className="w-full bg-gray-50 dark:bg-black/40 border-2 border-transparent focus:border-amber-400 p-5 rounded-2xl outline-none text-[15px] font-black dark:text-white transition-all shadow-inner"
                placeholder="例如: NVDA"
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">响应优先级</label>
              <select
                className="w-full bg-gray-50 dark:bg-black/40 border-2 border-transparent focus:border-amber-400 p-5 rounded-2xl outline-none text-[15px] font-black dark:text-white appearance-none cursor-pointer transition-all shadow-inner"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as any})}
              >
                <option value="低">LOW - 观察级</option>
                <option value="中">MID - 预警级</option>
                <option value="高">HIGH - 决战级</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">核心论点 / 指令标题</label>
            <input 
              required
              className="w-full bg-gray-50 dark:bg-black/40 border-2 border-transparent focus:border-amber-400 p-5 rounded-2xl outline-none text-xl font-black dark:text-white transition-all shadow-inner"
              placeholder="一句话点破当前逻辑..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">深度研判 / 执行细节</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-50 dark:bg-black/40 border-2 border-transparent focus:border-amber-400 p-6 rounded-[2.5rem] outline-none text-[16px] font-medium dark:text-white resize-none transition-all leading-relaxed shadow-inner"
              placeholder="详细描述转折逻辑或具体的执行挂单计划..."
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-6 rounded-[2.5rem] bg-[#12141c] dark:bg-amber-500 text-white font-black text-[15px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(251,191,36,0.3)] dark:shadow-none">
            <Zap className="w-6 h-6 fill-current" /> 启动全球趋势监控
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrendSignalForm;
