
export type AssetStatus = '看涨' | '看跌' | '震荡';
export type CompletionStatus = '进行中' | '已完成' | '已失效';
export type SortMode = 'timeline' | 'category' | 'journal' | 'feargreed';
export type MarketMood = '贪婪' | '恐惧' | '冷静' | '警惕';
export type EntryType = '随笔' | '新闻' | '逻辑';

export type AlertType = '交易性' | '方向性';
export type AlertStatus = '监听中' | '已触发' | '已失效';

export interface MarketAlert {
  id: string;
  symbol: string;
  type: AlertType;
  title: string;
  content: string;
  priority: '低' | '中' | '高';
  status: AlertStatus;
  createdAt: number;
}

export type SignalType = '结构转折' | '执行信号';
export type SignalStatus = '监听中' | '已捕获' | '已失效';

export interface TrendSignal {
  id: string;
  symbol: string;
  type: SignalType;
  title: string;
  content: string;
  priority: '低' | '中' | '高';
  status: SignalStatus;
  createdAt: number;
}

export interface FearGreedIndex {
  id: string;
  symbol: string;
  score: number; // 0 - 100
  updatedAt: number;
}

export interface MarketInsight {
  id: string;
  symbol: string;
  category: string;
  status: AssetStatus;
  focusPoints: string;
  strategy: string;
  entryLevel?: string;
  updatedAt: number;
  completionStatus: CompletionStatus;
}

export interface JournalEntry {
  id: string;
  date: number;
  content: string;
  mood: MarketMood;
  title?: string;
  type?: EntryType;
  source?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type: 'market' | 'news' | 'system' | '随笔' | '新闻' | '逻辑' | 'index';
}

export type Category = '全部' | '指数' | '加密货币' | '美股' | 'A股' | '外汇';

export interface AppState {
  insights: MarketInsight[];
  activeCategory: Category;
  isEditing: boolean;
  selectedInsight?: MarketInsight;
  sortMode: SortMode;
}
