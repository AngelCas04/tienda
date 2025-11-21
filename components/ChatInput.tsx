
import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [segments, setSegments] = useState<string[]>([]);
  const lastTranscriptRef = useRef('');
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Detectar pausas y separar productos automáticamente
  useEffect(() => {
    if (!listening) return;

    if (transcript && transcript !== lastTranscriptRef.current) {
      // Limpiar timer anterior
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      // Limpiar repeticiones
      let cleanText = transcript.replace(/\b(\w+)( \1\b)+/gi, '$1');
      cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

      // Actualizar texto actual
      setText(cleanText);
      lastTranscriptRef.current = transcript;

      // Detectar pausa de 0.8 segundos para agregar como nuevo segmento
      pauseTimerRef.current = setTimeout(() => {
        if (cleanText.trim()) {
          setSegments(prev => [...prev, cleanText.trim()]);
          setText(''); // Limpiar texto después de agregar segmento
          resetTranscript();
          lastTranscriptRef.current = '';
        }
      }, 800); // 0.8 segundos - más rápido para ventas
    }
  }, [transcript, listening, resetTranscript]);

  // Combinar segmentos con comas
  const fullText = segments.length > 0
    ? segments.join(', ') + (text.trim() ? ', ' + text : '')
    : text;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = fullText.trim();
    if (finalText && !isLoading) {
      onSendMessage(finalText);
      setText('');
      setSegments([]);
      resetTranscript();
      lastTranscriptRef.current = '';
    }
  };

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    } else {
      setSegments([]);
      setText('');
      resetTranscript();
      lastTranscriptRef.current = '';
      SpeechRecognition.startListening({ continuous: true, language: 'es-MX' });
    }
  };

  const handleClear = () => {
    setText('');
    setSegments([]);
    resetTranscript();
    lastTranscriptRef.current = '';
    if (listening) {
      SpeechRecognition.stopListening();
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span className="text-slate-500 text-sm">Navegador no compatible con voz.</span>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1 sm:gap-2 md:gap-4 p-1.5 sm:p-2 rounded-full bg-dark-surface border border-dark-border shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
    >
      <input
        type="text"
        value={fullText}
        onChange={(e) => {
          const newText = e.target.value;
          setSegments([]);
          setText(newText);
        }}
        placeholder={listening ? 'Escuchando...' : 'Escribe aquí...'}
        className="flex-1 bg-transparent focus:outline-none px-2 sm:px-4 py-2 sm:py-3 placeholder-slate-500 text-slate-200 text-xs sm:text-sm"
        disabled={isLoading}
      />

      {(fullText || segments.length > 0) && (
        <div className="flex items-center gap-0.5 sm:gap-1">
          {segments.length > 0 && (
            <span className="hidden sm:inline-flex text-xs text-primary-400 font-mono bg-primary-500/10 px-2 py-1 rounded">
              {segments.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpiar"
          >
            <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleMicClick}
        disabled={isLoading}
        className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${listening
          ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          : 'bg-dark-bg hover:bg-dark-surface border border-dark-border text-slate-400 hover:text-primary-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={listening ? 'Detener' : 'Grabar'}
      >
        <MicIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="submit"
        disabled={isLoading || !fullText.trim()}
        className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white shadow-lg shadow-primary-900/20 transform active:scale-95 transition-all duration-200"
        title="Enviar"
      >
        <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </form>
  );
};

export default ChatInput;