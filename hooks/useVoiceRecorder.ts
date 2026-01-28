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

/**
 * Hook de grabación de voz usando react-speech-recognition
 * Funciona mejor en móviles que la implementación manual
 */
const useVoiceRecorder = (): VoiceRecorderHook => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [processedTranscript, setProcessedTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const lastTranscriptRef = useRef('');

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    // Mapa de números hablados a dígitos
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
        normalized = normalized.replace(/\s+(punto|coma)\s+/g, '.');

        Object.entries(numberMap).forEach(([word, digit]) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            normalized = normalized.replace(regex, digit);
        });

        return normalized;
    }, []);

    // Detectar productos del texto
    const detectProducts = useCallback((text: string): string[] => {
        let normalized = normalizeNumbers(text);
        normalized = normalized.replace(/\s+/g, ' ').trim();

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

        const patternWithUnit = new RegExp(
            `(\\d+(?:[.,]\\d+)?)\\s*(?:de\\s+)?(${units})\\s+(?:de\\s+)?([^\\d]+?)(?=\\s*\\d+|$)`,
            'gi'
        );

        let match;
        while ((match = patternWithUnit.exec(normalized)) !== null) {
            const quantity = match[1].replace(',', '.');
            const unit = match[2];
            const productName = match[3].trim();

            if (productName.length > 0) {
                const capitalizedProduct = productName.charAt(0).toUpperCase() + productName.slice(1);
                products.push(`${quantity} ${unit} ${capitalizedProduct}`);
            }
        }

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

        if (products.length === 0 && normalized.trim().length > 0) {
            return [normalized.charAt(0).toUpperCase() + normalized.slice(1)];
        }

        return products;
    }, [normalizeNumbers]);

    // Actualizar estado basado en el listening de la librería
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
            setError('Micrófono no disponible. Verifica los permisos.');
            setRecordingState('error');
            return;
        }

        try {
            setError(null);
            setProcessedTranscript('');
            lastTranscriptRef.current = '';
            resetTranscript();

            await SpeechRecognition.startListening({
                continuous: true,
                language: 'es-MX'
            });

            setRecordingState('recording');
        } catch (err) {
            console.error('Error al iniciar:', err);
            setError('No se pudo iniciar. Verifica permisos del micrófono.');
            setRecordingState('error');
        }
    }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript]);

    // Detener grabación
    const stopRecording = useCallback(() => {
        if (!listening) return;

        setRecordingState('processing');
        SpeechRecognition.stopListening();

        // Pequeño delay para asegurar que se capturó todo
        setTimeout(() => {
            const rawText = transcript;
            console.log('Texto capturado:', rawText);

            if (!rawText || rawText.trim().length === 0) {
                setError('No se detectó audio. Intenta de nuevo.');
                setRecordingState('error');
                return;
            }

            const products = detectProducts(rawText);
            const finalText = products.join(', ');

            setProcessedTranscript(finalText);
            setRecordingState('completed');
            console.log('Procesado:', finalText);
        }, 300);

    }, [listening, transcript, detectProducts]);

    // Resetear
    const resetRecording = useCallback(() => {
        SpeechRecognition.stopListening();
        resetTranscript();
        setRecordingState('idle');
        setProcessedTranscript('');
        setError(null);
        lastTranscriptRef.current = '';
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
