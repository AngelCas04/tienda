
import React from 'react';
import { Message } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatMessageProps {
  message: Message;
}

const formatCurrency = (amount: number) => {
  if (typeof amount !== 'number') {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
}

const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 p-2">
    <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
  </div>
);

const InvoiceView: React.FC<{
  invoice: NonNullable<Message['invoice']>;
}> = ({ invoice }) => {
  return (
    <div className="bg-dark-surface/50 rounded-xl text-slate-200 w-full max-w-md overflow-hidden border border-dark-border shadow-lg">
      <h3 className="text-lg font-semibold p-4 border-b border-dark-border text-primary-400 flex justify-between items-center bg-dark-surface/50">
        <span>Factura de Pedido</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-dark-surface/80">
            <tr>
              <th className="px-4 py-2 font-medium text-slate-400">Cant.</th>
              <th className="px-4 py-2 font-medium text-slate-400">Producto</th>
              <th className="px-4 py-2 font-medium text-right text-slate-400">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {invoice.items.map((item, index) => (
              <tr key={index} className="hover:bg-dark-surface/30 transition-colors">
                <td className="px-4 py-3 w-16 text-slate-300">{item.quantity}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {item.product}
                  <div className="text-xs text-slate-500">{formatCurrency(item.unit_price)} c/u</div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-primary-300 w-24">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-dark-surface/80 space-y-3 border-t border-dark-border">
        <div className="flex justify-between items-center text-lg">
          <span className="font-bold text-slate-300">TOTAL:</span>
          <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">{formatCurrency(invoice.grand_total)}</span>
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const renderContent = () => {
    if (message.isLoading) {
      return <LoadingIndicator />;
    }
    if (message.invoice) {
      return <InvoiceView invoice={message.invoice} />;
    }
    if (message.text) {
      return <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>;
    }
    return null;
  };

  const messageBubbleStyles = isUser
    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-none'
    : 'bg-dark-surface border border-dark-border text-slate-200 rounded-bl-none';

  const contentPadding = message.invoice ? 'p-0' : 'p-4';

  return (
    <div className={`flex items-end gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-900/20">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`rounded-2xl ${messageBubbleStyles} ${contentPadding} max-w-lg shadow-md transition-all hover:shadow-lg`}
        role="log"
        aria-live={isUser ? 'off' : 'polite'}
      >
        {renderContent()}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shadow-lg">
          <UserIcon className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
