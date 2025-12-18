
import React from 'react';
import { IntelligenceReport } from '../types';

interface ReportDisplayProps {
  report: IntelligenceReport;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  const formatContent = (content: string) => {
    // Basic markdown-like formatting for display
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-bold text-blue-700 mt-6 mb-3">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        // Special handling for "原文链接" lines to make them look like links even if they aren't formatted as markdown links
        if (line.includes('原文链接：')) {
          const parts = line.split('原文链接：');
          return (
            <li key={index} className="ml-4 mb-2 list-none">
              <span className="text-slate-500 font-medium">原文链接：</span>
              <a 
                href={parts[1].trim()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline break-all"
              >
                {parts[1].trim()}
              </a>
            </li>
          );
        }
        return <li key={index} className="ml-6 mb-2 list-disc text-slate-700 leading-relaxed">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{line}</p>;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report.content);
    alert('报告已复制到剪贴板');
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
      <div className="bg-slate-100 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase">情报报告</span>
          <h2 className="text-lg font-semibold text-slate-700">目标：{report.companyName}</h2>
          <span className="text-xs text-slate-500">生成时间：{report.timestamp}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
            title="复制到剪贴板"
          >
            <i className="fas fa-copy"></i>
          </button>
          <button 
            onClick={handlePrint}
            className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
            title="打印报告"
          >
            <i className="fas fa-print"></i>
          </button>
        </div>
      </div>
      
      <div className="p-8 md:p-12 prose prose-slate max-w-none print:p-0">
        <div className="mb-10 text-center border-b-2 border-slate-900 pb-6 hidden print:block">
          <h1 className="text-3xl font-bold uppercase tracking-wider">战术通信行业全球市场情报报告</h1>
          <p className="mt-2 text-slate-600 italic">Confidential Market Intelligence Report - {report.timestamp}</p>
        </div>
        
        {formatContent(report.content)}

        {report.sources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">参考数据源 (Google Search Grounding)</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.sources.map((source, i) => (
                <li key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3">
                  <i className="fas fa-link text-blue-400 mt-1"></i>
                  <div>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {source.title || source.uri}
                    </a>
                    <p className="text-xs text-slate-400 truncate">{source.uri}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="bg-slate-900 text-white p-6 text-center text-sm print:hidden">
        <p>© 2025 全球市场情报分析系统 | 绝密信息 仅供内部参考</p>
      </div>
    </div>
  );
};

export default ReportDisplay;
