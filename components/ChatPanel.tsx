
import React, { useState, useRef, useEffect } from 'react';
import { IntelligenceReport, ChatMessage, Language } from '../types';
import { askFollowUp } from '../services/geminiService';

interface ChatPanelProps {
  report: IntelligenceReport;
  language: Language;
  onUpdateReport: (updatedReport: IntelligenceReport) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ report, language, onUpdateReport }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isZH = language === 'zh';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [report.chatHistory, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedHistory = [...(report.chatHistory || []), userMessage];
    onUpdateReport({ ...report, chatHistory: updatedHistory });
    
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const answer = await askFollowUp(currentInput, report.content, report.chatHistory || [], language);
      
      const modelMessage: ChatMessage = {
        role: 'model',
        text: answer,
        timestamp: new Date().toLocaleTimeString()
      };

      onUpdateReport({ 
        ...report, 
        chatHistory: [...updatedHistory, modelMessage] 
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800 w-80 lg:w-96 shadow-2xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            {isZH ? '战术追问终端' : 'TACTICAL Q&A'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-green-500 font-mono">GCP_SYNC: OK</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"
      >
        {(!report.chatHistory || report.chatHistory.length === 0) && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-6">
            <i className="fas fa-comment-dots text-4xl mb-4"></i>
            <p className="text-xs font-medium text-slate-400">
              {isZH ? '针对报告内容进行深度追问\n系统将结合 2025 最新情报回答' : 'Ask follow-up questions\nContext-aware AI assistance'}
            </p>
          </div>
        )}

        {report.chatHistory?.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-xl text-sm leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-600 font-mono mt-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700 flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isZH ? "输入你的疑问..." : "Type your question..."}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <i className={`fas ${isTyping ? 'fa-circle-notch animate-spin' : 'fa-paper-plane'} text-xs`}></i>
          </button>
        </form>
        <div className="mt-2 flex justify-between items-center px-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Powered by Gemini 3</span>
          <div className="flex items-center gap-1">
             <i className="fas fa-cloud text-[9px] text-blue-400"></i>
             <span className="text-[9px] text-slate-500 font-mono">SECURE CLOUD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
