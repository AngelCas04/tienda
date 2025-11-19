
import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These types are not part of the standard DOM library.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (this: SpeechRecognition, ev: Event) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

// Ensure compatibility with vendor-prefixed versions of SpeechRecognition
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const browserSupportsSpeechRecognition = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    // Enable continuous mode to prevent mic from stopping after one sentence
    recognition.continuous = true; 
    recognition.interimResults = true;
    // Usamos español de México para mejor compatibilidad en Android Latam
    recognition.lang = 'es-MX'; 

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalString = '';
      let interimString = '';

      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript; // No hacemos trim aquí para preservar espacios naturales
        
        if (result.isFinal) {
          finalString += text;
        } else {
          interimString += text;
        }
      }

      // Limpieza básica de espacios
      finalString = finalString.trim();
      interimString = interimString.trim();

      // CORRECCIÓN ANDROID: Si el texto intermedio empieza con el texto final (eco), lo recortamos
      if (finalString.length > 0 && interimString.toLowerCase().startsWith(finalString.toLowerCase())) {
        interimString = interimString.substring(finalString.length).trim();
      }

      // Unir y limpiar espacios múltiples
      let fullText = (finalString + ' ' + interimString).replace(/\s+/g, ' ').trim();
      
      // CORRECCIÓN DE REPETICIONES ("una una una"):
      // Busca cualquier palabra seguida de sí misma una o más veces y la reemplaza por una sola instancia
      // \b = límite de palabra, (\w+) = palabra capturada, ( \1\b)+ = espacio + la misma palabra repetida 1 o mas veces
      fullText = fullText.replace(/\b(\w+)( \1\b)+/gi, '$1');

      // Capitalize first letter for better readability
      if (fullText.length > 0) {
        fullText = fullText.charAt(0).toUpperCase() + fullText.slice(1);
      }

      setTranscript(fullText);
    };
    
    recognitionRef.current = recognition;

    // Cleanup function to stop recognition if component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [browserSupportsSpeechRecognition]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript(''); // Clear previous transcript
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechRecognition;
