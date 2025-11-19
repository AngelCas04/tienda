declare module '*.css';

declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    transcribing?: boolean;
    clearTranscriptOnListen?: boolean;
    commands?: ReadonlyArray<any>;
    continuous?: boolean;
    language?: string;
  }

  export interface UseSpeechRecognitionResult {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  export function useSpeechRecognition(options?: SpeechRecognitionOptions): UseSpeechRecognitionResult;

  export interface SpeechRecognition {
    getRecognition(): any;
    startListening(options?: SpeechRecognitionOptions): Promise<void>;
    stopListening(): Promise<void>;
    abortListening(): Promise<void>;
    browserSupportsSpeechRecognition(): boolean;
    applyPolyfill(speechRecognitionPolyfill: any): void;
  }

  const SpeechRecognition: SpeechRecognition;
  export default SpeechRecognition;
}
