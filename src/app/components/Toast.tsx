import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

function Toast({ message, onRemove }: { message: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    if (message.duration) {
      const timer = setTimeout(onRemove, message.duration);
      return () => clearTimeout(timer);
    }
  }, [message, onRemove]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <Check size={18} className="text-green-600" />,
    error: <AlertCircle size={18} className="text-red-600" />,
    warning: <AlertCircle size={18} className="text-amber-600" />,
    info: <Info size={18} className="text-blue-600" />,
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles[message.type]} mb-2 shadow-md animate-slideIn`}>
      {icons[message.type]}
      <p className="flex-1 text-sm font-medium">{message.message}</p>
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {messages.map(msg => (
        <Toast key={msg.id} message={msg} onRemove={() => onRemove(msg.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const newMessage: ToastMessage = { id, message, type, duration };
    setMessages(prev => [...prev, newMessage]);
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return { messages, addToast, removeToast };
}
