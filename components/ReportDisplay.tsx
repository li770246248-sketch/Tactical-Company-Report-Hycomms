
import React from 'react';
import { IntelligenceReport } from '../types';

interface ReportDisplayProps {
  report: IntelligenceReport;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  const isZH = report.language === 'zh';

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle Main Sections
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b-2 border-slate-100 uppercase tracking-tight">{line.replace('### ', '')}</h3>;
      }
      
      // Handle Sub Sections (e.g., Competition landscape sub-titles or News dates)
      if (line.startsWith('#### ')) {
        return <h4 key={index} className="text-lg font-bold text-blue-700 mt-8 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-sm"></span>
          {line.replace('#### ', '')}
        </h4>;
      }

      // Handle Bullet Points
      if (line.trim().startsWith('- ')) {
        const cleanLine = line.trim().replace('- ', '');
        
        // Special rendering for Link lines
        if (cleanLine.includes('原文链接：') || cleanLine.includes('Original Link:') || cleanLine.startsWith('http')) {
          let label = "";
          let url = cleanLine;

          if (cleanLine.includes('原文链接：')) {
            const parts = cleanLine.split('原文链接：');
            label = "原文链接：";
            url = parts[1].trim();
          } else if (cleanLine.includes('Original Link:')) {
            const parts = cleanLine.split('Original Link:');
            label = "Original Link:";
            url = parts[1].trim();
          }

          return (
            <li key={index} className="ml-4 mb-3 list-none bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              {label && <span className="text-slate-500 font-bold text-[10px] uppercase block mb-1">{label}</span>}
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 break-all text-sm font-mono underline decoration-blue-200 underline-offset-4"
              >
                {url}
                <i className="fas fa-external-link-alt ml-2 text-[10px]"></i>
              </a>
            </li>
          );
        }
        
        // Highlight "Core Summary" or "核心摘要"
        if (cleanLine.includes('核心摘要：')) {
           const parts = cleanLine.split('核心摘要：');
           return (
             <li key={index} className="ml-6 mb-4 list-disc text-slate-700 leading-relaxed">
               <span className="font-bold text-slate-900">核心摘要：</span>
               {parts[1]}
             </li>
           );
        }

        return <li key={index} className="ml-6 mb-2 list-disc text-slate-700 leading-relaxed font-medium">{cleanLine}</li>;
      }

      if (line.trim() === '') return null;
      return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{line}</p>;
    });
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="${isZH ? 'zh-CN' : 'en-US'}">
<head>
    <meta charset="UTF-8">
    <title>${report.companyName} Intelligence 2025</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 p-10 font-sans">
    <div class="max-w-4xl mx-auto bg-white p-12 shadow-xl rounded-xl border border-slate-200">
        <div class="flex justify-between items-end border-b-4 border-slate-900 pb-6 mb-10">
            <div>
              <h1 class="text-3xl font-black uppercase tracking-tighter text-slate-900">${report.companyName}</h1>
              <p class="text-blue-600 font-bold text-sm tracking-widest uppercase">TACTICAL COMMS INTELLIGENCE REPORT</p>
            </div>
            <div class="text-right text-xs text-slate-400 font-mono">
                ${report.timestamp}
            </div>
        </div>
        <div class="prose max-w-none">
          ${report.content.split('\n').map(line => {
            if (line.startsWith('### ')) return `<h2 class="text-2xl font-bold mt-10 mb-4 uppercase border-b border-slate-200 pb-2">${line.replace('### ', '')}</h2>`;
            if (line.startsWith('#### ')) return `<h3 class="text-xl font-bold mt-6 mb-3 text-blue-700">${line.replace('#### ', '')}</h3>`;
            if (line.startsWith('- ')) {
               const cleanLine = line.replace('- ', '');
               if (cleanLine.includes('http')) {
                 return `<li class="ml-6 mb-2"><a href="${cleanLine.split('：').pop()}" style="color: blue; text-decoration: underline;">${cleanLine}</a></li>`;
               }
               return `<li class="ml-6 mb-2">${cleanLine}</li>`;
            }
            return `<p class="mb-4 text-slate-700">${line}</p>`;
          }).join('')}
        </div>
        <div class="mt-20 pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono uppercase tracking-[0.3em]">
            CONFIDENTIAL • INTERNAL USE ONLY • © 2025 INTELLIGENCE UNIT
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Intel_${report.companyName}_2025.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in mb-10 border border-slate-200 flex flex-col">
      <div className="bg-slate-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-white print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">
              {isZH ? '终端分析视图' : 'TERMINAL ANALYSIS VIEW'}
            </span>
            <h2 className="text-lg font-bold tracking-tight">{report.companyName}</h2>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            <i className="fas fa-file-download"></i>
            <span>{isZH ? '导出 HTML' : 'Export HTML'}</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all"
          >
            <i className="fas fa-print"></i>
          </button>
        </div>
      </div>
      
      <div className="p-8 md:p-16 lg:p-20 flex-1">
        {/* Report Header */}
        <div className="mb-12 flex items-center justify-between border-b-4 border-slate-900 pb-8">
          <div className="flex-1">
             <div className="flex items-center gap-4 mb-4">
               {report.logoUrl && (
                 <div className="h-16 w-16 bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center justify-center overflow-hidden">
                   <img src={report.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                 </div>
               )}
               <div>
                  <h1 className="text-4xl font-black text-slate-900 leading-none uppercase tracking-tighter">
                    {report.companyName}
                  </h1>
                  <p className="mt-1 text-slate-400 font-bold tracking-widest text-[10px] uppercase">
                    {isZH ? '全球市场竞争情报报告' : 'GLOBAL MARKET COMPETITIVE INTELLIGENCE'}
                  </p>
               </div>
             </div>
             <div className="flex items-center gap-3 text-blue-600 font-black tracking-widest text-[10px] uppercase">
               <span className="bg-blue-50 px-2 py-0.5 rounded">{isZH ? '密级：绝密' : 'CLASS: TOP SECRET'}</span>
               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
               <span>{report.timestamp}</span>
             </div>
          </div>
        </div>
        
        {/* Report Body */}
        <div className="report-body text-slate-800 text-base leading-relaxed">
            {formatContent(report.content)}
        </div>

        {/* Enhanced Sources Section */}
        {report.sources.length > 0 && (
          <div className="mt-20 pt-12 border-t-2 border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-[0.3em] flex items-center gap-4">
              <i className="fas fa-fingerprint text-blue-600 text-lg"></i>
              {isZH ? '核实数据源与信息指纹' : 'Verified Sources & Data Fingerprints'}
              <div className="flex-1 h-px bg-slate-100"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:border-blue-200 p-4 rounded-xl border border-slate-100 transition-all flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i className="fas fa-globe-americas text-4xl"></i>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <span className="text-[10px] font-black">{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black text-slate-900 block mb-1 truncate leading-tight group-hover:text-blue-600">
                        {source.title || (isZH ? '未知来源标题' : 'Untitled Source')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {source.uri}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Branding */}
      <div className="bg-slate-50 border-t border-slate-100 p-12 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-2 bg-white rounded-full shadow-sm border border-slate-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            © 2025 INTELLIGENCE UNIT GLOBAL COMMAND
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
