import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Message, Invoice, Product } from '../types';
import { generateResponse } from '../services/geminiService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { initialMessage } from '../constants';
import { AdminIcon } from './icons/AdminIcon';
import { ChartIcon } from './icons/ChartIcon';

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
    <div className="flex flex-col h-screen bg-dark-bg text-slate-100 font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-900/20 rounded-full blur-[100px]" />
      </div>

      <header className="bg-dark-surface/80 backdrop-blur-md p-4 border-b border-dark-border shadow-lg sticky top-0 z-10 flex justify-between items-center">
        <Link to="/ventas" className="p-2 text-slate-400 hover:text-primary-400 transition-all hover:bg-primary-500/10 rounded-lg" title="Ver Ventas">
          <ChartIcon className="w-6 h-6" />
        </Link>

        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent font-heading">
            Asistente de Tienda
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide">AI POWERED ASSISTANT</p>
        </div>

        <Link to="/admin" className="p-2 text-slate-400 hover:text-secondary-400 transition-all hover:bg-secondary-500/10 rounded-lg" title="Administración">
          <AdminIcon className="w-6 h-6" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-0 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ id: 'loading', sender: 'ai', isLoading: true }} />}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-dark-surface/90 backdrop-blur-md border-t border-dark-border sticky bottom-0 z-10">
        {error && <p className="text-red-400 text-center mb-2 text-sm animate-pulse">{error}</p>}
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
