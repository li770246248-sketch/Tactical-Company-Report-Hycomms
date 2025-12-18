
import React from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const AnalysisHeader: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  return (
    <header className="bg-slate-900 text-white py-4 px-8 shadow-lg sticky top-0 z-50 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* User Company Logo */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
           <div className="bg-white p-1 rounded h-10 w-10 flex items-center justify-center overflow-hidden">
             {/* Replace this placeholder URL with the actual company logo URL */}
             <i className="fas fa-shield-halved text-slate-900 text-xl"></i>
           </div>
           <div className="hidden sm:block">
             <h1 className="text-lg font-bold leading-tight">战术通信情报局</h1>
             <p className="text-[10px] text-blue-400 font-mono">INTELLIGENCE UNIT</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <i className="fas fa-satellite-dish text-sm"></i>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold tracking-tight">全球市场情报分析系统</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global Intelligence Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => onLanguageChange('zh')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'zh' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            中文
          </button>
          <button 
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            EN
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">系统在线</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AnalysisHeader;
