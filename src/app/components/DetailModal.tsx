import { X, Copy, Download, Printer } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  actions?: Array<{ label: string; icon?: any; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' }>;
}

export function DetailModal({ isOpen, onClose, title, data, actions = [] }: DetailModalProps) {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{key}</p>
                <div className="flex items-center justify-between group">
                  <p className="text-gray-900 font-medium break-words flex-1">{String(value)}</p>
                  <button
                    onClick={() => handleCopy(String(value))}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 transition-opacity"
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {actions.length > 0 && (
            <div className="flex gap-3 border-t border-gray-200 pt-4">
              {actions.map((action, idx) => {
                const variants = {
                  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
                  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
                  danger: 'bg-red-600 hover:bg-red-700 text-white',
                };
                return (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${variants[action.variant || 'primary']}`}
                  >
                    {action.icon && <action.icon size={16} />}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
