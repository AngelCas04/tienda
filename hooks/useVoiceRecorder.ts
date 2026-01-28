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

// Detectar si estamos en móvil
const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Hook personalizado para grabación y procesamiento de voz
 * Optimizado para funcionar en PC y móviles
 */
const useVoiceRecorder = (): VoiceRecorderHook => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const fullTranscriptRef = useRef<string>('');
    const isRecordingRef = useRef<boolean>(false);
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastResultIndexRef = useRef<number>(0);

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
     * Mejorado para móviles con patrones más flexibles
     */
    const detectProducts = useCallback((text: string): string[] => {
        // Normalizar números primero
        let normalized = normalizeNumbers(text);

        // Limpiar repeticiones de palabras (común en móviles)
        normalized = normalized.replace(/\b(\w+)( \1\b)+/gi, '$1');

        // Limpiar espacios múltiples
        normalized = normalized.replace(/\s+/g, ' ').trim();

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
        // Más flexible para móviles - permite más variaciones
        const patternWithUnit = new RegExp(
            `(\\d+(?:[.,]\\d+)?)\\s*(?:de\\s+)?(${units})\\s+(?:de\\s+)?([^\\d]+?)(?=\\s*\\d+|$)`,
            'gi'
        );

        let match;

        while ((match = patternWithUnit.exec(normalized)) !== null) {
            const quantity = match[1].replace(',', '.'); // Normalizar comas a puntos
            const unit = match[2];
            const productName = match[3].trim();

            if (productName.length > 0) {
                const capitalizedProduct = productName.charAt(0).toUpperCase() + productName.slice(1);
                products.push(`${quantity} ${unit} ${capitalizedProduct}`);
            }
        }

        // Estrategia 2: Si no encontramos con unidades, buscar solo números + texto
        if (products.length === 0) {
            const simplePattern = /(\d+(?:[.,]\d+)?)\s+([^\d]+?)(?=\s*\d+|$)/gi;

            while ((match = simplePattern.exec(normalized)) !== null) {
                const quantity = match[1].replace(',', '.');
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
     * Optimizado para móviles
     */
    const restartRecognition = useCallback(() => {
        if (!isRecordingRef.current || !SpeechRecognitionAPI) {
            return;
        }

        try {
            const recognition = new SpeechRecognitionAPI();

            // Configuración optimizada para móviles
            recognition.continuous = !isMobile; // En móviles, continuous puede causar problemas
            recognition.interimResults = isMobile; // En móviles, usar interim para mejor captura
            recognition.lang = 'es-MX';

            // Configuraciones adicionales para móviles
            if (isMobile) {
                recognition.maxAlternatives = 1;
            }

            recognition.onresult = (event: any) => {
                let newText = '';

                // En móviles, procesar desde el último índice para evitar duplicados
                const startIndex = isMobile ? lastResultIndexRef.current : 0;

                for (let i = startIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        newText += event.results[i][0].transcript + ' ';
                        lastResultIndexRef.current = i + 1;
                    } else if (isMobile && event.results[i][0].transcript) {
                        // En móviles, también capturar resultados interim al final
                        newText += event.results[i][0].transcript + ' ';
                    }
                }

                // ACUMULAR al texto existente, no reemplazar
                if (newText.trim()) {
                    const currentText = fullTranscriptRef.current;
                    const combinedText = (currentText + ' ' + newText).trim();

                    // Evitar duplicados exactos
                    const words = combinedText.split(' ');
                    const uniqueWords: string[] = [];
                    let lastWord = '';

                    for (const word of words) {
                        if (word !== lastWord || !isMobile) {
                            uniqueWords.push(word);
                        }
                        lastWord = word;
                    }

                    fullTranscriptRef.current = uniqueWords.join(' ');
                    console.log('Texto acumulado:', fullTranscriptRef.current);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Error de reconocimiento:', event.error);

                // En móviles, algunos errores son normales
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    // Reintentar en móviles
                    if (isRecordingRef.current && isMobile) {
                        if (restartTimeoutRef.current) {
                            clearTimeout(restartTimeoutRef.current);
                        }
                        restartTimeoutRef.current = setTimeout(() => {
                            if (isRecordingRef.current) {
                                restartRecognition();
                            }
                        }, 300);
                    }
                } else if (event.error !== 'network' && isRecordingRef.current) {
                    // Otros errores, reintentar
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) {
                            restartRecognition();
                        }
                    }, 500);
                }
            };

            recognition.onend = () => {
                console.log('Reconocimiento finalizado');
                // Reiniciar automáticamente si aún estamos grabando
                if (isRecordingRef.current) {
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }
                    // En móviles, esperar un poco más antes de reiniciar
                    const delay = isMobile ? 300 : 100;
                    restartTimeoutRef.current = setTimeout(() => {
                        if (isRecordingRef.current) {
                            restartRecognition();
                        }
                    }, delay);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Error al reiniciar reconocimiento:', err);

            // En móviles, reintentar después de un error
            if (isRecordingRef.current && isMobile) {
                if (restartTimeoutRef.current) {
                    clearTimeout(restartTimeoutRef.current);
                }
                restartTimeoutRef.current = setTimeout(() => {
                    if (isRecordingRef.current) {
                        restartRecognition();
                    }
                }, 1000);
            }
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
            lastResultIndexRef.current = 0;
            isRecordingRef.current = true;
            setTranscript('');

            console.log('Iniciando grabación en:', isMobile ? 'móvil' : 'PC');

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

        // En móviles, esperar más tiempo para asegurar que se capturó todo
        const processingDelay = isMobile ? 1200 : 800;

        // Procesar resultado después de un delay
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
        }, processingDelay);

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
        lastResultIndexRef.current = 0;
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
