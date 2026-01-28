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
     * Ejemplo: "2 libras de arroz 3 libras de frijoles" -> ["2 libras de arroz", "3 libras de frijoles"]
     */
    const detectProducts = useCallback((text: string): string[] => {
        // Normalizar números primero
        let normalized = normalizeNumbers(text);

        // Limpiar repeticiones de palabras
        normalized = normalized.replace(/\b(\w+)( \1\b)+/gi, '$1');

        // Patrones comunes de unidades
        const units = [
            'libras?', 'lb', 'lbs',
            'kilos?', 'kg', 'kgs',
            'gramos?', 'gr', 'grs',
            'onzas?', 'oz',
            'unidades?', 'piezas?',
            'cajas?', 'paquetes?',
            'bolsas?', 'sacos?',
            'litros?', 'lts?',
            'galones?', 'gal'
        ].join('|');

        // Patrón: número (decimal o entero) + unidad + "de" (opcional) + producto
        // Ejemplo: "2 libras arroz", "1.5 kg de frijoles", "3 unidades pan"
        const productPattern = new RegExp(
            `(\\d+(?:\\.\\d+)?)\\s+(${units})\\s+(?:de\\s+)?([\\w\\s]+?)(?=\\s*\\d+\\s+(?:${units})|$)`,
            'gi'
        );

        const products: string[] = [];
        let match;

        while ((match = productPattern.exec(normalized)) !== null) {
            const quantity = match[1];
            const unit = match[2];
            const productName = match[3].trim();

            // Capitalizar primera letra del producto
            const capitalizedProduct = productName.charAt(0).toUpperCase() + productName.slice(1);

            products.push(`${quantity} ${unit} ${capitalizedProduct}`);
        }

        // Si no se detectaron productos con el patrón, intentar un enfoque más simple
        if (products.length === 0) {
            // Buscar solo números seguidos de texto
            const simplePattern = /(\d+(?:\.\d+)?)\s+([^\d]+?)(?=\s*\d+|$)/gi;
            let simpleMatch;

            while ((simpleMatch = simplePattern.exec(normalized)) !== null) {
                const quantity = simpleMatch[1];
                const rest = simpleMatch[2].trim();

                if (rest.length > 0) {
                    const capitalizedRest = rest.charAt(0).toUpperCase() + rest.slice(1);
                    products.push(`${quantity} ${capitalizedRest}`);
                }
            }
        }

        return products.length > 0 ? products : [normalized.charAt(0).toUpperCase() + normalized.slice(1)];
    }, [normalizeNumbers]);

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
            setTranscript('');

            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = false; // Solo resultados finales, no interim
            recognition.lang = 'es-MX';

            recognition.onstart = () => {
                console.log('Grabación iniciada');
            };

            recognition.onresult = (event: any) => {
                // Acumular todos los resultados finales
                let finalText = '';
                for (let i = 0; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalText += event.results[i][0].transcript + ' ';
                    }
                }

                // Guardar en referencia pero NO mostrar en tiempo real
                fullTranscriptRef.current = finalText.trim();
            };

            recognition.onerror = (event: any) => {
                console.error('Error de reconocimiento:', event.error);

                // Ignorar errores de "no-speech" durante la grabación
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setError(`Error: ${event.error}`);
                    setRecordingState('error');
                }
            };

            recognition.onend = () => {
                console.log('Reconocimiento finalizado');
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (err) {
            console.error('Error al iniciar grabación:', err);
            setError('No se pudo iniciar la grabación. Verifica los permisos del micrófono.');
            setRecordingState('error');
        }
    }, []);

    /**
     * Detiene la grabación y procesa el resultado final
     */
    const stopRecording = useCallback(() => {
        if (!recognitionRef.current || recordingState !== 'recording') {
            return;
        }

        setRecordingState('processing');

        // Detener reconocimiento
        try {
            recognitionRef.current.stop();
        } catch (e) {
            console.error('Error al detener reconocimiento:', e);
        }

        // Procesar resultado después de un breve delay para asegurar que se capturó todo
        setTimeout(() => {
            const rawText = fullTranscriptRef.current;

            if (!rawText || rawText.trim().length === 0) {
                setError('No se detectó ningún audio. Intenta de nuevo.');
                setRecordingState('error');
                recognitionRef.current = null;
                return;
            }

            // Detectar productos por patrón
            const products = detectProducts(rawText);

            // Unir con comas
            const finalText = products.join(', ');

            setTranscript(finalText);
            setRecordingState('completed');
            recognitionRef.current = null;

            console.log('Texto procesado:', finalText);
        }, 500); // Delay de 500ms para asegurar que se procesó todo

    }, [recordingState, detectProducts]);

    /**
     * Reinicia el estado del grabador
     */
    const resetRecording = useCallback(() => {
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
