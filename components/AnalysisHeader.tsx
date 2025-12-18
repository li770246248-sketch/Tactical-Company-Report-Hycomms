
import React from 'react';

const AnalysisHeader: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white py-6 px-8 shadow-lg sticky top-0 z-50 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="fas fa-satellite-dish text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">战术通信全球市场情报分析系统</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Global Market Intelligence Portal</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          系统运行中
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-clock"></i>
          实时数据追踪 (2025)
        </div>
      </div>
    </header>
  );
};

export default AnalysisHeader;
