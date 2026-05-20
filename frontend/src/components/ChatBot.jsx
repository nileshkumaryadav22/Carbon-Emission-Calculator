import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Leaf, Sparkles } from 'lucide-react';
import api from '../utils/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am EcoBot, your personal green assistant. Ask me anything about reducing your carbon footprint, recycling, energy-saving habits, or how to level up your badges!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: 'Green Transport 🚗', text: 'How do I reduce my transportation carbon footprint?' },
    { label: 'Save Electricity 💡', text: 'Give me tips to save electricity at home' },
    { label: 'Plant Diet 🥦', text: 'How does food diet type impact carbon footprint?' },
    { label: 'Eco Badges 🏆', text: 'Explain user scores and badges' }
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot', { message: text });
      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.response }]);
      }
    } catch (error) {
      console.error('Error communicating with EcoBot:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Oops, I encountered a temporary connection issue. Please try asking again shortly!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white dark:border-slate-900"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex flex-col w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 glass-panel animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/20">
                <Leaf className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">EcoBot AI</h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Active Environmental Advisor
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-[#0c101b]/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-1">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-100/40 dark:bg-slate-900/40 border-t border-slate-200/20 dark:border-slate-800/20">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Suggested Topics:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(qp.text)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input Footer */}
          <div className="p-3 border-t border-slate-200/30 dark:border-slate-800/30 bg-white dark:bg-[#0b0f19]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask EcoBot something..."
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || loading}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white shadow-sm transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
