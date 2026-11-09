import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  acceptedFormats?: string;
  onImport: (file: File) => void;
}

export function ImportModal({ isOpen, onClose, title, acceptedFormats = '.csv,.xlsx,.json', onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setStatus('uploading');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onImport(file);
      setStatus('success');
      setMessage(`Successfully imported ${file.name}`);
      
      setTimeout(() => {
        setFile(null);
        setStatus('idle');
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus('idle');
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
            <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">Supported: {acceptedFormats}</p>
            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{pointerEvents: 'none'}}
            />
            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="block w-full h-full absolute inset-0 cursor-pointer" />
          </div>

          {file && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <CheckCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-medium text-blue-900">{file.name}</p>
                <p className="text-xs text-blue-700">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}

          {status === 'uploading' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
              <p className="text-sm text-amber-800">Uploading...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0"/>
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0"/>
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Upload size={18}/>
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
