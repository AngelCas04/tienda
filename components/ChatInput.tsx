import React, { useState, useEffect, useRef } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import useAutocomplete from '../hooks/useAutocomplete';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';
import { Product } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    recordingState,
    transcript,
    startRecording,
    stopRecording,
    resetRecording,
    error
  } = useVoiceRecorder();

  const {
    suggestions,
    selectedIndex,
    handleInputChange,
    selectSuggestion,
    handleKeyNavigation,
    clearSuggestions,
    currentWord
  } = useAutocomplete();

  // Actualizar el texto cuando se complete la grabación
  useEffect(() => {
    if (recordingState === 'completed' && transcript) {
      setText(transcript);
      clearSuggestions();
    }
  }, [recordingState, transcript, clearSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = text.trim();
    if (finalText && !isLoading) {
      onSendMessage(finalText);
      setText('');
      resetRecording();
      clearSuggestions();
    }
  };

  const handleMicClick = async () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else if (recordingState === 'idle' || recordingState === 'completed' || recordingState === 'error') {
      setText('');
      await startRecording();
    }
  };

  const handleClear = () => {
    setText('');
    resetRecording();
    clearSuggestions();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (recordingState === 'idle' || recordingState === 'completed') {
      const newValue = e.target.value;
      const newCursor = e.target.selectionStart || 0;
      setText(newValue);
      setCursorPosition(newCursor);
      handleInputChange(newValue, newCursor);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Manejar navegación de autocompletado
    if (suggestions.length > 0) {
      if (handleKeyNavigation(e.key)) {
        e.preventDefault();

        // Seleccionar si es Tab o Enter con elemento seleccionado
        if ((e.key === 'Tab' || e.key === 'Enter') && selectedIndex >= 0) {
          const product = suggestions[selectedIndex];
          const newText = selectSuggestion(product, text);
          setText(newText);

          // Mover cursor al final
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(newText.length, newText.length);
            }
          }, 0);
        }
      }
    }
  };

  const handleSuggestionClick = (product: Product) => {
    const newText = selectSuggestion(product, text);
    setText(newText);
    inputRef.current?.focus();
  };

  // Determinar el placeholder según el estado
  const getPlaceholder = () => {
    switch (recordingState) {
      case 'recording':
        return 'Grabando... (habla de corrido)';
      case 'processing':
        return 'Procesando grabación...';
      case 'error':
        return error || 'Error al grabar';
      default:
        return 'Escribe productos o usa el micrófono...';
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

  const displayText = text;

  return (
    <div className="relative">
      {/* Dropdown de sugerencias */}
      {suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-2 text-xs text-slate-500 border-b border-dark-border bg-dark-bg/50">
            Sugerencias para "<span className="text-primary-400">{currentWord}</span>"
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {suggestions.map((product, index) => (
              <li
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors
                  ${index === selectedIndex
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'hover:bg-dark-bg/50 text-slate-300'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{product.name}</span>
                  {product.category && (
                    <span className="ml-2 text-xs text-slate-500">
                      {product.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500">{product.unit}</span>
                  <span className="text-sm font-semibold text-green-400">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 text-xs text-slate-600 border-t border-dark-border bg-dark-bg/30 flex gap-3">
            <span><kbd className="px-1 bg-dark-bg rounded">↑↓</kbd> navegar</span>
            <span><kbd className="px-1 bg-dark-bg rounded">Tab</kbd> seleccionar</span>
            <span><kbd className="px-1 bg-dark-bg rounded">Esc</kbd> cerrar</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 sm:gap-2 md:gap-4 p-1.5 sm:p-2 rounded-full bg-dark-surface border border-dark-border shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
      >
        <input
          ref={inputRef}
          type="text"
          value={displayText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
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
    </div>
  );
};

export default ChatInput;