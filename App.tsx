
import React, { useState, useEffect } from 'react';
import AnalysisHeader from './components/AnalysisHeader';
import ReportDisplay from './components/ReportDisplay';
import { generateMarketReport } from './services/geminiService';
import { IntelligenceReport, AnalysisStatus } from './types';

const App: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState<string>('Elbit Systems');
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetCompany.trim()) return;

    setStatus(AnalysisStatus.SEARCHING);
    setError(null);
    setProgress(15);
    setReport(null);

    // Simulate progress for better UX
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + Math.random() * 5;
        return prev;
      });
    }, 1000);

    try {
      const result = await generateMarketReport(targetCompany);
      setReport(result);
      setStatus(AnalysisStatus.COMPLETED);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || '分析过程中发生错误，请稍后再试。');
      setStatus(AnalysisStatus.ERROR);
    } finally {
      clearInterval(progressTimer);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <AnalysisHeader />

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
                placeholder="输入目标竞品公司名称 (如: Elbit Systems)"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
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
                  深度分析中...
                </>
              ) : (
                <>
                  <i className="fas fa-magnifying-glass-chart"></i>
                  生成情报报告
                </>
              )}
            </button>
          </form>

          {/* Guidelines Section */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> Google 前 3 页深度检索</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> 官网新闻中心同步</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> 严格 2025 年时效性</span>
            <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> 中文专业情报格式</span>
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
            <h2 className="text-xl font-bold text-slate-800 mb-2">正在检索全球市场情报...</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              系统正在执行 2025 年专项搜索：核查官方新闻稿、Google 搜索结果以及行业动态。这可能需要约 10-20 秒。
            </p>
            <div className="w-full max-w-lg mx-auto bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% 完成</span>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-3 bg-slate-50 rounded border border-slate-100 flex gap-3">
                <i className={`fas ${progress > 20 ? 'fa-check-circle text-green-500' : 'fa-circle text-slate-200'} mt-1`}></i>
                <div className="text-sm">
                  <p className="font-semibold">关键词库匹配</p>
                  <p className="text-slate-400 text-xs">执行 release, news, launch...</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 flex gap-3">
                <i className={`fas ${progress > 50 ? 'fa-check-circle text-green-500' : 'fa-circle text-slate-200'} mt-1`}></i>
                <div className="text-sm">
                  <p className="font-semibold">2025 内容识别</p>
                  <p className="text-slate-400 text-xs">筛选时效性与去重...</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100 flex gap-3">
                <i className={`fas ${progress > 85 ? 'fa-check-circle text-green-500' : 'fa-circle text-slate-200'} mt-1`}></i>
                <div className="text-sm">
                  <p className="font-semibold">情报报告生成</p>
                  <p className="text-slate-400 text-xs">结构化归纳与展望...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-md">
            <div className="flex items-center gap-4 text-red-700">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
              <div>
                <h2 className="text-lg font-bold">情报获取失败</h2>
                <p>{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setStatus(AnalysisStatus.IDLE)}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              重新尝试
            </button>
          </div>
        )}

        {/* Report Content */}
        {report && status === AnalysisStatus.COMPLETED && (
          <ReportDisplay report={report} />
        )}

        {/* Empty / Idle State */}
        {status === AnalysisStatus.IDLE && !report && (
          <div className="text-center py-20 bg-white rounded-xl shadow-inner border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <i className="fas fa-microchip text-3xl text-slate-300"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-400">准备就绪</h2>
            <p className="text-slate-400 max-w-sm mx-auto mt-2 text-sm">
              输入目标公司（如 <b>Elbit Systems</b>）并点击生成，系统将自动进行全球检索并整合 2025 年最新市场动态。
            </p>
          </div>
        )}
      </main>

      {/* Floating Action for Return to Top (Mobile) */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all z-40 md:hidden"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
};

export default App;
