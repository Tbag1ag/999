
import { GoogleGenAI } from "@google/genai";

export interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
}

/**
 * 利用 Gemini 搜索增强获取实时价格（作为主用或备用方案，解决浏览器跨域问题）
 */
export const fetchPriceViaGemini = async (symbols: string[]): Promise<Record<string, number>> => {
  if (symbols.length === 0) return {};
  
  // Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Please provide the current real-time market prices for the following assets: ${symbols.join(', ')}. 
  Return the result as a raw JSON object where keys are symbols and values are numeric prices. 
  Example: {"BTC": 96542.12, "NVDA": 138.54, "TSLA": 320.12}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });
    
    // Property access .text is correct according to SDK guidelines
    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Gemini Price Fetch Error:", error);
  }
  return {};
};

/**
 * 从币安获取价格（尝试性，可能被 CORS 拦截）
 */
const tryFetchCryptoPrice = async (symbol: string): Promise<number | null> => {
  try {
    const btcSymbol = symbol.toUpperCase() === 'BTC' ? 'BTCUSDT' : symbol.toUpperCase() + 'USDT';
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${btcSymbol}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    return null;
  }
};

/**
 * 混合价格查询逻辑
 */
export const getLatestPrices = async (symbols: string[]): Promise<Record<string, number>> => {
  const results: Record<string, number> = {};
  const upperSymbols = symbols.map(s => s.toUpperCase());
  
  // 1. 先尝试快速获取加密货币价格
  const cryptos = upperSymbols.filter(s => ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE'].includes(s));
  
  // 并行处理
  await Promise.all([
    ...cryptos.map(async (s) => {
      const p = await tryFetchCryptoPrice(s);
      if (p) results[s] = p;
    })
  ]);

  // 2. 对于获取失败或非加密货币资产，统一调用 Gemini 搜索
  const needsGemini = upperSymbols.filter(s => !results[s]);
  if (needsGemini.length > 0) {
    const geminiPrices = await fetchPriceViaGemini(needsGemini);
    Object.assign(results, geminiPrices);
  }

  return results;
};
