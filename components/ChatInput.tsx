
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Sincronizar y limpiar el transcript con el input
  useEffect(() => {
    if (transcript) {
      // 1. Eliminar repeticiones contiguas: "una una una" -> "una"
      let cleanText = transcript.replace(/\b(\w+)( \1\b)+/gi, '$1');

      // 2. Capitalizar primera letra
      cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

      setText(cleanText);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
      resetTranscript();
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      setText('');
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'es-MX' });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span className="text-slate-500 text-sm">Navegador no compatible con voz.</span>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 md:gap-4 p-2 rounded-full bg-dark-surface border border-dark-border shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={listening ? 'Escuchando...' : 'Escribe tu pedido aquí...'}
        className="flex-1 bg-transparent focus:outline-none px-4 py-3 placeholder-slate-500 text-slate-200"
        disabled={isLoading}
      />

      <button
        type="button"
        onClick={handleMicClick}
        disabled={isLoading}
        className={`p-3 rounded-full transition-all duration-300 ${listening
            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-dark-bg hover:bg-dark-surface border border-dark-border text-slate-400 hover:text-primary-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <MicIcon className="w-5 h-5" />
      </button>

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="p-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white shadow-lg shadow-primary-900/20 transform active:scale-95 transition-all duration-200"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatInput;