import React from 'react';
import { colors } from '../styles/designSystem';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerBg?: 'white' | 'gray' | 'primary';
  className?: string;
}

/**
 * Universal Page Wrapper Component
 * Applies consistent styling across all pages in the application
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  subtitle,
  headerBg = 'white',
  className = '',
}) => {
  const bgColorClass = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    primary: 'text-white',
  }[headerBg];

  const primaryBg = headerBg === 'primary' ? colors.primary : undefined;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      {(title || subtitle) && (
        <div
          className={`border-b border-gray-100 ${bgColorClass}`}
          style={primaryBg ? { backgroundColor: primaryBg } : undefined}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {title && (
              <h1 className="text-4xl font-bold mb-2" style={{ color: headerBg === 'primary' ? 'white' : colors.primary }}>
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg" style={{ color: headerBg === 'primary' ? 'rgba(255,255,255,0.8)' : colors.gray600 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
