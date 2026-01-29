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

const END_TOKEN = '__END__';

// Mapa COMPLETO de números hablados - incluyendo variaciones
const NUMBER_MAP: { [key: string]: string } = {
    // Básicos
    'cero': '0', 'zero': '0',
    'un': '1', 'uno': '1', 'una': '1', 'primero': '1',
    'dos': '2', 'segundo': '2',
    'tres': '3', 'tercero': '3',
    'cuatro': '4', 'quatro': '4',
    'cinco': '5', 'sinco': '5',
    'seis': '6', 'seys': '6',
    'siete': '7', 'ciete': '7',
    'ocho': '8', 'hocho': '8',
    'nueve': '9', 'nuebe': '9',
    'diez': '10', 'dies': '10',
    // 11-19
    'once': '11', 'onse': '11',
    'doce': '12', 'dose': '12',
    'trece': '13', 'trese': '13',
    'catorce': '14', 'catorse': '14',
    'quince': '15', 'kinse': '15',
    'dieciséis': '16', 'dieciseis': '16',
    'diecisiete': '17',
    'dieciocho': '18',
    'diecinueve': '19',
    // Decenas
    'veinte': '20', 'vente': '20',
    'veintiuno': '21', 'ventiuno': '21',
    'veintidós': '22', 'veintidos': '22',
    'veintitrés': '23', 'veintitres': '23',
    'veinticuatro': '24',
    'veinticinco': '25',
    'treinta': '30', 'trenta': '30',
    'cuarenta': '40', 'quarenta': '40',
    'cincuenta': '50', 'sincuenta': '50',
    'sesenta': '60',
    'setenta': '70',
    'ochenta': '80',
    'noventa': '90',
    'cien': '100', 'sien': '100',
    'ciento': '100',
    'mil': '1000',
    // Fracciones
    'medio': '0.5', 'media': '0.5',
    'cuarto': '0.25'
};

// Correcciones ortográficas expandidas
const CORRECTIONS: { [key: string]: string } = {
    'aroz': 'arroz', 'aros': 'arroz', 'arros': 'arroz', 'arrós': 'arroz',
    'frigol': 'frijol', 'frigoles': 'frijoles', 'friiol': 'frijol', 'fríjol': 'frijol',
    'asucar': 'azucar', 'aszucar': 'azucar', 'azuca': 'azucar', 'asúcar': 'azucar',
    'azeite': 'aceite', 'aseite': 'aceite', 'acite': 'aceite', 'azeyte': 'aceite',
    'polllo': 'pollo', 'poyo': 'pollo', 'poio': 'pollo',
    'huebo': 'huevo', 'guevo': 'huevo', 'guevos': 'huevos', 'webos': 'huevos',
    'cevolla': 'cebolla', 'sebolla': 'cebolla', 'sevolla': 'cebolla',
    'sops': 'sopas', 'sop': 'sopa',
    'margarinas': 'margarina', // Normalizar plural
    'aceites': 'aceite',
    'arroces': 'arroz',
};

/**
 * Hook de grabación de voz con FLUSH FINAL garantizado
 */
