
import React, { useState, useEffect } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const {
    recordingState,
    transcript,
    startRecording,
    stopRecording,
    resetRecording,
    error
  } = useVoiceRecorder();

  // Actualizar el texto cuando se complete la grabación
  useEffect(() => {
    if (recordingState === 'completed' && transcript) {
      setText(transcript);
    }
  }, [recordingState, transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = text.trim();
    if (finalText && !isLoading) {
      onSendMessage(finalText);
      setText('');
      resetRecording();
    }
  };

  const handleMicClick = async () => {
    if (recordingState === 'recording') {
      // Detener grabación y procesar
      stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'completed' || recordingState === 'error') {
      // Iniciar nueva grabación
      setText('');
      await startRecording();
    }
  };

  const handleClear = () => {
    setText('');
    resetRecording();
  };

  // Determinar el placeholder según el estado
  const getPlaceholder = () => {
    switch (recordingState) {
      case 'recording':
        return 'Grabando... (habla de corrido: cantidad, unidad, producto)';
      case 'processing':
        return 'Procesando grabación...';
      case 'error':
        return error || 'Error al grabar';
      default:
        return 'Escribe o presiona el micrófono para grabar...';
    }
  };

  // Determinar el estilo del botón de micrófono
  const getMicButtonClass = () => {
    const baseClass = 'p-2 sm:p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    switch (recordingState) {
      case 'recording':
        return `${baseClass} bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]`;
      case 'processing':
        return `${baseClass} bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]`;
      case 'error':
        return `${baseClass} bg-yellow-500 text-white`;
      default:
        return `${baseClass} bg-dark-bg hover:bg-dark-surface border border-dark-border text-slate-400 hover:text-primary-400`;
    }
  };

  // Determinar el título del botón de micrófono
  const getMicButtonTitle = () => {
    switch (recordingState) {
      case 'recording':
        return 'Detener y procesar';
      case 'processing':
        return 'Procesando...';
      default:
        return 'Grabar voz';
    }
  };

  // NO mostrar transcripción en tiempo real - solo el texto del input
  const displayText = text;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1 sm:gap-2 md:gap-4 p-1.5 sm:p-2 rounded-full bg-dark-surface border border-dark-border shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
    >
      <input
        type="text"
        value={displayText}
        onChange={(e) => {
          if (recordingState === 'idle' || recordingState === 'completed') {
            setText(e.target.value);
          }
        }}
        placeholder={getPlaceholder()}
        className="flex-1 bg-transparent focus:outline-none px-2 sm:px-4 py-2 sm:py-3 placeholder-slate-500 text-slate-200 text-xs sm:text-sm"
        disabled={isLoading || recordingState === 'recording' || recordingState === 'processing'}
        readOnly={recordingState === 'recording' || recordingState === 'processing'}
      />

      {/* Mostrar error si existe */}
      {error && recordingState === 'error' && (
        <span className="hidden sm:inline-block text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
          {error}
        </span>
      )}

      {/* Botón de limpiar */}
      {(displayText || recordingState !== 'idle') && recordingState !== 'processing' && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading || recordingState === 'processing'}
          className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Limpiar"
        >
          <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      {/* Indicador de grabación */}
      {recordingState === 'recording' && (
        <div className="hidden sm:flex items-center gap-1">
          <div className="flex gap-0.5">
            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_infinite]" />
            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_0.1s_infinite]" />
            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_0.2s_infinite]" />
          </div>
        </div>
      )}

      {/* Botón de micrófono */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isLoading || recordingState === 'processing'}
        className={getMicButtonClass()}
        title={getMicButtonTitle()}
      >
        {recordingState === 'processing' ? (
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <MicIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Botón de enviar */}
      <button
        type="submit"
        disabled={isLoading || !displayText.trim() || recordingState === 'recording' || recordingState === 'processing'}
        className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white shadow-lg shadow-primary-900/20 transform active:scale-95 transition-all duration-200"
        title="Enviar"
      >
        <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Estilos para la animación de onda de sonido */}
      <style>{`
        @keyframes soundwave {
          0%, 100% { height: 1rem; opacity: 0.6; }
          50% { height: 1.5rem; opacity: 1; }
        }
      `}</style>
    </form>
  );
};

export default ChatInput;