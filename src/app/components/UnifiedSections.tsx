/**
 * UNIFIED SECTION COMPONENT
 * Reusable section wrapper for displaying related data groups
 * Used in order expansions, detail modals, etc.
 */

import React from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface UnifiedSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  expandable?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  children: React.ReactNode;
}

export function UnifiedSection({
  title,
  subtitle,
  icon,
  action,
  expandable = false,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  children,
}: UnifiedSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  if (expandable && !isExpanded) {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-gray-600">{icon}</div>}
            <div className="text-left">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
          <ChevronDown size={20} className="text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between ${
          expandable ? 'cursor-pointer hover:bg-gray-50' : ''
        } transition-colors ${headerClassName}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-600">{icon}</div>}
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              {action.label}
            </button>
          )}
          {expandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && <div className="px-6 py-4 bg-gray-50">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED DETAIL GRID
// ─────────────────────────────────────────────────────────────────────────────
// Displays key-value pairs in a consistent grid layout
// Used for order info, shipment details, etc.

interface DetailItem {
  label: string;
  value: React.ReactNode;
  span?: 1 | 2; // Grid column span
  tooltip?: string;
}

interface UnifiedDetailGridProps {
  items: DetailItem[];
  columns?: number;
  className?: string;
}

export function UnifiedDetailGrid({
  items,
  columns = 2,
  className = '',
}: UnifiedDetailGridProps) {
  return (
    <div
      className={`grid gap-6 ${
        columns === 1 ? 'grid-cols-1' : columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
      } ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className={columns === 1 ? '' : item.span === 2 ? 'md:col-span-2' : ''}>
          <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
            {item.label}
            {item.tooltip && (
              <span className="ml-1 text-gray-400" title={item.tooltip}>
                ℹ️
              </span>
            )}
          </label>
          <div className="text-sm font-medium text-gray-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED INFO BOX
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedInfoBoxProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  error: 'bg-red-50 border-red-200 text-red-900',
};

export function UnifiedInfoBox({
  variant = 'info',
  title,
  children,
  className = '',
}: UnifiedInfoBoxProps) {
  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]} ${className}`}>
      {title && <p className="font-medium mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED EXPANDABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedExpandableRowProps {
  content: React.ReactNode;
  colSpan: number;
  className?: string;
}

export function UnifiedExpandableRow({
  content,
  colSpan,
  className = '',
}: UnifiedExpandableRowProps) {
  return (
    <tr className="bg-blue-50 hover:bg-blue-50">
      <td colSpan={colSpan} className={`px-6 py-4 border-t border-blue-200 ${className}`}>
        <div className="space-y-4">{content}</div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED LOADING STATE
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedLoadingProps {
  message?: string;
  className?: string;
}

export function UnifiedLoading({
  message = 'Loading...',
  className = '',
}: UnifiedLoadingProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin mb-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full" />
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function UnifiedEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: UnifiedEmptyStateProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        {icon && <div className="mb-3 text-gray-400">{icon}</div>}
        <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED STATS CARD
// ─────────────────────────────────────────────────────────────────────────────

interface UnifiedStatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function UnifiedStatsCard({
  label,
  value,
  subtext,
  icon,
  color = 'blue',
  trend,
  className = '',
}: UnifiedStatsCardProps) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
        </div>
        {icon && <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 text-xs">
          <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </span>
          <span className="text-gray-600 ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}
