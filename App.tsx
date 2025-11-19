
import React, { useState, useRef, useEffect } from 'react';
import { Message, Invoice } from './types';
import { generateResponse } from './services/geminiService';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import { initialMessage } from './constants';

const App: React.FC = () => {
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
      const aiResponse = await generateResponse(text);
      let aiMessage: Message;
      // FIX: Use 'in' operator for type-safe property access on a union type.
      // This correctly narrows down the type of `aiResponse` to either Invoice
      // or a text response, resolving the compilation errors.
      if ('items' in aiResponse && 'grand_total' in aiResponse) {
         aiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          invoice: aiResponse as Invoice,
        };
      } else {
        // Handle cases where AI gives a text response (e.g., price check)
        aiMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: (aiResponse as { response: string }).response || "No pude procesar esa solicitud. ¿Puedes intentarlo de nuevo?",
        };
      }
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.';
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
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 shadow-lg sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-center text-cyan-400">
          Asistente de Tienda Gemini
        </h1>
        <p className="text-center text-sm text-slate-400">Tu ayudante personal para facturas y precios</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{id: 'loading', sender: 'ai', isLoading: true}} />}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-slate-900/80 backdrop-blur-sm sticky bottom-0">
        {error && <p className="text-red-400 text-center mb-2">{error}</p>}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;
