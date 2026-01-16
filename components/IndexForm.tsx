
import React, { useState } from 'react';
import { FearGreedIndex } from '../types';
import { X, Thermometer, Send, Percent, Calendar } from 'lucide-react';

interface IndexFormProps {
  initialData?: FearGreedIndex;
  onSave: (data: Partial<FearGreedIndex>) => void;
  onCancel: () => void;
}

const IndexForm: React.FC<IndexFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FearGreedIndex>>(
    initialData || {
      symbol: '',
      score: 50,
      updatedAt: Date.now()
    }
  );

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return new Date().toISOString().split('T')[0];
    return new Date(timestamp).toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-[#12141c]/60 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/5 animate-in slide-in-from-bottom-20 sm:zoom-in-95 duration-500">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">指数快报</h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Quick Pulse Recording</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">记录时间</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="date"
                  className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-4 pl-12 rounded-2xl outline-none text-sm font-black dark:text-white transition-all shadow-inner"
                  value={formatDateForInput(formData.updatedAt)}
                  onChange={e => setFormData({...formData, updatedAt: new Date(e.target.value).getTime()})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">资产/标的代码</label>
              <input 
                required
                className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-5 rounded-2xl outline-none text-2xl font-black dark:text-white transition-all shadow-inner uppercase"
                placeholder="BTC / NVDA"
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">当前情绪分数 (0-100)</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-amber-400 p-5 rounded-2xl outline-none text-4xl font-black dark:text-white transition-all shadow-inner text-center"
                  value={formData.score}
                  onChange={e => setFormData({...formData, score: parseInt(e.target.value) || 0})}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300"><Percent className="w-6 h-6" /></div>
              </div>
              <div className="flex justify-between px-2">
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">0 极度恐惧</span>
                 <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">100 极度贪婪</span>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-5 rounded-[2rem] bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">
            <Send className="w-5 h-5" /> 发布指数大字报
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndexForm;
