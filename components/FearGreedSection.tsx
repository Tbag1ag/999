
import React from 'react';
import { FearGreedIndex } from '../types';
import { Trash2, Edit3, Clock } from 'lucide-react';

interface FearGreedSectionProps {
  indices: FearGreedIndex[];
  isAdmin: boolean;
  onEdit: (index: FearGreedIndex) => void;
  onDelete: (id: string) => void;
}

const FearGreedSection: React.FC<FearGreedSectionProps> = ({ indices, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {indices.map(index => {
        const score = index.score;
        const color = score > 60 ? 'text-red-500' : score < 40 ? 'text-emerald-500' : 'text-amber-500';
        const label = score > 80 ? '极度贪婪' : score > 60 ? '贪婪' : score > 40 ? '中立' : score > 20 ? '恐惧' : '极度恐惧';
        
        return (
          <div key={index.id} className="bg-white/70 dark:bg-[#1a1d26]/70 backdrop-blur-3xl rounded-[4rem] p-12 border border-white/30 flex flex-col items-center transition-all hover:scale-105">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-8">{index.symbol}</h3>
            
            <div className="relative flex items-center justify-center mb-8">
               <div className={`text-[120px] font-black tracking-tighter leading-none ${color} italic`}>{score}</div>
               <div className="absolute -bottom-4 bg-black dark:bg-white px-4 py-1 rounded-full text-white dark:text-black text-[10px] font-black uppercase tracking-widest">
                 {label}
               </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase">
               <Clock className="w-3 h-3" /> Updated: {new Date(index.updatedAt).toLocaleTimeString()}
            </div>

            {isAdmin && (
              <div className="mt-8 flex gap-4">
                 <button onClick={() => onEdit(index)} className="p-2 bg-white/50 rounded-full text-gray-400 hover:text-amber-500 transition-all"><Edit3 className="w-5 h-5" /></button>
                 <button onClick={() => onDelete(index.id)} className="p-2 bg-white/50 rounded-full text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FearGreedSection;
