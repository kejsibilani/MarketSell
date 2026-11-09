import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * StandardPageLayout - Consistent page wrapper for all pages
 * Provides unified spacing, max-width, and background
 */
export function StandardPageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {children}
      </div>
    </div>
  );
}

/**
 * PageSection - Reusable section wrapper with consistent spacing
 */
export function PageSection({
  children,
  className = '',
  bgColor = 'bg-white',
  py = 'py-20',
  borderTop = false,
}: {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  py?: string;
  borderTop?: boolean;
}) {
  return (
    <div className={`${bgColor} ${py} ${borderTop ? 'border-t border-gray-100' : ''}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}

/**
 * SectionHeader - Standardized section heading with label
 */
export function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-16">
      <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
        {label}
      </p>
      <h2 className="text-5xl font-bold text-gray-900 mb-6">{title}</h2>
      {description && (
        <p className="text-xl text-gray-600 max-w-2xl">{description}</p>
      )}
    </div>
  );
}

/**
 * Card - Reusable card component
 */
export function Card({
  children,
  className = '',
  hoverable = false,
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`p-8 border border-gray-200 rounded-2xl ${
        hoverable ? 'hover:border-gray-300 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
