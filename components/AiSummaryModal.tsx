
import React from 'react';
import { X, Sparkles, Copy, Check, ShieldAlert, Cpu, Lightbulb } from 'lucide-react';

interface AiSummaryModalProps {
  content: string;
  onClose: () => void;
  isLoading: boolean;
}

const AiSummaryModal: React.FC<AiSummaryModalProps> = ({ content, onClose, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#12141c]/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-amber-100/50 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        {/* 头部 */}
        <div className="px-10 py-8 bg-gradient-to-br from-amber-50 to-white border-b border-amber-100/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#12141c] tracking-tight">AI 宏观研判</h2>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-0.5">Gemini 3.0 Intelligence Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-grow overflow-y-auto px-10 py-10">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <p className="text-gray-400 font-bold italic animate-pulse">正在深度分析市场多空博弈逻辑...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-gray-700 font-medium">
                  {content}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center text-center">
                  <Cpu className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">算力驱动</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center text-center">
                  <ShieldAlert className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">风控优先</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center text-center">
                  <Lightbulb className="w-5 h-5 text-gray-400 mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase">逻辑至上</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        {!isLoading && (
          <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 shrink-0 flex gap-4">
            <button 
              onClick={handleCopy}
              className="flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制到剪贴板' : '复制分析报告'}
            </button>
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-[#12141c] text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
            >
              收起报告
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSummaryModal;
