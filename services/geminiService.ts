
import { GoogleGenAI } from "@google/genai";
import { IntelligenceReport, GroundingSource, Language, ChatMessage } from "../types";

export const generateMarketReport = async (companyName: string, lang: Language = 'zh'): Promise<IntelligenceReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageName = lang === 'zh' ? '中文 (Chinese)' : '英文 (English)';
  
  const prompt = `
    你是一名专业的战术通信行业全球市场情报分析师。
    
    # 任务
    请针对竞品公司 "${companyName}" 进行全面检索与信息归纳，并使用 **${languageName}** 撰写整理成专业报告。
    
    # 检索范围与策略 (严格执行)
    1. 检索该公司的官方网站新闻中心 (Newsroom/Press Releases) 以及 Google 搜索结果。
    2. 使用以下关键词组合检索 2025 年 (1月1日至今) 的信息：
       - "${companyName}"
       - "${companyName}" + "release"
       - "${companyName}" + "news"
       - "${companyName}" + "announcement"
       - "${companyName}" + "launch"
    3. 仅收录 2025 年发布的英文新闻与公告，但请将其核心内容翻译并总结为 **${languageName}**。

    # 重要元数据 (必须提供)
    请在报告的最开始，以如下 JSON 格式提供公司的官方网站域名（仅需域名，如 elbitsystems.com）：
    DOMAIN_START{"domain": "example.com"}DOMAIN_END

    # 输出格式要求 (严格执行以下模板)
    请严格按照以下格式输出，注意：不要使用 Markdown 超链接语法 (即不要使用 [text](url))，直接附上完整的 URL 地址。

    ### 公司介绍 
    （用 3-5 句话概述公司背景、总部、成立/合并历史、核心定位）

    ### 业务范围
    - （要点 1）
    - （要点 2）
    - （要点 3）
    - （可按需扩展）

    ### 竞争格局
    #### 投资并购
    - （列出 2025 年内的重要投资/剥离/并购，注明金额或范围，如有）
    #### 全球合作
    - （列出 2025 年内的重要合作伙伴关系与典型客户）

    ### 展会与行业活动
    - （列出 2025 年内与该公司相关的参展、演示、落地/破土活动等，给出简要信息与地点/时间）

    ### 市场营销
    - （列出 2025 年内与该公司相关营销活动）

    ### 2025年公司新闻与动态
    #### [年份-月份-日期] 标题内容
    - 原文链接：URL (直接输出 URL 字符串)
    - 核心摘要：概述新闻内容，注意一定要标注国家和产品、行业。

    （按时间顺序列出所有符合条件的 2025 年新闻；若来源为第三方媒体也需符合“时间限制”和“排除项”）

    ### 分析与展望
    - 行业需求与周期判断（结合公司产品组合与地缘环境）
    - 技术/产能与竞争态势（与主要竞争对手的对比）
    - 国际化布局与本地化协同

    ### 信息来源链接
    - （直接列出 URL 地址，每行一个）
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // 降低随机性，严格遵循格式
      },
    });

    const fullText = response.text || "未能生成报告。";
    
    let domain = "";
    let cleanText = fullText;
    const domainMatch = fullText.match(/DOMAIN_START({.*?})DOMAIN_END/);
    if (domainMatch) {
      try {
        const domainData = JSON.parse(domainMatch[1]);
        domain = domainData.domain;
        cleanText = fullText.replace(/DOMAIN_START{.*?}DOMAIN_END/, "").trim();
      } catch (e) {
        console.error("Failed to parse domain metadata", e);
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri || "",
      }))
      .filter(source => source.uri !== "");

    return {
      id: crypto.randomUUID(),
      content: cleanText,
      sources,
      companyName,
      timestamp: new Date().toLocaleString(),
      website: domain,
      logoUrl: domain ? `https://logo.clearbit.com/${domain}` : undefined,
      language: lang,
      chatHistory: []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const askFollowUp = async (
  question: string, 
  reportContent: string, 
  history: ChatMessage[],
  lang: Language = 'zh'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `你是一名战术通信市场专家。你刚刚为用户生成了一份关于某公司的情报报告。
      
      以下是报告内容：
      ---
      ${reportContent}
      ---
      
      用户现在对这份报告有疑问。请基于报告内容及你的专业知识（包括 Google 搜索）进行回答。
      请保持回答专业、客观、简练。回答语言必须为 ${lang === 'zh' ? '中文' : '英文'}。
      如果提到 URL，请直接附上完整 URL 字符串，不要使用超链接语法。`,
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message: question });
  return response.text || (lang === 'zh' ? "抱歉，我无法回答这个问题。" : "Sorry, I cannot answer that.");
};
