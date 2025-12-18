
import React, { useState } from 'react';
import AnalysisHeader from './components/AnalysisHeader';
import ReportDisplay from './components/ReportDisplay';
import { generateMarketReport } from './services/geminiService';
import { IntelligenceReport, AnalysisStatus, Language } from './types';

const App: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState<string>('Elbit Systems');
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('zh');

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetCompany.trim()) return;

    setStatus(AnalysisStatus.SEARCHING);
    setError(null);
    setProgress(15);
    setReport(null);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 5;
        return prev;
      });
    }, 1000);

    try {
      const result = await generateMarketReport(targetCompany, language);
      setReport(result);
      setStatus(AnalysisStatus.COMPLETED);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || (language === 'zh' ? '分析过程中发生错误，请稍后再试。' : 'An error occurred during analysis. Please try again.'));
      setStatus(AnalysisStatus.ERROR);
    } finally {
      clearInterval(progressTimer);
    }
  };

  const UI_TEXT = {
    zh: {
      placeholder: "输入目标竞品公司名称 (如: Elbit Systems)",
      btn: "生成情报报告",
      loading: "深度分析中...",
      searching: "正在检索全球市场情报...",
      searchingSub: "系统正在执行 2025 年专项搜索：核查官方新闻稿、Google 搜索结果以及行业动态。",
      idleTitle: "准备就绪",
      idleSub: "输入目标公司并点击生成，系统将自动进行全球检索并整合 2025 年最新市场动态。",
      check1: "Google 深度检索",
      check2: "官网同步",
      check3: "2025 时效性",
      check4: "多语种支持"
    },
    en: {
      placeholder: "Enter target competitor (e.g., Elbit Systems)",
      btn: "Generate Intelligence Report",
      loading: "Analyzing Deeply...",
      searching: "Retrieving Global Intelligence...",
      searchingSub: "Executing 2025 specific search: checking official press releases, Google results, and industry trends.",
      idleTitle: "System Ready",
      idleSub: "Enter a company name and click generate to perform global retrieval of 2025 market dynamics.",
      check1: "Deep Google Search",
      check2: "Official Sync",
      check3: "2025 Recency",
      check4: "Multi-Language"
    }
  }[language];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AnalysisHeader language={language} onLanguageChange={setLanguage} />

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Search Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 print:hidden">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <i className="fas fa-building"></i>
              </div>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder={UI_TEXT.placeholder}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING}
              />
            </div>
            <button
              type="submit"
              disabled={status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING || !targetCompany}
              className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'
              }`}
            >
              {(status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING) ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  {UI_TEXT.loading}
                </>
              ) : (
                <>
                  <i className="fas fa-magnifying-glass-chart"></i>
                  {UI_TEXT.btn}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500 border-t border-slate-100 pt-4 uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> {UI_TEXT.check1}</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> {UI_TEXT.check2}</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> {UI_TEXT.check3}</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> {UI_TEXT.check4}</span>
          </div>
        </div>

        {/* Loading / Progress State */}
        {(status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING) && (
          <div className="bg-white p-12 rounded-xl shadow-md border border-slate-200 text-center animate-pulse">
            <div className="mb-6 relative inline-block">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-globe-americas text-3xl text-blue-600"></i>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{UI_TEXT.searching}</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              {UI_TEXT.searchingSub}
            </p>
            <div className="w-full max-w-lg mx-auto bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-bold text-blue-600">{Math.round(progress)}% COMPLETE</span>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-md">
            <div className="flex items-center gap-4 text-red-700">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
              <div>
                <h2 className="text-lg font-bold">FAILURE</h2>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        {report && status === AnalysisStatus.COMPLETED && (
          <ReportDisplay report={report} />
        )}

        {/* Idle State */}
        {status === AnalysisStatus.IDLE && !report && (
          <div className="text-center py-20 bg-white rounded-xl shadow-inner border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <i className="fas fa-microchip text-3xl text-slate-300"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{UI_TEXT.idleTitle}</h2>
            <p className="text-slate-400 max-w-sm mx-auto mt-2 text-sm italic">
              {UI_TEXT.idleSub}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
