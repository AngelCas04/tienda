import { useEffect, useCallback, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

interface VoiceRecorderHook {
    recordingState: RecordingState;
    transcript: string;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    resetRecording: () => void;
    error: string | null;
}

// Mapa de números hablados a dígitos
const NUMBER_MAP: { [key: string]: string } = {
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

/**
 * Hook de grabación de voz usando react-speech-recognition
 * 
 * REGLAS PARA AUDIO CONTINUO:
 * - No espera silencios para separar productos
 * - Cada número indica un nuevo producto
 * - Procesa la frase completa aunque sea larga
 * - No limita la cantidad de productos
 */
const useVoiceRecorder = (): VoiceRecorderHook => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [processedTranscript, setProcessedTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    /**
     * Convertir palabras numéricas a dígitos
     * "dos arroz tres frijol" -> "2 arroz 3 frijol"
     */
    const normalizeNumbers = useCallback((text: string): string => {
        let normalized = text.toLowerCase();

        // Convertir "punto" y "coma" a decimales
        normalized = normalized.replace(/\s+(punto|coma)\s+/g, '.');

        // Reemplazar palabras numéricas con dígitos
        Object.entries(NUMBER_MAP).forEach(([word, digit]) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            normalized = normalized.replace(regex, digit);
        });

        return normalized;
    }, []);

    /**
     * Formatear el texto detectado insertando comas entre productos
     * LÓGICA CLAVE:
     * [NÚMERO] → abre producto
     * [TEXTO] → nombre del producto  
     * [NÚMERO] → cierra producto anterior + coma → abre nuevo
     */
    const formatTranscript = useCallback((text: string): string => {
        // Primero normalizar números hablados a dígitos
        let normalized = normalizeNumbers(text);
        normalized = normalized.replace(/\s+/g, ' ').trim();

        if (!normalized) return '';

        // Tokenizar
        const tokens = normalized.split(' ');
        const products: string[] = [];
        let currentProduct: string[] = [];

        for (const token of tokens) {
            const isNumber = /^\d+([.,]\d+)?$/.test(token);

            if (isNumber) {
                // Si ya hay un producto acumulado, guardarlo
                if (currentProduct.length > 0) {
                    products.push(currentProduct.join(' '));
                    currentProduct = [];
                }
                // Empezar nuevo producto con este número
                currentProduct.push(token);
            } else {
                // Es texto, agregarlo al producto actual
                // Filtrar conectores sueltos al inicio
                const skipWords = ['de', 'el', 'la', 'los', 'las', 'y', 'con'];
                if (currentProduct.length > 0 || !skipWords.includes(token)) {
                    currentProduct.push(token);
                }
            }
        }

        // Agregar último producto
        if (currentProduct.length > 0) {
            products.push(currentProduct.join(' '));
        }

        // Unir con comas
        return products.join(', ');
    }, [normalizeNumbers]);

    // Sincronizar estado con la librería
    useEffect(() => {
        if (listening && recordingState !== 'recording') {
            setRecordingState('recording');
        }
    }, [listening, recordingState]);

    // Iniciar grabación
    const startRecording = useCallback(async () => {
        if (!browserSupportsSpeechRecognition) {
            setError('Tu navegador no soporta reconocimiento de voz');
            setRecordingState('error');
            return;
        }

        if (!isMicrophoneAvailable) {
            setError('Micrófono no disponible. Permite el acceso.');
            setRecordingState('error');
            return;
        }

        try {
            setError(null);
            setProcessedTranscript('');
            resetTranscript();

            await SpeechRecognition.startListening({
                continuous: true,
                language: 'es-MX'
            });

            setRecordingState('recording');
        } catch (err) {
            console.error('Error al iniciar:', err);
            setError('Error al iniciar. Verifica permisos.');
            setRecordingState('error');
        }
    }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript]);

    // Detener grabación y procesar
    const stopRecording = useCallback(() => {
        if (!listening) return;

        setRecordingState('processing');
        SpeechRecognition.stopListening();

        // Delay para capturar últimos fragmentos
        setTimeout(() => {
            const rawText = transcript;
            console.log('Audio capturado:', rawText);

            if (!rawText || rawText.trim().length === 0) {
                setError('No se detectó audio. Habla más fuerte.');
                setRecordingState('error');
                return;
            }

            // Formatear con comas automáticas
            const formatted = formatTranscript(rawText);
            console.log('Formateado:', formatted);

            setProcessedTranscript(formatted);
            setRecordingState('completed');
        }, 400);

    }, [listening, transcript, formatTranscript]);

    // Resetear
    const resetRecording = useCallback(() => {
        SpeechRecognition.stopListening();
        resetTranscript();
        setRecordingState('idle');
        setProcessedTranscript('');
        setError(null);
    }, [resetTranscript]);

    return {
        recordingState,
        transcript: processedTranscript,
        startRecording,
        stopRecording,
        resetRecording,
        error
    };
};

export default useVoiceRecorder;
