import React from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  headerColor?: string;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

/**
 * Reusable Base Modal Component
 * Provides consistent styling and structure for all modals
 */
export function BaseModal({
  isOpen,
  onClose,
  title,
  headerColor = 'bg-blue-50 border-blue-200',
  children,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[90vh]'
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg w-full shadow-xl overflow-hidden flex flex-col ${maxWidth} ${maxHeight}`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${headerColor}`}
        >
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
