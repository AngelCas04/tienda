import React, { useState, useEffect, useRef, useMemo } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';

// Lista de productos comunes para autocompletado
const COMMON_PRODUCTS = [
    // Granos y cereales
    'arroz', 'frijoles', 'lentejas', 'maíz', 'avena', 'cebada', 'trigo',
    // Carnes
    'pollo', 'carne de res', 'carne molida', 'costilla', 'chorizo', 'jamón', 'tocino',
    // Lácteos
    'leche', 'queso', 'crema', 'yogurt', 'mantequilla', 'huevos',
    // Verduras
    'tomate', 'cebolla', 'ajo', 'papa', 'zanahoria', 'chile', 'lechuga', 'repollo',
    // Frutas
    'manzana', 'banana', 'naranja', 'limón', 'aguacate', 'mango', 'piña', 'sandía',
    // Bebidas
    'agua', 'jugo', 'refresco', 'café', 'té', 'cerveza', 'vino',
    // Básicos
    'azúcar', 'sal', 'aceite', 'harina', 'pan', 'tortillas', 'pasta', 'sopa',
    // Snacks
    'galletas', 'chocolate', 'dulces', 'papas fritas', 'cacahuates',
    // Limpieza
    'jabón', 'detergente', 'cloro', 'papel higiénico', 'servilletas',
    // Unidades comunes
    'libras', 'kilos', 'gramos', 'litros', 'unidades', 'docenas', 'cajas', 'paquetes'
];

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

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

    // Obtener la última palabra siendo escrita para sugerencias
    const getCurrentWord = useMemo(() => {
        const words = text.split(/[,\s]+/);
        const lastWord = words[words.length - 1]?.toLowerCase() || '';
        return lastWord;
    }, [text]);

    // Filtrar sugerencias basadas en la palabra actual
    useEffect(() => {
        const currentWord = getCurrentWord;

        if (currentWord.length >= 2) {
            const filtered = COMMON_PRODUCTS.filter(product =>
                product.toLowerCase().startsWith(currentWord) &&
                product.toLowerCase() !== currentWord
            ).slice(0, 5);

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setSelectedIndex(0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [getCurrentWord]);

    // Insertar coma inteligente después de un producto
    const smartInsertComma = (inputText: string): string => {
        // Patrones que indican fin de un producto (número + unidad + palabra)
        const productPattern = /(\d+(?:[.,]\d+)?)\s*(libras?|kilos?|kg|lb|gramos?|litros?|unidades?|docenas?|cajas?|paquetes?)\s+\w+$/i;

        // Si el texto termina con un patrón de producto y no tiene coma
        if (productPattern.test(inputText) && !inputText.trim().endsWith(',')) {
            return inputText + ', ';
        }

        return inputText;
    };

    // Manejar selección de sugerencia
    const handleSelectSuggestion = (suggestion: string) => {
        const words = text.split(/([,\s]+)/);
        words[words.length - 1] = suggestion;

        let newText = words.join('');
        newText = smartInsertComma(newText);

        setText(newText);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Manejar teclas especiales
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if (e.key === 'Tab' || (e.key === 'Enter' && showSuggestions)) {
                    e.preventDefault();
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }

        // Insertar coma automáticamente con espacio después de un producto
        if (e.key === ' ') {
            const testText = text + ' ';
            const smartText = smartInsertComma(testText.trim());
            if (smartText !== testText.trim()) {
                e.preventDefault();
                setText(smartText);
                return;
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Si hay sugerencias visibles y presionan Enter, seleccionar la sugerencia
        if (showSuggestions && suggestions.length > 0) {
            handleSelectSuggestion(suggestions[selectedIndex]);
            return;
        }

        const finalText = text.trim().replace(/,\s*$/, ''); // Quitar coma final
        if (finalText && !isLoading) {
            onSendMessage(finalText);
            setText('');
            resetRecording();
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
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (recordingState === 'idle' || recordingState === 'completed') {
            setText(e.target.value);
        }
    };

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPlaceholder = () => {
        switch (recordingState) {
            case 'recording':
                return 'Grabando... (habla: cantidad, unidad, producto)';
            case 'processing':
                return 'Procesando...';
            case 'error':
                return error || 'Error al grabar';
            default:
                return 'Escribe o usa el micrófono. Ej: 2 libras arroz';
        }
    };

    const getMicButtonClass = () => {
        const base = 'p-2 sm:p-3 rounded-full transition-all duration-300 disabled:opacity-50';
        switch (recordingState) {
            case 'recording':
                return `${base} bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]`;
            case 'processing':
                return `${base} bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]`;
            case 'error':
                return `${base} bg-yellow-500 text-white`;
            default:
                return `${base} bg-dark-bg hover:bg-dark-surface border border-dark-border text-slate-400 hover:text-primary-400`;
        }
    };

    return (
        <div className="relative">
            {/* Sugerencias de autocompletado */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <div className="p-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${index === selectedIndex
                                        ? 'bg-primary-500/20 text-primary-300 border-l-2 border-primary-400'
                                        : 'text-slate-300 hover:bg-dark-bg'
                                    }`}
                            >
                                <span className="font-medium">{suggestion}</span>
                                <span className="text-xs text-slate-500 ml-2">Tab para seleccionar</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-1 sm:gap-2 md:gap-4 p-1.5 sm:p-2 rounded-full bg-dark-surface border border-dark-border shadow-lg transition-all focus-within:ring-2 focus-within:ring-primary-500/50"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholder()}
                    className="flex-1 bg-transparent focus:outline-none px-2 sm:px-4 py-2 sm:py-3 placeholder-slate-500 text-slate-200 text-xs sm:text-sm"
                    disabled={isLoading || recordingState === 'recording' || recordingState === 'processing'}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />

                {error && recordingState === 'error' && (
                    <span className="hidden sm:inline-block text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        {error}
                    </span>
                )}

                {(text || recordingState !== 'idle') && recordingState !== 'processing' && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={isLoading || recordingState === 'processing'}
                        className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Limpiar"
                    >
                        <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                )}

                {recordingState === 'recording' && (
                    <div className="hidden sm:flex items-center gap-1">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_infinite]" />
                            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_0.1s_infinite]" />
                            <span className="w-1 h-4 bg-red-400 rounded-full animate-[soundwave_0.6s_ease-in-out_0.2s_infinite]" />
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isLoading || recordingState === 'processing'}
                    className={getMicButtonClass()}
                    title={recordingState === 'recording' ? 'Detener' : 'Grabar'}
                >
                    {recordingState === 'processing' ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MicIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                </button>

                <button
                    type="submit"
                    disabled={isLoading || !text.trim() || recordingState === 'recording' || recordingState === 'processing'}
                    className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white shadow-lg transform active:scale-95 transition-all"
                    title="Enviar"
                >
                    <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

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
