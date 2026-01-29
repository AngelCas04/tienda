import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Message, Invoice, Product } from '../types';
import { generateResponse } from '../services/geminiService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { initialMessage } from '../constants';

interface ChatInterfaceProps {
  products: Product[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ products }) => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await generateResponse(text, products);

      let aiMessage: Message;
      if ('items' in aiResponse && 'grand_total' in aiResponse) {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          invoice: aiResponse as Invoice,
        };
      } else {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: (aiResponse as { response: string }).response || "No pude procesar esa solicitud.",
        };
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = 'Lo siento, ocurrió un error al procesar tu solicitud.';
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: errorMessage },
      ]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1a] text-slate-100 overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/ventas"
            className="p-2.5 text-slate-400 hover:text-emerald-400 transition-all hover:bg-emerald-500/10 rounded-xl group"
            title="Gestión de Ventas"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Asistente de Tienda
            </h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">IA Activa</p>
            </div>
          </div>

          <Link
            to="/admin"
            className="p-2.5 text-slate-400 hover:text-teal-400 transition-all hover:bg-teal-500/10 rounded-xl group"
            title="Administración"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <ChatMessage message={msg} />
            </div>
          ))}
          {isLoading && (
            <div className="animate-fade-in-up">
              <ChatMessage message={{ id: 'loading', sender: 'ai', isLoading: true }} />
            </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      {/* Footer Input */}
      <footer className="relative z-20 bg-[#0a0f1a]/80 backdrop-blur-xl border-t border-slate-800/50">
        {error && (
          <div className="max-w-4xl mx-auto px-4 pt-3">
            <p className="text-red-400 text-center text-sm bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
              {error}
            </p>
          </div>
        )}
        <div className="max-w-4xl mx-auto p-4">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
