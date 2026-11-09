// Storefront configuration storage and retrieval

export interface StorefrontConfig {
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor?: string;
  theme: 'light' | 'dark';
  logoUrl?: string;
  pricingStatus?: string;
  promotionActive?: boolean;
}

// Default storefront configs by seller/store
const DEFAULT_CONFIGS: Record<string, StorefrontConfig> = {
  'Costa Coffee Co.': {
    name: 'Costa Coffee',
    tagline: 'Premium Coffee Shop',
    primaryColor: '#6B4423',
    accentColor: '#D4A574',
    theme: 'light',
  },
  'Lavazza': {
    name: 'Lavazza',
    tagline: 'Italian Excellence',
    primaryColor: '#1e3a1f',
    accentColor: '#8B4513',
    theme: 'light',
  },
  'Nescafé': {
    name: 'Nescafé',
    tagline: 'Quality Coffee',
    primaryColor: '#1a472a',
    accentColor: '#D2691E',
    theme: 'light',
  },
  'default': {
    name: 'Coffee Store',
    tagline: 'Premium Coffee Shop',
    primaryColor: '#8B4513',
    accentColor: '#D2B48C',
    theme: 'light',
  },
};

export function getStorefrontConfig(sellerName: string): StorefrontConfig {
  const config = DEFAULT_CONFIGS[sellerName] || DEFAULT_CONFIGS['default'];
  return config;
}

export function getColorScheme(primaryColor: string) {
  // Generate complementary colors based on primary color
  return {
    primary: primaryColor,
    lighter: adjustBrightness(primaryColor, 20),
    darker: adjustBrightness(primaryColor, -20),
    text: '#ffffff',
  };
}

function adjustBrightness(color: string, percent: number) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export function saveStorefrontConfig(sellerName: string, config: StorefrontConfig) {
  localStorage.setItem(`storefront_config_${sellerName}`, JSON.stringify(config));
}

export function loadStorefrontConfig(sellerName: string): StorefrontConfig {
  const saved = localStorage.getItem(`storefront_config_${sellerName}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getStorefrontConfig(sellerName);
    }
  }
  return getStorefrontConfig(sellerName);
}
