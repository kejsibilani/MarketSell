/**
 * UNIFIED STATUS & STATUS INDICATOR COMPONENTS
 * Used across all pages for consistent status display
 */

import React from 'react';
import { 
  Clock, CheckCircle, AlertCircle, XCircle, 
  Truck, Package, RefreshCw, LucideIcon 
} from 'lucide-react';
import type { 
  OrderStatus, ShipmentStatus, TransformationStatus, TransformationType 
} from '../types/unified';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE - Text-based status indicator
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: OrderStatus | ShipmentStatus | TransformationStatus | string;
  variant?: 'badge' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColorMap = {
  // Order statuses
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  partial: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  fulfilled: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  
  // Shipment statuses
  'in-transit': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  returning: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  
  // Transformation statuses
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  
  // Default
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

export function StatusBadge({ 
  status, 
  variant = 'badge', 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const colors = statusColorMap[status as keyof typeof statusColorMap] || statusColorMap.pending;
  
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 rounded-full text-sm',
    lg: 'px-4 py-2 text-base rounded-lg',
  }[size];

  const variantClass = variant === 'pill' 
    ? `${sizeClass} rounded-full font-semibold ${colors.bg} ${colors.text}`
    : `${sizeClass} rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`;

  return (
    <span className={`inline-block font-medium ${variantClass} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS ICON - Icon-based status indicator (for table columns, etc.)
// ─────────────────────────────────────────────────────────────────────────────

interface StatusIconProps {
  status: OrderStatus | ShipmentStatus | TransformationStatus | string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

const statusIconMap: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  // Order statuses
  pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
  partial: { icon: Package, color: 'text-blue-600', label: 'Partial' },
  fulfilled: { icon: CheckCircle, color: 'text-green-600', label: 'Fulfilled' },
  
  // Shipment statuses
  'in-transit': { icon: Truck, color: 'text-blue-600', label: 'In Transit' },
  delivered: { icon: CheckCircle, color: 'text-green-600', label: 'Delivered' },
  returning: { icon: RefreshCw, color: 'text-orange-600', label: 'Returning' },
  
  // Transformation statuses
  in_progress: { icon: RefreshCw, color: 'text-purple-600', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600', label: 'Failed' },
  
  // Default
  cancelled: { icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
};

export function StatusIcon({ 
  status, 
  size = 20,
  className = '',
  showLabel = false 
}: StatusIconProps) {
  const config = statusIconMap[status] || statusIconMap.pending;
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Icon size={size} className={config.color} />
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
      </div>
    );
  }

  return (
    <div title={config.label}>
      <Icon 
        size={size} 
        className={`${config.color} ${className}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFORMATION TYPE BADGE
// ─────────────────────────────────────────────────────────────────────────────

interface TransformationTypeBadgeProps {
  type: TransformationType;
  className?: string;
}

const transformationTypeMap: Record<TransformationType, { label: string; color: string; icon: string }> = {
  roasting: { label: '🔥 Roasting', color: 'bg-orange-100 text-orange-800', icon: '🔥' },
  packaging: { label: '📦 Repackaging', color: 'bg-blue-100 text-blue-800', icon: '📦' },
  sampling: { label: '🧪 Sampling', color: 'bg-purple-100 text-purple-800', icon: '🧪' },
  quality_check: { label: '✓ Quality Check', color: 'bg-green-100 text-green-800', icon: '✓' },
  rebranding: { label: '🏷️ Rebranding', color: 'bg-pink-100 text-pink-800', icon: '🏷️' },
};

export function TransformationTypeBadge({ 
  type, 
  className = '' 
}: TransformationTypeBadgeProps) {
  const config = transformationTypeMap[type];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color} ${className}`}>
      {config.icon} {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS INDICATOR - Shows order fulfillment progress
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressIndicator({
  completed,
  total,
  label,
  showPercentage = true,
  className = ''
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-500' :
            percentage >= 75 ? 'bg-blue-500' :
            percentage >= 50 ? 'bg-yellow-500' :
            'bg-orange-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-600 mt-1">
          {completed} of {total} ({percentage}%)
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-STATUS DISPLAY - Shows multiple related statuses
// ─────────────────────────────────────────────────────────────────────────────

interface MultiStatusDisplayProps {
  inProgress: number;
  delivered: number;
  returning?: number;
  cancelled?: number;
  className?: string;
}

export function MultiStatusDisplay({
  inProgress,
  delivered,
  returning = 0,
  cancelled = 0,
  className = ''
}: MultiStatusDisplayProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {inProgress > 0 && (
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-blue-600" />
          <span className="text-sm text-gray-700">{inProgress} in progress</span>
        </div>
      )}
      {delivered > 0 && (
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-sm text-gray-700">{delivered} delivered</span>
        </div>
      )}
      {returning > 0 && (
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-orange-600" />
          <span className="text-sm text-gray-700">{returning} returning</span>
        </div>
      )}
      {cancelled > 0 && (
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-red-600" />
          <span className="text-sm text-gray-700">{cancelled} cancelled</span>
        </div>
      )}
    </div>
  );
}
