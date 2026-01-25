
import React, { useEffect, useState } from 'react';
import { MarketInsight, AssetStatus, CompletionStatus } from '../types';
import { Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Activity, Target, ChevronRight, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

interface MarketCardProps {
  insight: MarketInsight;
  currentPrice?: number;
  onEdit: (insight: MarketInsight) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
  isEditable?: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({ insight, currentPrice, onEdit, onDelete, onToggleCompletion, isEditable = false }) => {
  const isUp = insight.status === '看涨';
  const isDown = insight.status === '看跌';
  
  const [priceColor, setPriceColor] = useState('text-gray-900 dark:text-white');
  
  useEffect(() => {
    if (currentPrice) {
      setPriceColor('text-amber-500 scale-110');
      const timer = setTimeout(() => setPriceColor('text-gray-900 dark:text-white scale-100'), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPrice]);

  const entryPrice = insight.entryLevel ? parseFloat(insight.entryLevel.replace(/[^0-9.]/g, '')) : null;
  const priceDiff = (currentPrice && entryPrice) ? ((currentPrice - entryPrice) / entryPrice * 100).toFixed(2) : null;

  return (
    <div className="group relative bg-white/70 dark:bg-[#1a1d26]/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[3rem] p-10 flex flex-col min-h-[420px] transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-2">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{insight.symbol}</h3>
            {currentPrice && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 rounded-md text-[9px] font-black text-white animate-pulse">
                <Zap className="w-2.5 h-2.5 fill-current" /> LIVE
              </div>
            )}
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest ${isUp ? 'bg-emerald-500 text-white' : isDown ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
             {isUp ? <TrendingUp className="w-4 h-4" /> : isDown ? <TrendingDown className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
             {insight.status}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black transition-all duration-500 ${priceColor}`}>
            {currentPrice ? `$${currentPrice.toLocaleString()}` : '---'}
          </div>
          {priceDiff && (
            <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${parseFloat(priceDiff) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {parseFloat(priceDiff) >= 0 ? '▲' : '▼'} {priceDiff}% vs Entry
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow space-y-8 mt-4">
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Core Focus</span>
          <p className="text-[16px] font-bold text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-3">{insight.focusPoints}</p>
        </div>

        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-3">Strategy Plan</span>
          <div className="p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20 shadow-inner">
             <p className="text-[15px] font-black text-[#12141c] dark:text-white leading-snug">{insight.strategy}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
         <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{insight.category}</span>
         {isEditable && (
           <div className="flex gap-2">
              <button onClick={() => onEdit(insight)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-white rounded-full transition-all"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(insight.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
           </div>
         )}
      </div>
    </div>
  );
};

export default MarketCard;
