import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') return '$0.00';
  return `$${amount.toFixed(2)}`;
};

// Loading animation
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="flex gap-1">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
    </div>
    <span className="text-sm text-slate-400">Procesando...</span>
  </div>
);

// Invoice component
const InvoiceView: React.FC<{ invoice: NonNullable<Message['invoice']> }> = ({ invoice }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/40 shadow-xl w-full max-w-md">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Factura de Pedido</h3>
            <p className="text-xs text-slate-400">{invoice.items.length} {invoice.items.length === 1 ? 'producto' : 'productos'}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-700/30">
        {invoice.items.map((item, index) => (
          <div
            key={index}
            className="px-5 py-3 flex justify-between items-start hover:bg-slate-700/20 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1">
              <p className="font-medium text-slate-100">{item.product}</p>
              <p className="text-sm text-slate-500">
                {item.quantity} × {formatCurrency(item.unit_price)}
              </p>
            </div>
            <span className="font-mono font-semibold text-emerald-400">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-5 py-4 bg-slate-800/80 border-t border-slate-700/30">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium uppercase text-sm tracking-wider">Total</span>
          <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {formatCurrency(invoice.grand_total)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const renderContent = () => {
    if (message.isLoading) return <LoadingIndicator />;
    if (message.invoice) return <InvoiceView invoice={message.invoice} />;
    if (message.text) {
      return (
        <p className="whitespace-pre-wrap leading-relaxed px-4 py-3">
          {message.text}
        </p>
      );
    }
    return null;
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-lg rounded-2xl shadow-lg transition-all ${isUser
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-md'
            : 'bg-slate-800/70 backdrop-blur-sm border border-slate-700/40 text-slate-100 rounded-bl-md'
          } ${message.invoice ? 'p-0 overflow-hidden' : ''}`}
      >
        {renderContent()}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
