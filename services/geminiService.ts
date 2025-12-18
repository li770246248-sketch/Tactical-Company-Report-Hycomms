
import { GoogleGenAI } from "@google/genai";
import { IntelligenceReport, GroundingSource } from "../types";

export const generateMarketReport = async (companyName: string): Promise<IntelligenceReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    你是一名专业的战术通信行业全球市场情报分析师。
    
    # 任务
    请针对竞品公司 "${companyName}" 进行全面检索与信息归纳，整理成中文报告。
    
    # 检索范围与策略 (严格执行)
    1. 检索该公司的官方网站新闻中心 (Newsroom/Press Releases) 以及 Google 搜索结果。
    2. 使用以下关键词组合检索 2025 年 (1月1日至今) 的信息：
       - "${companyName}"
       - "${companyName}" + "release"
       - "${companyName}" + "news"
       - "${companyName}" + "announcement"
       - "${companyName}" + "launch"
    3. 仅收录 2025 年发布的英文新闻与公告。
    4. 排除社交媒体、旧闻、非核心财务波动、广告及传闻。

    # 输出格式 (Markdown)
    请严格按照以下格式输出每一条结果。
    注意：不要使用 Markdown 的超链接语法 [标题](URL)，直接在“原文链接：”后面附上完整的 URL 文本。

    ### 公司介绍
    （用 3-5 句话概述公司背景、总部、成立/合并历史、核心定位）

    ### 业务范围
    - （要点 1）
    - （要点 2）
    - （要点 3）

    ### 竞争格局
    #### 投资并购
    - （列出 2025 年内的重要投资/剥离/并购，注明金额或范围）
    #### 全球合作
    - （列出 2025 年内的重要合作伙伴关系与典型客户）

    ### 展会与行业活动
    - （列出 2025 年内相关的参展、演示、落地活动等，包含地点/时间）

    ### 市场营销
    - （列出 2025 年内相关的重大市场营销活动）

    ### 2025年公司新闻与动态
    #### [年份-月份-日期] 标题内容
    - 原文链接：(直接写出完整 URL)
    - 核心摘要：概述新闻内容，标注国家和产品、行业。

    (按时间倒序排列 2025 年的新闻条目)

    ### 分析与展望
    - 行业需求与周期判断（结合公司产品组合与地缘环境）
    - 技术/产能与竞争态势（与主要竞争对手的对比）
    - 国际化布局与本地化协同
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || "未能生成报告。";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri || "",
      }))
      .filter(source => source.uri !== "");

    return {
      content: text,
      sources,
      companyName,
      timestamp: new Date().toLocaleString(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
