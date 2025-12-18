
import React, { useState, useEffect } from 'react';
import AnalysisHeader from './components/AnalysisHeader';
import ReportDisplay from './components/ReportDisplay';
import ChatPanel from './components/ChatPanel';
import { generateMarketReport } from './services/geminiService';
import { IntelligenceReport, AnalysisStatus, Language } from './types';

const App: React.FC = () => {
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('zh');
  const [history, setHistory] = useState<IntelligenceReport[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load history from localStorage (Simulating Google Cloud retrieval)
  useEffect(() => {
    setIsSyncing(true);
    const savedHistory = localStorage.getItem('intel_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    setTimeout(() => setIsSyncing(false), 800);
  }, []);

  // Save history to localStorage (Simulating Google Cloud sync)
  useEffect(() => {
    if (history.length > 0) {
      setIsSyncing(true);
      localStorage.setItem('intel_history', JSON.stringify(history));
      const timeout = setTimeout(() => setIsSyncing(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [history]);

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
      setHistory(prev => [result, ...prev]);
      setStatus(AnalysisStatus.COMPLETED);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || (language === 'zh' ? '分析过程中发生错误，请稍后再试。' : 'An error occurred during analysis. Please try again.'));
      setStatus(AnalysisStatus.ERROR);
    } finally {
      clearInterval(progressTimer);
    }
  };

  const updateReport = (updatedReport: IntelligenceReport) => {
    setReport(updatedReport);
    setHistory(prev => prev.map(item => item.id === updatedReport.id ? updatedReport : item));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (report?.id === id) setReport(null);
  };

  const UI_TEXT = {
    zh: {
      placeholder: "输入目标竞品公司名称 (如: Elbit Systems)",
      btn: "生成报告",
      loading: "深度分析中...",
      searching: "检索全球情报...",
      searchingSub: "系统正在执行 2025 年专项搜索：核查官方新闻稿、Google 搜索结果以及行业动态。",
      idleTitle: "准备就绪",
      idleSub: "在搜索栏输入公司名称，或从左侧历史记录中选择。",
      check1: "Google 深度检索",
      check2: "官网同步",
      check3: "2025 时效性",
      historyHeader: "历史报告",
      noHistory: "暂无历史记录",
      newAnalysis: "新建分析",
      clearHistory: "清空历史",
      syncStatus: "同步到 Google Cloud"
    },
    en: {
      placeholder: "Target competitor (e.g., Elbit Systems)",
      btn: "Generate",
      loading: "Analyzing...",
      searching: "Retrieving Intel...",
      searchingSub: "Executing 2025 specific search: official press releases, Google results, and industry trends.",
      idleTitle: "Ready",
      idleSub: "Enter a company name above or select from history on the left.",
      check1: "Deep Google Search",
      check2: "Official Sync",
      check3: "2025 Recency",
      historyHeader: "History",
      noHistory: "No records",
      newAnalysis: "New Analysis",
      clearHistory: "Clear",
      syncStatus: "Sync to Google Cloud"
    }
  }[language];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <AnalysisHeader language={language} onLanguageChange={setLanguage} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: History */}
        <aside 
          className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col overflow-hidden shrink-0 print:hidden z-40`}
        >
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-history text-blue-500"></i>
              {UI_TEXT.historyHeader}
            </h2>
            <button 
              onClick={() => {
                setReport(null);
                setStatus(AnalysisStatus.IDLE);
                setTargetCompany('');
              }}
              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-bold transition-all flex items-center gap-1"
            >
              <i className="fas fa-plus"></i>
              {UI_TEXT.newAnalysis}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-600 italic text-sm">
                {UI_TEXT.noHistory}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setReport(item);
                      setStatus(AnalysisStatus.COMPLETED);
                    }}
                    className={`group p-3 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                      report?.id === item.id 
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                        : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-sm truncate">{item.companyName}</span>
                      <div className="flex items-center gap-2 text-[10px] opacity-70">
                        <span className="uppercase font-mono">{item.language}</span>
                        <span>•</span>
                        <span className="truncate">{item.timestamp.split(',')[0]}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-all text-slate-500"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{isSyncing ? 'SYNCING...' : 'CLOUD SYNCED'}</span>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={() => { if(confirm('Clear history?')) setHistory([]) }}
                  className="hover:text-red-500 transition-colors uppercase"
                >
                  {UI_TEXT.clearHistory}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50">
          <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
            
            {/* Control Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-0 z-30 print:hidden">
              <form onSubmit={handleAnalyze} className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-shield-halved"></i>
                  </div>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder={UI_TEXT.placeholder}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    disabled={status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING || !targetCompany}
                  className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all whitespace-nowrap text-sm ${
                    status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 hover:bg-blue-600 active:transform active:scale-95'
                  }`}
                >
                  {(status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING) ? (
                    <>
                      <i className="fas fa-circle-notch animate-spin"></i>
                      {UI_TEXT.loading}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magnifying-glass"></i>
                      {UI_TEXT.btn}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Content Logic */}
            {(status === AnalysisStatus.SEARCHING || status === AnalysisStatus.ANALYZING) && (
              <div className="bg-white p-12 rounded-xl shadow-md border border-slate-200 text-center animate-pulse mt-8">
                <div className="mb-6 relative inline-block">
                  <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-satellite text-3xl text-blue-600"></i>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">{UI_TEXT.searching}</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
                  {UI_TEXT.searchingSub}
                </p>
                <div className="w-full max-w-lg mx-auto bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-blue-600 tracking-widest">{Math.round(progress)}% COMPLETE</span>
              </div>
            )}

            {status === AnalysisStatus.ERROR && (
              <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-md mt-8">
                <div className="flex items-center gap-4 text-red-700">
                  <i className="fas fa-exclamation-triangle text-3xl"></i>
                  <div>
                    <h2 className="text-lg font-bold">SYSTEM ERROR</h2>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {report && status === AnalysisStatus.COMPLETED && (
              <ReportDisplay report={report} />
            )}

            {status === AnalysisStatus.IDLE && !report && (
              <div className="text-center py-32 bg-white/50 rounded-2xl shadow-inner border-2 border-dashed border-slate-200 mt-8">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 text-slate-200">
                  <i className="fas fa-terminal text-4xl"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-400 uppercase tracking-[0.2em]">{UI_TEXT.idleTitle}</h2>
                <p className="text-slate-400 max-w-xs mx-auto mt-4 text-xs font-medium leading-relaxed">
                  {UI_TEXT.idleSub}
                </p>
                <div className="mt-8 flex justify-center gap-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                   <span className="flex items-center gap-2"><i className="fas fa-circle text-[6px] text-green-500"></i> {UI_TEXT.check1}</span>
                   <span className="flex items-center gap-2"><i className="fas fa-circle text-[6px] text-green-500"></i> {UI_TEXT.check2}</span>
                   <span className="flex items-center gap-2"><i className="fas fa-circle text-[6px] text-green-500"></i> {UI_TEXT.check3}</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar: Chat Follow-up */}
        {report && status === AnalysisStatus.COMPLETED && (
          <aside className="shrink-0 print:hidden h-full flex">
            <ChatPanel 
              report={report} 
              language={language} 
              onUpdateReport={updateReport} 
            />
          </aside>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default App;
