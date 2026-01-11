
import { GoogleGenAI } from "@google/genai";
import { MarketInsight } from "../types";

export const generateMarketSummary = async (insights: MarketInsight[]) => {
  // Use the required named parameter for initialization with direct process.env.API_KEY reference
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    你是一个顶级宏观交易员。请根据以下实时的市场行情观点，为我撰写一份极其精炼的“博弈研判”。
    
    待分析数据：
    ${insights.map(i => `- ${i.symbol} (${i.status}): ${i.focusPoints}. 策略: ${i.strategy}`).join('\n')}

    输出要求：
    1. 【核心逻辑】：一句话点破当前市场的本质。
    2. 【资产博弈】：选出最具确定性的1-2个资产进行深度评价。
    3. 【风控警示】：目前最需要防范的“黑天鹅”方向。
    
    风格：冷静、干练、不要废话。字数在300字左右。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Property access .text is correct according to SDK guidelines
    return response.text;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "AI 研判生成失败。请检查 API 配置，或稍后再试。";
  }
};
