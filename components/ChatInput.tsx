import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVoiceRecorder from '../hooks/useVoiceRecorder';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';

// Productos del inventario para autocompletado
const INVENTORY_PRODUCTS = [
    'aceite', 'arroz', 'azúcar', 'frijoles', 'frijol', 'harina', 'avena',
    'leche', 'queso', 'crema', 'huevos', 'huevo', 'mantequilla',
    'pollo', 'carne', 'chorizo', 'jamón', 'tocino',
    'tomate', 'cebolla', 'papa', 'ajo', 'chile', 'zanahoria',
    'café', 'jamaica', 'sopas', 'sopa', 'rancheras', 'coditos', 'macarrones',
    'pasta', 'lasaña', 'margarina', 'vinagre', 'sal',
    'sardina', 'aluminio', 'cubitos', 'hongos',
    'bolsa', 'papel', 'jabón', 'fosforos',
    // Unidades
    'libras', 'kilos', 'gramos', 'litros', 'unidades', 'docenas', 'cajas', 'paquetes'
];

// Correcciones ortográficas
const CORRECTIONS: { [key: string]: string } = {
    'aroz': 'arroz', 'aros': 'arroz', 'arros': 'arroz',
    'frigol': 'frijol', 'frigoles': 'frijoles', 'friiol': 'frijol',
    'asucar': 'azúcar', 'azucar': 'azúcar', 'aszucar': 'azúcar',
    'azeite': 'aceite', 'aseite': 'aceite', 'acite': 'aceite',
    'polllo': 'pollo', 'poyo': 'pollo',
    'huebo': 'huevo', 'guevo': 'huevo', 'guevos': 'huevos',
    'cevolla': 'cebolla', 'sebolla': 'cebolla', 'sevolla': 'cebolla',
    'tortilas': 'tortillas', 'tortila': 'tortilla',
    'sops': 'sopas', 'cafee': 'café', 'cafe': 'café',
    'libra': 'libras', 'kilo': 'kilos', 'unidad': 'unidades'
};

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

    // Corregir ortografía
    const correctWord = useCallback((word: string): string => {
        const lower = word.toLowerCase();
        return CORRECTIONS[lower] || word;
    }, []);

    /**
     * FORMATEO INTELIGENTE: Inserta comas entre productos
     * LÓGICA: NÚMERO abre producto, TEXTO es nombre, próximo NÚMERO cierra y abre nuevo
     * EXCEPCIÓN: "de X" - el número es parte del nombre (ej: bolsas de 2 libras)
     */
    const formatText = useCallback((input: string): string => {
        if (!input.trim()) return input;

        const tokens = input.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
        const products: string[] = [];
        let current: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const corrected = correctWord(token);
            const prevToken = i > 0 ? tokens[i - 1].toLowerCase() : '';
            const isNumber = /^\d+([.,]\d+)?$/.test(corrected);

            // Si la palabra anterior es "de", "#", "numero" → el número es parte del nombre
            const prevIsConnector = ['de', '#', 'numero', 'número', 'no', 'no.'].includes(prevToken);
            const isPartOfProductName = isNumber && prevIsConnector && current.length > 0;

            if (isNumber && !isPartOfProductName) {
                // Nueva cantidad - guardar producto anterior
                if (current.length > 0) {
                    products.push(current.join(' '));
                    current = [];
                }
                current.push(corrected);
            } else if (isNumber && isPartOfProductName) {
                // Número es parte del nombre (ej: "bolsas de 2 libras")
                current.push(corrected);
            } else {
                // Es texto
                const skip = ['de', 'el', 'la', 'los', 'las', 'y', 'con'];
                if (current.length > 0 || !skip.includes(corrected.toLowerCase())) {
                    current.push(corrected);
                }
            }
        }

        if (current.length > 0) {
            products.push(current.join(' '));
        }

        return products.join(', ');
    }, [correctWord]);

    // Actualizar texto cuando termina grabación
    useEffect(() => {
        if (recordingState === 'completed' && transcript) {
            setText(transcript);
        }
    }, [recordingState, transcript]);

    // Autocompletado basado en última palabra
    useEffect(() => {
        const words = text.split(/[,\s]+/);
        const lastWord = words[words.length - 1]?.toLowerCase() || '';

        if (lastWord.length >= 2 && !/^\d/.test(lastWord)) {
            const matches = INVENTORY_PRODUCTS.filter(p =>
                p.toLowerCase().startsWith(lastWord) && p.toLowerCase() !== lastWord
            ).slice(0, 5);

            setSuggestions(matches);
            setShowSuggestions(matches.length > 0);
            setSelectedIndex(0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [text]);

    // Seleccionar sugerencia
    const selectSuggestion = (suggestion: string) => {
        const parts = text.split(/(\s+)/);
        parts[parts.length - 1] = suggestion;
        setText(parts.join(''));
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                selectSuggestion(suggestions[selectedIndex]);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
    };

    // Enviar mensaje
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showSuggestions && suggestions.length > 0) {
            selectSuggestion(suggestions[selectedIndex]);
            return;
        }

        // Formatear antes de enviar
        let final = formatText(text.trim());
        final = final.replace(/,\s*$/, ''); // Quitar coma final

        if (final && !isLoading) {
            onSendMessage(final);
            setText('');
            resetRecording();
        }
    };

    // Micrófono
    const handleMic = async () => {
        if (recordingState === 'recording') {
            stopRecording();
        } else if (['idle', 'completed', 'error'].includes(recordingState)) {
            setText('');
            await startRecording();
        }
    };

    // Limpiar
    const handleClear = () => {
        setText('');
        resetRecording();
        setShowSuggestions(false);
    };

    // Formatear al perder foco
    const handleBlur = () => {
        if (text.trim()) {
            const formatted = formatText(text);
            if (formatted !== text) setText(formatted);
        }
    };

    // Cerrar sugerencias al click fuera
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!suggestionsRef.current?.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Estilos dinámicos
    const getMicClass = () => {
        const base = 'p-2.5 sm:p-3 rounded-full transition-all duration-300';
        switch (recordingState) {
            case 'recording':
                return `${base} bg-red-500 text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.7)]`;
            case 'processing':
                return `${base} bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]`;
            case 'error':
                return `${base} bg-amber-500 text-white`;
            default:
                return `${base} bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-400 hover:text-emerald-400`;
        }
    };

    const getPlaceholder = () => {
        switch (recordingState) {
            case 'recording': return '🎤 Grabando... di: "2 arroz 3 frijol 1 aceite"';
            case 'processing': return '⏳ Procesando audio...';
            case 'error': return error || '❌ Error de grabación';
            default: return '2 arroz 3 frijol → se formatea automáticamente';
        }
    };

    return (
        <div className="relative">
            {/* Sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                    <div className="p-1.5">
                        {suggestions.map((s, i) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => selectSuggestion(s)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${i === selectedIndex
                                    ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400'
                                    : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="font-medium">{s}</span>
                                <span className="text-xs text-slate-500 ml-2 hidden sm:inline">Tab ↹</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input form */}
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/40 shadow-xl transition-all focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/50"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={getPlaceholder()}
                    disabled={isLoading || recordingState === 'recording' || recordingState === 'processing'}
                    className="flex-1 bg-transparent px-3 sm:px-4 py-2 text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none min-w-0"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />

                {/* Clear button */}
                {(text || recordingState !== 'idle') && recordingState !== 'processing' && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Limpiar"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                )}

                {/* Recording indicator */}
                {recordingState === 'recording' && (
                    <div className="hidden sm:flex items-center gap-1 px-2">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-5 bg-red-400 rounded-full animate-[wave_0.5s_ease-in-out_infinite]" />
                            <span className="w-1 h-5 bg-red-400 rounded-full animate-[wave_0.5s_ease-in-out_0.1s_infinite]" />
                            <span className="w-1 h-5 bg-red-400 rounded-full animate-[wave_0.5s_ease-in-out_0.2s_infinite]" />
                        </div>
                    </div>
                )}

                {/* Mic button */}
                <button
                    type="button"
                    onClick={handleMic}
                    disabled={isLoading || recordingState === 'processing'}
                    className={getMicClass()}
                    title={recordingState === 'recording' ? 'Detener' : 'Grabar voz'}
                >
                    {recordingState === 'processing' ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MicIcon className="w-5 h-5" />
                    )}
                </button>

                {/* Send button */}
                <button
                    type="submit"
                    disabled={isLoading || !text.trim() || recordingState === 'recording' || recordingState === 'processing'}
                    className="p-2.5 sm:p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-all"
                    title="Enviar"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>

            <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.6; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default ChatInput;
