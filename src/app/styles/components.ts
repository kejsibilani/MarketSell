// Unified styling constants for consistent UI across all pages

export const TABLE_STYLES = {
  // Table container
  container: 'bg-white rounded-lg border border-gray-200 overflow-hidden',
  
  // Table header
  headerRow: 'bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider',
  headerCell: 'px-6 py-3 text-left',
  
  // Table body
  bodyRow: 'hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0',
  bodyCell: 'px-6 py-4 text-sm text-gray-900',
  
  // Row states
  expandedRow: 'bg-gray-50',
  selectedRow: 'bg-blue-50',
};

export const STATUS_COLORS = {
  // Order & shipment statuses
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border border-blue-200',
  in_transit: 'bg-blue-100 text-blue-800 border border-blue-200',
  completed: 'bg-green-100 text-green-800 border border-green-200',
  delivered: 'bg-green-100 text-green-800 border border-green-200',
  fulfilled: 'bg-green-100 text-green-800 border border-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
  
  // Stock statuses
  healthy: 'bg-green-100 text-green-800 border border-green-200',
  low: 'bg-orange-100 text-orange-800 border border-orange-200',
  critical: 'bg-red-100 text-red-800 border border-red-200',
  out: 'bg-red-100 text-red-800 border border-red-200',
  
  // Transformation statuses
  draft: 'bg-gray-100 text-gray-800 border border-gray-200',
  approved: 'bg-green-100 text-green-800 border border-green-200',
  rejected: 'bg-red-100 text-red-800 border border-red-200',
  
  // Role-based
  active: 'bg-green-100 text-green-800 border border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
  suspended: 'bg-orange-100 text-orange-800 border border-orange-200',
};

export const BUTTON_STYLES = {
  // Primary action
  primary: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium',
  
  // Secondary action
  secondary: 'px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium',
  
  // Danger action
  danger: 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium',
  
  // Ghost/Link style
  ghost: 'px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium',
  
  // Small
  small: 'px-3 py-1 text-sm rounded-lg font-medium',
};

export const BADGE_STYLES = {
  base: 'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded',
  small: 'px-2 py-1 text-xs',
  medium: 'px-3 py-1.5 text-sm',
  large: 'px-4 py-2 text-base',
};

export const MODAL_STYLES = {
  overlay: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
  container: 'bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl',
  header: 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between',
  title: 'text-xl font-bold text-gray-900',
  content: 'p-6 space-y-4',
  footer: 'border-t border-gray-200 p-6 flex gap-3 bg-gray-50',
};

export const FORM_STYLES = {
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  select: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  textarea: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono',
};

export const CARD_STYLES = {
  container: 'bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow',
  header: 'pb-4 border-b border-gray-200 mb-4',
  title: 'font-bold text-gray-900',
  subtitle: 'text-sm text-gray-600 mt-1',
  body: 'space-y-4',
  footer: 'pt-4 border-t border-gray-200 mt-4',
};

export const FILTER_STYLES = {
  container: 'flex items-center gap-2 flex-wrap',
  button: 'px-3 py-1.5 text-sm border rounded-lg transition-colors cursor-pointer',
  active: 'bg-blue-600 text-white border-blue-600',
  inactive: 'border-gray-300 text-gray-700 hover:border-gray-400',
};

// Getter functions for dynamic status colors
export function getStatusColor(status: string | undefined): string {
  if (!status) return STATUS_COLORS.pending;
  const normalizedStatus = status.toLowerCase().replace(/[_\s-]/g, '_');
  return (STATUS_COLORS as any)[normalizedStatus] || STATUS_COLORS.pending;
}

export function getStatusBadgeClass(status: string | undefined): string {
  return `${BADGE_STYLES.base} ${getStatusColor(status)}`;
}
