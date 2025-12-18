
import { GoogleGenAI } from "@google/genai";
import { IntelligenceReport, GroundingSource, Language } from "../types";

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
    4. 排除社交媒体、旧闻、非核心财务波动、广告及传闻。

    # 重要元数据 (必须提供)
    请在报告的最开始，以如下 JSON 格式提供公司的官方网站域名（仅需域名，如 elbitsystems.com）：
    DOMAIN_START{"domain": "example.com"}DOMAIN_END

    # 输出格式 (Markdown)
    请严格按照以下格式输出每一条结果。
    注意：不要使用 Markdown 的超链接语法 [标题](URL)，直接在“原文链接：”后面附上完整的 URL 文本。

    ### ${lang === 'zh' ? '公司介绍' : 'Company Overview'}
    （概述公司背景、总部、成立/合并历史、核心定位）

    ### ${lang === 'zh' ? '业务范围' : 'Business Scope'}
    - （要点）

    ### ${lang === 'zh' ? '竞争格局' : 'Competitive Landscape'}
    #### ${lang === 'zh' ? '投资并购' : 'M&A and Investments'}
    - （2025 年内的重要动态）
    #### ${lang === 'zh' ? '全球合作' : 'Global Partnerships'}
    - （2025 年内的合作伙伴与客户）

    ### ${lang === 'zh' ? '展会与行业活动' : 'Events & Exhibitions'}
    - （2025 年内的参展或活动）

    ### ${lang === 'zh' ? '市场营销' : 'Marketing Activities'}
    - （2025 年内的重大营销动作）

    ### ${lang === 'zh' ? '2025年公司新闻与动态' : '2025 Company News & Dynamics'}
    #### [YYYY-MM-DD] ${lang === 'zh' ? '标题' : 'Title'}
    - 原文链接：(Complete URL)
    - ${lang === 'zh' ? '核心摘要' : 'Core Summary'}：(Summary in ${languageName})

    ### ${lang === 'zh' ? '分析与展望' : 'Analysis & Outlook'}
    - ${lang === 'zh' ? '行业需求与周期判断' : 'Industry Demand & Cycle'}
    - ${lang === 'zh' ? '技术/产能与竞争态势' : 'Technology & Competitiveness'}
    - ${lang === 'zh' ? '国际化布局与本地化协同' : 'International Strategy'}
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
      content: cleanText,
      sources,
      companyName,
      timestamp: new Date().toLocaleString(),
      website: domain,
      logoUrl: domain ? `https://logo.clearbit.com/${domain}` : undefined,
      language: lang
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