const useVoiceRecorder = (): VoiceRecorderHook => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [processedTranscript, setProcessedTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const transcriptRef = useRef('');

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    /**
     * Convertir palabras numéricas a dígitos
     */
    const normalizeNumbers = useCallback((text: string): string => {
        let normalized = text.toLowerCase();

        // Convertir "punto" y "coma" a decimales
        normalized = normalized.replace(/\s+(punto|coma)\s+/g, '.');

        // Ordenar por longitud (más largo primero) para evitar reemplazos parciales
        const sortedEntries = Object.entries(NUMBER_MAP).sort((a, b) => b[0].length - a[0].length);

        for (const [word, digit] of sortedEntries) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            normalized = normalized.replace(regex, digit);
        }

        return normalized;
    }, []);

    /**
     * Corregir ortografía
     */
    const correct = useCallback((word: string): string => {
        const lower = word.toLowerCase();
        return CORRECTIONS[lower] || word;
    }, []);

    /**
     * Detectar si es número (dígito o palabra numérica)
     */
    const isNumber = useCallback((token: string): boolean => {
        const lower = token.toLowerCase();
        return /^\d+([.,]\d+)?$/.test(token) || NUMBER_MAP.hasOwnProperty(lower);
    }, []);

    /**
     * Parsear número
     */
    const parseNum = useCallback((token: string): string => {
        const lower = token.toLowerCase();
        if (/^\d+([.,]\d+)?$/.test(token)) {
            return token.replace(',', '.');
        }
        return NUMBER_MAP[lower] || token;
    }, []);

    /**
     * FORMATEAR con detección inteligente
     */
    const formatTranscript = useCallback((text: string, forceFlush: boolean = false): string => {
        let normalized = text.replace(/\s+/g, ' ').trim();
        if (!normalized) return '';

        // Agregar END_TOKEN para flush final
        if (forceFlush) {
            normalized += ` ${END_TOKEN}`;
        }

        console.log('📝 Input normalizado:', normalized);

        const tokens = normalized.split(' ');
        const products: string[] = [];
        let currentProduct: string[] = [];
        let hasQuantity = false;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const prevToken = i > 0 ? tokens[i - 1].toLowerCase() : '';

            if (token === END_TOKEN) {
                if (currentProduct.length > 0) {
                    products.push(currentProduct.join(' '));
                    currentProduct = []; // ← FIX: Limpiar para evitar duplicación
                }
                continue;
            }

            const tokenIsNumber = isNumber(token);

            // CASO ESPECIAL: Si la palabra anterior es "de", "numero", "#"
            // entonces el número es PARTE del nombre del producto
            // Ejemplo: "bolsas de 2 libras" → "bolsas de 2 libras" (no separar)
            const prevIsConnector = ['de', '#', 'numero', 'número', 'no', 'no.'].includes(prevToken);
            const isPartOfProductName = tokenIsNumber && prevIsConnector && currentProduct.length > 0;

            if (tokenIsNumber && !isPartOfProductName) {
                // Es una NUEVA cantidad - guardar producto anterior
                if (currentProduct.length > 0) {
                    products.push(currentProduct.join(' '));
                    currentProduct = [];
                }
                // Convertir y agregar número
                currentProduct.push(parseNum(token));
                hasQuantity = true;
            } else if (tokenIsNumber && isPartOfProductName) {
                // Número es parte del nombre (ej: "bolsas de 2 libras")
                currentProduct.push(token);
            } else {
                // Es texto - corregir ortografía
                const corrected = correct(token);
                const skipWords = ['de', 'el', 'la', 'los', 'las', 'y', 'con', 'a'];

                // Si no tenemos cantidad y es el primer producto, asumimos 1
                if (!hasQuantity && currentProduct.length === 0 && !skipWords.includes(corrected.toLowerCase())) {
                    currentProduct.push('1');
                    hasQuantity = true;
                }

                if (currentProduct.length > 0 || !skipWords.includes(corrected.toLowerCase())) {
                    currentProduct.push(corrected);
                }
            }
        }

        // FLUSH FINAL - nunca descartar último producto
        if (currentProduct.length > 0) {
            products.push(currentProduct.join(' '));
        }

        const result = products.join(', ');
        console.log('✅ Resultado:', result);
        return result;
    }, [isNumber, parseNum, correct]);

    // Sincronizar estado
    useEffect(() => {
        if (listening && recordingState !== 'recording') {
            setRecordingState('recording');
        }
    }, [listening, recordingState]);

    const startRecording = useCallback(async () => {
        if (!browserSupportsSpeechRecognition) {
            setError('Navegador no soporta voz');
            setRecordingState('error');
            return;
        }

        if (!isMicrophoneAvailable) {
            setError('Permite acceso al micrófono');
            setRecordingState('error');
            return;
        }

        try {
            setError(null);
            setProcessedTranscript('');
            transcriptRef.current = '';
            resetTranscript();

            await SpeechRecognition.startListening({
                continuous: true,
                language: 'es-MX'
            });

            setRecordingState('recording');
        } catch (err) {
            console.error('Error al iniciar:', err);
            setError('Error al iniciar');
            setRecordingState('error');
        }
    }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript]);

    const stopRecording = useCallback(() => {
        if (!listening) return;

        setRecordingState('processing');
        SpeechRecognition.stopListening();

        setTimeout(() => {
            const rawText = transcriptRef.current || transcript;
            console.log('🎤 RAW del speech API:', rawText);

            if (!rawText || rawText.trim().length === 0) {
                setError('No se detectó audio');
                setRecordingState('error');
                return;
            }

            // Primero normalizar números hablados
            const withNumbers = normalizeNumbers(rawText);
            console.log('🔢 Con números convertidos:', withNumbers);

            // Luego formatear con flush
            const formatted = formatTranscript(withNumbers, true);

            setProcessedTranscript(formatted);
            setRecordingState('completed');
        }, 700);

    }, [listening, transcript, normalizeNumbers, formatTranscript]);

    const resetRecording = useCallback(() => {
        SpeechRecognition.stopListening();
        resetTranscript();
        setRecordingState('idle');
        setProcessedTranscript('');
        setError(null);
        transcriptRef.current = '';
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
