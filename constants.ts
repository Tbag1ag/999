
import { MarketInsight, Category } from './types';

export const CATEGORIES: Category[] = [
  '全部',
  '指数',
  '加密货币',
  '美股',
  'A股',
  '外汇'
];

export const INITIAL_INSIGHTS: MarketInsight[] = [
  {
    id: '1',
    symbol: 'BTC',
    category: '加密货币',
    status: '震荡',
    focusPoints: '作为风险资产的风向标，需关注流动性变化。目前在高位震荡，等待方向选择。',
    strategy: '关注 92,000 美元支撑，跌破则减仓。',
    entryLevel: '92,000 - 95,000',
    updatedAt: Date.now() - 86400000,
    completionStatus: '进行中',
  },
  {
    id: '2',
    symbol: 'NVDA',
    category: '美股',
    status: '看涨',
    entryLevel: '138.50',
    focusPoints: 'AI 需求依然强劲，财报指引超预期，趋势线上方运行。',
    strategy: '回踩 20 日均线可考虑分批建仓。',
    updatedAt: Date.now() - 432000000, // 5 days ago
    completionStatus: '已完成',
  },
  {
    id: '3',
    symbol: 'TSLA',
    category: '美股',
    status: '看跌',
    focusPoints: '短期涨幅过大，面临回调压力，支撑位在 300 附近。',
    strategy: '逢高止盈，等待企稳。',
    entryLevel: '320.00 附近止盈',
    updatedAt: Date.now(),
    completionStatus: '进行中',
  }
];
