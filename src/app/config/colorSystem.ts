/**
 * Professional color palette for MarketSell
 * Single source of truth for all UI colors
 * 
 * Palette:
 * - Primary: Navy (#0B1F3A) - existing brand color
 * - Secondary: Teal (#06B6D4) - modern, professional accent
 * - Status: Green (success), Amber (warning), Red (error), Blue (info)
 */

export const PROFESSIONAL_PALETTE = {
  // Primary
  primary: '#0B1F3A',        // Navy (existing brand color)
  primaryLight: '#1F2F4D',
  primaryDark: '#050F22',

  // Secondary (accent)
  secondary: '#06B6D4',      // Teal
  secondaryLight: '#22D3EE',
  secondaryDark: '#0891B2',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceHover: '#ECECEC',
  
  // Text
  text: {
    primary: '#1F2937',      // Gray-800
    secondary: '#6B7280',    // Gray-500
    tertiary: '#9CA3AF',     // Gray-400
    inverse: '#FFFFFF'
  },

  // Status colors (semantic)
  status: {
    success: '#10B981',      // Green
    successLight: '#D1FAE5',
    warning: '#F59E0B',      // Amber
    warningLight: '#FEF3C7',
    error: '#EF4444',        // Red
    errorLight: '#FEE2E2',
    info: '#3B82F6',         // Blue
    infoLight: '#EFF6FF'
  },

  // Borders & dividers
  border: '#E5E7EB',         // Gray-200
  borderLight: '#F3F4F6',    // Gray-100

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    elegant: '0 20px 25px -5px rgba(0, 0, 0, 0.08)'
  }
};

/**
 * Tailwind utility classes
 * Map palette to Tailwind theme (update tailwind.config.js with these)
 */
export const TAILWIND_COLORS = {
  'primary': PROFESSIONAL_PALETTE.primary,
  'secondary': PROFESSIONAL_PALETTE.secondary,
  'success': PROFESSIONAL_PALETTE.status.success,
  'warning': PROFESSIONAL_PALETTE.status.warning,
  'error': PROFESSIONAL_PALETTE.status.error,
  'info': PROFESSIONAL_PALETTE.status.info,
};

/**
 * Helper function to get color by semantic name
 */
export function getColor(colorKey: keyof typeof PROFESSIONAL_PALETTE): string {
  return PROFESSIONAL_PALETTE[colorKey] as string;
}

/**
 * Helper for status colors
 */
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info'): {
  bg: string;
  text: string;
  border: string;
} {
  const statusColors = {
    success: {
      bg: PROFESSIONAL_PALETTE.status.successLight,
      text: '#065F46',
      border: PROFESSIONAL_PALETTE.status.success
    },
    warning: {
      bg: PROFESSIONAL_PALETTE.status.warningLight,
      text: '#92400E',
      border: PROFESSIONAL_PALETTE.status.warning
    },
    error: {
      bg: PROFESSIONAL_PALETTE.status.errorLight,
      text: '#991B1B',
      border: PROFESSIONAL_PALETTE.status.error
    },
    info: {
      bg: PROFESSIONAL_PALETTE.status.infoLight,
      text: '#1E40AF',
      border: PROFESSIONAL_PALETTE.status.info
    }
  };
  return statusColors[status];
}
