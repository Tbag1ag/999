
import React, { useState } from 'react';
import { MarketAlert, AlertType, AlertStatus } from '../types';
import { X, BellRing, ShieldAlert } from 'lucide-react';

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#12141c]/40 backdrop-blur-xl">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/5">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-xl text-white shadow-lg shadow-red-200 dark:shadow-none"><BellRing className="w-4 h-4" /></div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">发布系统警报</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="flex gap-4 p-1.5 bg-gray-50 dark:bg-[#0f1117] rounded-2xl">
            {(['方向性', '交易性'] as AlertType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({...formData, type: t})}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${formData.type === t ? 'bg-white dark:bg-[#1a1d26] text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/10' : 'text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              required
              className="w-full bg-gray-50 dark:bg-[#0f1117] border border-transparent focus:border-gray-200 dark:focus:border-white/10 p-4 rounded-2xl outline-none text-sm font-black dark:text-white"
              placeholder="标的代码 (如 BTC)"
              value={formData.symbol}
              onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
            />
            <select
              className="w-full bg-gray-50 dark:bg-[#0f1117] border border-transparent focus:border-gray-200 p-4 rounded-2xl outline-none text-sm font-black dark:text-white appearance-none"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value as any})}
            >
              <option value="低">低优先级</option>
              <option value="中">中优先级</option>
              <option value="高">高优先级</option>
            </select>
          </div>

          <input 
            required
            className="w-full bg-gray-50 dark:bg-[#0f1117] border border-transparent focus:border-gray-200 p-4 rounded-2xl outline-none text-sm font-bold dark:text-white"
            placeholder="简短的标题"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />

          <textarea 
            rows={4}
            className="w-full bg-gray-50 dark:bg-[#0f1117] border border-transparent focus:border-gray-200 p-4 rounded-2xl outline-none text-sm font-medium dark:text-white resize-none"
            placeholder="警报详细逻辑或执行计划..."
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
          />

          <button type="submit" className="w-full py-4 rounded-2xl bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none">
            上线警报系统
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;
