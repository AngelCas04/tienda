
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
    return <span>Navegador no compatible con voz.</span>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 md:gap-4 p-2 rounded-full bg-slate-800 border border-slate-700 shadow-inner"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={listening ? 'Escuchando...' : 'Escribe tu pedido aquí...'}
        className="flex-1 bg-transparent focus:outline-none px-4 py-2 placeholder-slate-500"
        disabled={isLoading}
      />
      
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors duration-200 ${
            listening
            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-cyan-500 hover:bg-cyan-600 text-slate-900'
        } disabled:bg-slate-600 disabled:cursor-not-allowed`}
        >
        <MicIcon className="w-6 h-6" />
      </button>

      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 transition-colors duration-200"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;