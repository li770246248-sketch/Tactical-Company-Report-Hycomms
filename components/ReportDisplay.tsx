
import React from 'react';
import { IntelligenceReport } from '../types';

interface ReportDisplayProps {
  report: IntelligenceReport;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  const isZH = report.language === 'zh';

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200 uppercase tracking-tight">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-bold text-blue-700 mt-6 mb-3">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        if (line.includes('原文链接：') || line.includes('Original Link:')) {
          const splitText = isZH ? '原文链接：' : 'Original Link:';
          const parts = line.split(splitText);
          return (
            <li key={index} className="ml-4 mb-2 list-none">
              <span className="text-slate-500 font-medium">{splitText}</span>
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

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="${isZH ? 'zh-CN' : 'en-US'}">
<head>
    <meta charset="UTF-8">
    <title>${report.companyName} Market Intelligence</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print { .no-print { display: none; } }
        body { background-color: #f8fafc; font-family: sans-serif; }
        .report-container { max-width: 900px; margin: 40px auto; background: white; padding: 60px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; }
        h3 { font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; color: #1e293b; text-transform: uppercase; }
        h4 { font-size: 1.125rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1d4ed8; }
        p, li { line-height: 1.6; color: #334155; margin-bottom: 1rem; }
        .logo-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #0f172a; padding-bottom: 20px; }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="logo-header">
            <div style="display: flex; align-items: center; gap: 15px;">
              ${report.logoUrl ? `<img src="${report.logoUrl}" alt="Logo" style="height: 50px;">` : ''}
              <h1 style="font-size: 1.5rem; font-bold; color: #0f172a;">${report.companyName}</h1>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; color: #1e40af;">CONFIDENTIAL INTELLIGENCE</p>
                <p style="margin: 0; font-size: 0.75rem; color: #64748b;">${report.timestamp}</p>
            </div>
        </div>
        <div>${report.content.split('\n').map(line => {
          if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
          if (line.startsWith('#### ')) return `<h4>${line.replace('#### ', '')}</h4>`;
          if (line.startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
          return `<p>${line}</p>`;
        }).join('')}</div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.companyName}_Intel_2025.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in mb-10 border border-slate-200">
      <div className="bg-slate-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">
              {isZH ? '情报分析中心' : 'INTEL ANALYSIS CENTER'}
            </span>
            <h2 className="text-lg font-bold">{report.companyName}</h2>
          </div>
        </div>
        
        <div className="flex gap-2 print:hidden">
          <button 
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-all shadow-md"
          >
            <i className="fas fa-file-export"></i>
            <span>{isZH ? '导出 HTML' : 'Export HTML'}</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 rounded-lg text-sm font-bold transition-all"
          >
            <i className="fas fa-print"></i>
          </button>
        </div>
      </div>
      
      <div className="p-8 md:p-14 prose prose-slate max-w-none">
        <div className="mb-10 flex items-center justify-between border-b-2 border-slate-900 pb-6">
          <div className="flex-1">
             <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
               {isZH ? '战术通信行业市场情报报告' : 'Tactical Comms Market Intelligence'}
             </h1>
             <p className="mt-2 text-blue-600 font-bold tracking-widest text-sm uppercase">
               {isZH ? '绝密内部文件' : 'Confidential Internal Use Only'} | {report.timestamp}
             </p>
          </div>
          {report.logoUrl && (
            <div className="h-20 w-32 flex items-center justify-center p-2 bg-white rounded border border-slate-100 shadow-sm ml-4">
              <img src={report.logoUrl} alt="Target Logo" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>
        
        <div className="report-body text-slate-800">
            {formatContent(report.content)}
        </div>

        {report.sources.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-1 bg-blue-600 inline-block"></span>
              {isZH ? '核实数据源' : 'Verified Data Sources'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3 hover:bg-blue-50 transition-colors group"
                >
                  <i className="fas fa-link text-slate-300 group-hover:text-blue-500"></i>
                  <span className="text-xs font-bold text-slate-600 truncate">{source.title || source.uri}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-900 text-slate-500 p-8 text-center text-[10px] tracking-widest font-mono uppercase">
        <p>© 2025 Intelligence Unit Global Portal | Unauthorized copying prohibited</p>
      </div>
    </div>
  );
};

export default ReportDisplay;
