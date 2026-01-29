
import React, { useState, useRef } from 'react';
import { MarketInsight, AssetStatus, CompletionStatus } from '../types';
import { X, Calendar as CalendarIcon, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface InsightFormProps {
  initialData?: MarketInsight;
  onSave: (data: Partial<MarketInsight>) => void;
  onCancel: () => void;
}

const InsightForm: React.FC<InsightFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MarketInsight>>(
    initialData || {
      symbol: '',
      category: '美股',
      status: '震荡',
      focusPoints: '',
      strategy: '',
      entryLevel: '',
      imageUrl: '',
      updatedAt: Date.now(),
      completionStatus: '进行中',
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return new Date().toISOString().split('T')[0];
    return new Date(timestamp).toISOString().split('T')[0];
  };

  const statuses: CompletionStatus[] = ['进行中', '已完成', '已失效'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl h-[92vh] sm:h-auto overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 border border-gray-100">
        <div className="p-5 sm:p-6 px-6 sm:px-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
            {initialData ? '更新市场观点' : '记录新观点'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[calc(92vh-80px)] sm:max-h-[85vh]">
          {/* 图片上传区域 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">配图 (图文结合)</label>
            <div 
              onClick={() => !formData.imageUrl && fileInputRef.current?.click()}
              className={`relative h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${formData.imageUrl ? 'border-amber-500' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200'}`}
            >
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="p-3 bg-white text-gray-900 rounded-full shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ''}); }}
                      className="p-3 bg-red-500 text-white rounded-full shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">点击上传行情图</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          {/* 完成状态选择 */}
          <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl space-y-3 border border-gray-100">
            <div>
              <p className="text-sm font-black text-gray-900">进展状态</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">选择状态将改变卡片配色</p>
            </div>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, completionStatus: s })}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all ${
                    formData.completionStatus === s
                      ? s === '已完成' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                        : s === '已失效' ? 'bg-slate-500 text-white shadow-lg shadow-slate-100'
                        : 'bg-red-500 text-white shadow-lg shadow-red-100'
                      : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${formData.completionStatus === s ? 'bg-white' : 'bg-gray-300'}`} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> 日期
              </label>
              <input
                type="date"
                className="w-full p-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-bold"
                value={formatDateForInput(formData.updatedAt)}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  setFormData({ ...formData, updatedAt: selectedDate.getTime() });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">代码</label>
              <input
                required
                className="w-full p-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-black uppercase"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="BTC"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">分类</label>
              <select
                className="w-full p-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all appearance-none text-sm font-bold"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.filter(c => c !== '全部').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">状态</label>
              <select
                className="w-full p-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all appearance-none text-sm font-bold"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
              >
                <option value="看涨">看涨</option>
                <option value="看跌">看跌</option>
                <option value="震荡">震荡</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">核心观察</label>
            <textarea
              required
              rows={3}
              className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all text-sm leading-relaxed font-bold"
              value={formData.focusPoints}
              onChange={(e) => setFormData({ ...formData, focusPoints: e.target.value })}
              placeholder="观察价格行为..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">应对策略</label>
              <textarea
                required
                rows={2}
                className="w-full p-4 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all text-sm leading-relaxed font-bold"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                placeholder="拟定计划..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">入场点位</label>
              <input
                className="w-full p-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-black"
                value={formData.entryLevel}
                onChange={(e) => setFormData({ ...formData, entryLevel: e.target.value })}
                placeholder="92,500.00"
              />
            </div>
          </div>

          <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4 pb-8 sm:pb-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-2xl border border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#12141c] text-white font-black text-sm hover:bg-black transition-colors shadow-xl shadow-gray-200"
            >
              {initialData ? '保存' : '立即投递'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsightForm;
