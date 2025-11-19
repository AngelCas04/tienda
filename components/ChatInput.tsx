
import React, { useState, useEffect } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { MicIcon } from './icons/MicIcon';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setText('');
      startListening();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 md:gap-4 p-2 rounded-full bg-slate-800 border border-slate-700 shadow-inner"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isListening ? 'Escuchando...' : 'Escribe tu pedido aquí...'}
        className="flex-1 bg-transparent focus:outline-none px-4 py-2 placeholder-slate-500"
        disabled={isLoading || isListening}
      />
      {browserSupportsSpeechRecognition && (
         <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-900'
            } disabled:bg-slate-600 disabled:cursor-not-allowed`}
          >
           <MicIcon className="w-6 h-6" />
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 transition-colors duration-200"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;
