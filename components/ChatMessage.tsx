
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
        <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
    </div>
);

const InvoiceView: React.FC<{ 
    invoice: NonNullable<Message['invoice']>; 
}> = ({ invoice }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg text-slate-200 w-full max-w-md overflow-hidden border border-slate-700/50">
            <h3 className="text-lg font-semibold p-3 border-b border-slate-700 text-cyan-400 flex justify-between items-center">
                <span>Factura de Pedido</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-2 font-medium">Cant.</th>
                            <th className="px-4 py-2 font-medium">Producto</th>
                            <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/30">
                                <td className="px-4 py-2 w-16">{item.quantity}</td>
                                <td className="px-4 py-2 font-medium">
                                    {item.product}
                                    <div className="text-xs text-slate-500">{formatCurrency(item.unit_price)} c/u</div>
                                </td>
                                <td className="px-4 py-2 text-right font-semibold w-24">{formatCurrency(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-lg border-t border-slate-700 pt-2">
                    <span className="font-bold text-cyan-400">TOTAL:</span>
                    <span className="font-bold text-cyan-400">{formatCurrency(invoice.grand_total)}</span>
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
      return <p className="whitespace-pre-wrap">{message.text}</p>;
    }
    return null;
  };

  const messageBubbleStyles = isUser
    ? 'bg-cyan-600'
    : 'bg-slate-800';
  
  const contentPadding = message.invoice ? 'p-0' : 'p-3';

  return (
    <div className={`flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
            <SparklesIcon className="w-5 h-5 text-slate-900" />
        </div>
      )}

      <div
        className={`rounded-lg ${messageBubbleStyles} ${contentPadding} max-w-lg shadow-md`}
        role="log"
        aria-live={isUser ? 'off' : 'polite'}
      >
        {renderContent()}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shadow-lg">
            <UserIcon className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
