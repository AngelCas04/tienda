import { useState, useRef, useCallback, useEffect } from 'react';

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

interface VoiceRecorderHook {
    recordingState: RecordingState;
    transcript: string;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    resetRecording: () => void;
    error: string | null;
}

// Usar tipos nativos del navegador para Web Speech API
// Usamos 'any' para evitar conflictos con tipos existentes
const SpeechRecognitionAPI: any =
    typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

/**
 * Hook personalizado para grabación y procesamiento de voz
 * Graba audio de forma continua y procesa al finalizar
 * Detecta productos por patrón cantidad+producto (no por pausas)
 */
const useVoiceRecorder = (): VoiceRecorderHook => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const fullTranscriptRef = useRef<string>('');
    const isRecordingRef = useRef<boolean>(false);
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Normaliza números hablados a dígitos
     * "dos" -> "2", "uno punto cinco" -> "1.5"
     */
    const normalizeNumbers = useCallback((text: string): string => {
        const numberMap: { [key: string]: string } = {
            'cero': '0', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3',
            'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7',
            'ocho': '8', 'nueve': '9', 'diez': '10',
            'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
            'quince': '15', 'dieciséis': '16', 'diecisiete': '17',
            'dieciocho': '18', 'diecinueve': '19', 'veinte': '20',
            'veintiuno': '21', 'veintidós': '22', 'veintitrés': '23',
            'veinticuatro': '24', 'veinticinco': '25', 'treinta': '30',
            'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60',
            'setenta': '70', 'ochenta': '80', 'noventa': '90',
            'cien': '100', 'ciento': '100', 'mil': '1000',
            'medio': '0.5', 'media': '0.5', 'cuarto': '0.25'
        };

        let normalized = text.toLowerCase();

        // Reemplazar "punto" o "coma" por "." para decimales
        normalized = normalized.replace(/\s+(punto|coma)\s+/g, '.');

        // Reemplazar números hablados
        Object.entries(numberMap).forEach(([word, digit]) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            normalized = normalized.replace(regex, digit);
        });

        // Manejar "y" en números compuestos (ej: "veinte y uno" -> "21")
        normalized = normalized.replace(/(\d+)\s+y\s+(\d+)/g, (_match, tens, ones) => {
            return String(parseInt(tens) + parseInt(ones));
        });

        return normalized;
    }, []);

    /**
     * Detecta productos basándose en el patrón: número + unidad + nombre_producto
     * Mejorado para detectar TODOS los productos sin límite
     */
    const detectProducts = useCallback((text: string): string[] => {
        // Normalizar números primero
        let normalized = normalizeNumbers(text);

        // Limpiar repeticiones de palabras
        normalized = normalized.replace(/\b(\w+)( \1\b)+/gi, '$1');

        console.log('Texto normalizado:', normalized);

        // Patrones comunes de unidades (más completo)
        const units = [
            'libras?', 'lb', 'lbs',
            'kilos?', 'kg', 'kgs', 'kilogramos?',
            'gramos?', 'gr', 'grs',
            'onzas?', 'oz',
            'unidades?', 'piezas?',
            'cajas?', 'paquetes?',
            'bolsas?', 'sacos?',
            'litros?', 'lts?', 'l',
            'galones?', 'gal',
            'metros?', 'mts?',
            'docenas?'
        ].join('|');

        const products: string[] = [];

        // Estrategia 1: Patrón completo con unidad
        // Ejemplo: "2 libras arroz", "1.5 kg de frijoles"
        const patternWithUnit = new RegExp(
            `(\\d+(?:\\.\\d+)?)\\s+(${units})\\s+(?:de\\s+)?([^\\d]+?)(?=\\s*\\d+\\s+(?:${units})|$)`,
            'gi'
        );

        let match;
        const usedIndices: number[] = [];

        while ((match = patternWithUnit.exec(normalized)) !== null) {
            const quantity = match[1];
            const unit = match[2];
            const productName = match[3].trim();

            if (productName.length > 0) {
                const capitalizedProduct = productName.charAt(0).toUpperCase() + productName.slice(1);
                products.push(`${quantity} ${unit} ${capitalizedProduct}`);
                usedIndices.push(match.index);
            }
        }

        // Estrategia 2: Si no encontramos con unidades, buscar solo números + texto
        if (products.length === 0) {
            const simplePattern = /(\d+(?:\.\d+)?)\s+([^\d]+?)(?=\s*\d+|$)/gi;

            while ((match = simplePattern.exec(normalized)) !== null) {
                const quantity = match[1];
                const rest = match[2].trim();

                if (rest.length > 0) {
                    const capitalizedRest = rest.charAt(0).toUpperCase() + rest.slice(1);
                    products.push(`${quantity} ${capitalizedRest}`);
                }
            }
        }

        console.log('Productos detectados:', products);

        // Si aún no hay productos, devolver el texto normalizado completo
        if (products.length === 0 && normalized.trim().length > 0) {
            return [normalized.charAt(0).toUpperCase() + normalized.slice(1)];
        }

        return products;
    }, [normalizeNumbers]);

    /**
     * Reinicia el reconocimiento automáticamente para grabaciones largas
     */
    const restartRecognition = useCallback(() => {
        if (!isRecordingRef.current || !SpeechRecognitionAPI) {
            return;
        }

        try {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'es-MX';

            recognition.onresult = (event: any) => {
                let newText = '';
                for (let i = 0; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        newText += event.results[i][0].transcript + ' ';
                    }
                }

                // ACUMULAR al texto existente, no reemplazar
                if (newText.trim()) {
                    fullTranscriptRef.current = (fullTranscriptRef.current + ' ' + newText).trim();
                    console.log('Texto acumulado:', fullTranscriptRef.current);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Error de reconocimiento:', event.error);

                if (event.error !== 'no-speech' && event.error !== 'aborted' && isRecordingRef.current) {
                    // Reintentar después de un error menor
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) {
                            restartRecognition();
                        }
                    }, 100);
                }
            };

            recognition.onend = () => {
                console.log('Reconocimiento finalizado, reiniciando...');
                // Reiniciar automáticamente si aún estamos grabando
                if (isRecordingRef.current) {
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) {
                            restartRecognition();
                        }
                    }, 100);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Error al reiniciar reconocimiento:', err);
        }
    }, []);

    /**
     * Inicia la grabación de audio
     */
    const startRecording = useCallback(async () => {
        if (!SpeechRecognitionAPI) {
            setError('Speech Recognition no está disponible en este navegador');
            setRecordingState('error');
            return;
        }

        try {
            setError(null);
            setRecordingState('recording');
            fullTranscriptRef.current = '';
            isRecordingRef.current = true;
            setTranscript('');

            // Iniciar el reconocimiento con reinicio automático
            restartRecognition();

        } catch (err) {
            console.error('Error al iniciar grabación:', err);
            setError('No se pudo iniciar la grabación. Verifica los permisos del micrófono.');
            setRecordingState('error');
            isRecordingRef.current = false;
        }
    }, [restartRecognition]);

    /**
     * Detiene la grabación y procesa el resultado final
     */
    const stopRecording = useCallback(() => {
        if (!isRecordingRef.current || recordingState !== 'recording') {
            return;
        }

        console.log('Deteniendo grabación...');
        isRecordingRef.current = false;
        setRecordingState('processing');

        // Limpiar timeout de reinicio
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        // Detener reconocimiento
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Error al detener reconocimiento:', e);
            }
        }

        // Procesar resultado después de un delay para asegurar que se capturó todo
        setTimeout(() => {
            const rawText = fullTranscriptRef.current;

            console.log('Texto completo capturado:', rawText);

            if (!rawText || rawText.trim().length === 0) {
                setError('No se detectó ningún audio. Intenta de nuevo.');
                setRecordingState('error');
                recognitionRef.current = null;
                return;
            }

            // Detectar productos por patrón
            const products = detectProducts(rawText);

            console.log('Productos finales:', products);

            // Unir con comas
            const finalText = products.join(', ');

            setTranscript(finalText);
            setRecordingState('completed');
            recognitionRef.current = null;

            console.log('Texto procesado final:', finalText);
        }, 800); // Delay de 800ms para asegurar que se procesó todo

    }, [recordingState, detectProducts]);

    /**
     * Reinicia el estado del grabador
     */
    const resetRecording = useCallback(() => {
        isRecordingRef.current = false;

        // Limpiar timeout
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        // Detener reconocimiento si está activo
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignorar errores al detener
            }
            recognitionRef.current = null;
        }

        // Reiniciar estados
        setRecordingState('idle');
        setTranscript('');
        setError(null);
        fullTranscriptRef.current = '';
    }, []);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            isRecordingRef.current = false;

            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignorar errores
                }
            }
        };
    }, []);

    return {
        recordingState,
        transcript,
        startRecording,
        stopRecording,
        resetRecording,
        error
    };
};

export default useVoiceRecorder;
