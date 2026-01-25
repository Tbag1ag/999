
import React, { useState } from 'react';
import { PositionEntry, PositionSignalType, PositionSide, PositionStatus, Category } from '../types';
import { X, Save, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface PositionFormProps {
  initialData?: PositionEntry;
  onSave: (data: Partial<PositionEntry>) => void;
  onCancel: () => void;
}

const PositionForm: React.FC<PositionFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PositionEntry>>(
    initialData || {
      symbol: '',
      category: '美股',
      signalType: 'Short Term',
      side: 'Buy',
      status: '观察中',
      entryPrice: 0,
      shares: 1,
      yieldRate: 0,
      yieldAmount: 0,
      updatedAt: Date.now()
    }
  );

  const signalTypes: {label: string, value: PositionSignalType}[] = [
    { label: '短期', value: 'Short Term' },
    { label: '中期', value: 'Medium Term' },
    { label: '长期', value: 'Long Term' }
  ];
  const statusOptions: PositionStatus[] = ['持仓中', '观察中', '已平仓'];

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return new Date().toISOString().split('T')[0];
    return new Date(timestamp).toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#12141c]/70 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-500">
        <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#12141c] dark:bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#12141c] dark:text-white uppercase tracking-tight">仓位部署</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Deployment Portfolio Probe</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">记录日期</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="date"
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 pl-12 rounded-2xl outline-none text-[14px] font-black dark:text-white transition-all"
                  value={formatDateForInput(formData.updatedAt)}
                  onChange={e => setFormData({...formData, updatedAt: new Date(e.target.value).getTime()})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">类别</label>
              <select 
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[14px] font-bold dark:text-white appearance-none cursor-pointer transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {CATEGORIES.filter(c => c !== '全部').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">标的代码</label>
              <input 
                required 
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[16px] font-black dark:text-white transition-all uppercase tracking-tighter" 
                placeholder="例如: BTC" 
                value={formData.symbol} 
                onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">当前状态</label>
              <select className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-3.5 rounded-2xl outline-none text-[13px] font-black dark:text-white appearance-none transition-all cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PositionStatus})}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">交易方向 (Side)</label>
            <div className="flex gap-3 p-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({...formData, side: 'Buy'})}
                className={`flex-1 py-3 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 transition-all ${
                  formData.side === 'Buy' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                  : 'text-gray-400 hover:text-emerald-500'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> 买入 / 多
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, side: 'Sell'})}
                className={`flex-1 py-3 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 transition-all ${
                  formData.side === 'Sell' 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none' 
                  : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> 卖出 / 空
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">持股数量 (Shares)</label>
              <input 
                type="number" 
                min="1"
                step="1"
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[15px] font-black dark:text-white transition-all" 
                value={formData.shares || ''} 
                onChange={e => setFormData({...formData, shares: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">入场价格</label>
              <input 
                type="number" 
                step="any" 
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[15px] font-black dark:text-white transition-all placeholder:text-gray-300" 
                placeholder={formData.status === '观察中' ? '/' : '0.00'}
                value={formData.entryPrice || ''} 
                onChange={e => setFormData({...formData, entryPrice: parseFloat(e.target.value) || 0})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">收益率 (%)</label>
              <input type="number" step="any" className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[15px] font-black dark:text-white transition-all" value={formData.yieldRate} onChange={e => setFormData({...formData, yieldRate: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">收益额 ($)</label>
              <input type="number" step="any" className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 p-4 rounded-2xl outline-none text-[15px] font-black dark:text-white transition-all" value={formData.yieldAmount} onChange={e => setFormData({...formData, yieldAmount: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">投资周期</label>
            <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl overflow-x-auto no-scrollbar">
              {signalTypes.map(t => (
                <button key={t.value} type="button" onClick={() => setFormData({...formData, signalType: t.value})} className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${formData.signalType === t.value ? 'bg-white dark:bg-[#1a1d26] shadow-md text-[#12141c] dark:text-white' : 'text-gray-400'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl border border-gray-100 dark:border-white/5 text-gray-400 font-black text-[13px] hover:bg-gray-50 transition-colors">取消</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-[#12141c] dark:bg-amber-500 text-white font-black text-[13px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
              <Save className="w-4 h-4" /> 记录并同步资产
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionForm;
