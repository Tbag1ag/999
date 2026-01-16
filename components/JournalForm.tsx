
import React, { useState } from 'react';
import { JournalEntry, EntryType } from '../types';
import { X, Save, Link as LinkIcon, Sparkles, Calendar } from 'lucide-react';

interface JournalFormProps {
  initialData?: JournalEntry;
  onSave: (data: Partial<JournalEntry>) => void;
  onCancel: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<JournalEntry>>(
    initialData || {
      title: '',
      content: '',
      mood: '冷静',
      type: '随笔',
      source: '',
      date: Date.now()
    }
  );

  const types: EntryType[] = ['随笔', '逻辑', '新闻'];

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return new Date().toISOString().split('T')[0];
    return new Date(timestamp).toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xl">
      <div className="bg-white dark:bg-[#1a1d26] rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-white/5">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#12141c] dark:bg-amber-500 rounded-xl text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">信息捕捉</h2>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">捕捉时间</label>
               <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                 <input
                   type="date"
                   className="w-full p-3.5 pl-12 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-amber-400 rounded-2xl outline-none text-sm font-bold dark:text-white transition-all"
                   value={formatDateForInput(formData.date)}
                   onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                 />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">记录分类</label>
               <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl h-[52px]">
                {types.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type: t})}
                    className={`flex-1 rounded-xl text-[11px] font-black transition-all ${formData.type === t ? 'bg-white dark:bg-[#1a1d26] text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/10' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <input 
               className="w-full text-xl font-black text-[#12141c] dark:text-white bg-transparent outline-none placeholder:text-gray-200"
               placeholder="标题 (可选)..."
               value={formData.title}
               onChange={e => setFormData({...formData, title: e.target.value})}
             />
             
             <textarea 
               required
               rows={6}
               className="w-full p-0 bg-transparent outline-none text-[15px] leading-relaxed font-medium dark:text-gray-300 placeholder:text-gray-300 resize-none"
               placeholder="在此粘贴有用信息、研报核心、或你的盘中感悟..."
               value={formData.content}
               onChange={e => setFormData({...formData, content: e.target.value})}
             />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-4">
               <div className="flex-grow flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-transparent focus-within:border-amber-400 transition-all">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-300" />
                  <input 
                    className="bg-transparent outline-none text-[12px] font-bold w-full dark:text-white placeholder:text-gray-300"
                    placeholder="来源链接 (可选)"
                    value={formData.source}
                    onChange={e => setFormData({...formData, source: e.target.value})}
                  />
               </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl border border-gray-100 dark:border-white/5 text-gray-400 font-black text-sm">取消</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-[#12141c] dark:bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
              <Save className="w-4 h-4" /> 投递到瀑布流
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalForm;
