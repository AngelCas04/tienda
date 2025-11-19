
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
    // Usamos español de latinoamérica para mejor detección de términos locales y moneda
    recognition.lang = 'es-419'; 

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
      let finalParts: string[] = [];
      let interimParts: string[] = [];

      // Reconstruct the full transcript from all results in the current session
      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        
        if (!text) continue; // Skip empty results/noise

        if (result.isFinal) {
          finalParts.push(text);
        } else {
          interimParts.push(text);
        }
      }
      
      // Join parts ensuring single spaces
      const finalText = finalParts.join(' ');
      const interimText = interimParts.join(' ');
      
      // Combine and clean extra whitespace
      let fullText = (finalText + ' ' + interimText).replace(/\s+/g, ' ').trim();
      
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
