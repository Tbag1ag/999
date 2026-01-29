
export type AssetStatus = '看涨' | '看跌' | '震荡';
export type CompletionStatus = '进行中' | '已完成' | '已失效';
export type SortMode = 'timeline' | 'category' | 'journal' | 'feargreed' | 'positions';
export type MarketMood = '贪婪' | '恐惧' | '冷静' | '警惕';
export type EntryType = '随笔' | '新闻' | '逻辑';

export type PositionSignalType = 'Short Term' | 'Medium Term' | 'Long Term';
export type PositionSide = 'Buy' | 'Sell';
export type PositionStatus = '持仓中' | '观察中' | '已平仓';

export interface PositionEntry {
  id: string;
  symbol: string;
  category: Category;
  signalType: PositionSignalType;
  side: PositionSide;
  status: PositionStatus;
  signalTime: number;
  entryPrice: number;
  shares: number; // 股数
  yieldRate: number; // 收益率 (%)
  yieldAmount: number; // 收益额 ($)
  updatedAt: number;
}

export type Category = '全部' | '指数' | '加密货币' | '美股' | 'A股' | '外汇';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  type: 'market' | 'news' | 'system' | '随笔' | '新闻' | '逻辑' | 'index' | 'position';
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
  imageUrl?: string; // 新增图片字段
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

// 辅助类型
export type AlertType = '方向性' | '交易性';
export type AlertStatus = '监听中' | '已触发' | '已失效';
export interface MarketAlert {
  id: string;
  symbol: string;
  type: AlertType;
  status: AlertStatus;
  createdAt: number;
  title: string;
  content: string;
  priority: '高' | '中' | '低';
}
export type SignalType = '结构转折' | '执行信号';
export type SignalStatus = '监听中' | '已捕获' | '已失效';
export interface TrendSignal {
  id: string;
  symbol: string;
  type: SignalType;
  status: SignalStatus;
  createdAt: number;
  title: string;
  content: string;
  priority: '高' | '中' | '低';
}
export interface AppConfig {
  isEmailEnabled: boolean;
  notificationEmail: string;
}
