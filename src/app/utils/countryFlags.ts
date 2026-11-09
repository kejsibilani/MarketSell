/**
 * Country Flags and Display Utilities
 */

// Map country codes to emoji flags
const COUNTRY_FLAGS: Record<string, string> = {
  // Europe
  'ES': '🇪🇸', // Spain
  'GB': '🇬🇧', // United Kingdom
  'IT': '🇮🇹', // Italy
  'FR': '🇫🇷', // France
  'DE': '🇩🇪', // Germany
  'BE': '🇧🇪', // Belgium
  'NL': '🇳🇱', // Netherlands
  'AT': '🇦🇹', // Austria
  'CH': '🇨🇭', // Switzerland
  'SE': '🇸🇪', // Sweden
  'NO': '🇳🇴', // Norway
  'DK': '🇩🇰', // Denmark
  'FI': '🇫🇮', // Finland
  'PL': '🇵🇱', // Poland
  'CZ': '🇨🇿', // Czech Republic
  'HU': '🇭🇺', // Hungary
  'RO': '🇷🇴', // Romania
  'MD': '🇲🇩', // Moldova
  'UA': '🇺🇦', // Ukraine
  'RU': '🇷🇺', // Russia
  'TR': '🇹🇷', // Turkey
  'GR': '🇬🇷', // Greece
  'PT': '🇵🇹', // Portugal
  'IE': '🇮🇪', // Ireland
  
  // Americas
  'US': '🇺🇸', // United States
  'CA': '🇨🇦', // Canada
  'MX': '🇲🇽', // Mexico
  'BR': '🇧🇷', // Brazil
  'AR': '🇦🇷', // Argentina
  'CL': '🇨🇱', // Chile
  'CO': '🇨🇴', // Colombia
  'PE': '🇵🇪', // Peru
  'EC': '🇪🇨', // Ecuador
  'BO': '🇧🇴', // Bolivia
  'PA': '🇵🇦', // Panama
  'SV': '🇸🇻', // El Salvador
  'HN': '🇭🇳', // Honduras
  'CR': '🇨🇷', // Costa Rica
  'UY': '🇺🇾', // Uruguay
  
  // Africa
  'ET': '🇪🇹', // Ethiopia
  'KE': '🇰🇪', // Kenya
  'TZ': '🇹🇿', // Tanzania
  'UG': '🇺🇬', // Uganda
  'RW': '🇷🇼', // Rwanda
  'ZA': '🇿🇦', // South Africa
  'NG': '🇳🇬', // Nigeria
  'GH': '🇬🇭', // Ghana
  'CM': '🇨🇲', // Cameroon
  'CI': '🇨🇮', // Ivory Coast
  
  // Asia
  'CN': '🇨🇳', // China
  'IN': '🇮🇳', // India
  'JP': '🇯🇵', // Japan
  'KR': '🇰🇷', // South Korea
  'VN': '🇻🇳', // Vietnam
  'TH': '🇹🇭', // Thailand
  'ID': '🇮🇩', // Indonesia
  'PH': '🇵🇭', // Philippines
  'MY': '🇲🇾', // Malaysia
  'SG': '🇸🇬', // Singapore
  'BD': '🇧🇩', // Bangladesh
  'PK': '🇵🇰', // Pakistan
  'IR': '🇮🇷', // Iran
  'AE': '🇦🇪', // UAE
  'SA': '🇸🇦', // Saudi Arabia
  'IL': '🇮🇱', // Israel
  
  // Oceania
  'AU': '🇦🇺', // Australia
  'NZ': '🇳🇿', // New Zealand

  // Regional Fallbacks
  'NORTH-AFRICA': '🌍',
  'NORTH AFRICA': '🌍',
};

// Country code to full name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'ES': 'Spain',
  'GB': 'United Kingdom',
  'IT': 'Italy',
  'FR': 'France',
  'DE': 'Germany',
  'BE': 'Belgium',
  'NL': 'Netherlands',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'MD': 'Moldova',
  'UA': 'Ukraine',
  'RU': 'Russia',
  'TR': 'Turkey',
  'GR': 'Greece',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'EC': 'Ecuador',
  'BO': 'Bolivia',
  'PA': 'Panama',
  'SV': 'El Salvador',
  'HN': 'Honduras',
  'CR': 'Costa Rica',
  'UY': 'Uruguay',
  'ET': 'Ethiopia',
  'KE': 'Kenya',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'RW': 'Rwanda',
  'ZA': 'South Africa',
  'NG': 'Nigeria',
  'GH': 'Ghana',
  'CM': 'Cameroon',
  'CI': 'Ivory Coast',
  'CN': 'China',
  'IN': 'India',
  'JP': 'Japan',
  'KR': 'South Korea',
  'VN': 'Vietnam',
  'TH': 'Thailand',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'BD': 'Bangladesh',
  'PK': 'Pakistan',
  'IR': 'Iran',
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'IL': 'Israel',
  'AU': 'Australia',
  'NZ': 'New Zealand',
};

// Reverse map (Country Name / Slug -> Country Code) for name-based lookup
const NAME_TO_CODE: Record<string, string> = Object.entries(COUNTRY_NAMES).reduce(
  (acc, [code, name]) => {
    acc[name.toUpperCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Get emoji flag for country code, country name, or country slug
 * @param query - Country code ('ES'), full name ('Spain'), or slug ('spain')
 * @returns Emoji flag or fallback icon
 */
export function getCountryFlag(query: string | undefined): string {
  if (!query) return '🌍';

  const normalized = query.trim().toUpperCase();

  // 1. Direct code lookup (e.g., 'ES')
  if (COUNTRY_FLAGS[normalized]) {
    return COUNTRY_FLAGS[normalized];
  }

  // 2. Direct name lookup (e.g., 'SPAIN' -> 'ES')
  const codeFromName = NAME_TO_CODE[normalized];
  if (codeFromName && COUNTRY_FLAGS[codeFromName]) {
    return COUNTRY_FLAGS[codeFromName];
  }

  // 3. Fallback for regional descriptors or unknown inputs
  return '🌍';
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string | undefined): string {
  if (!countryCode) return 'Unknown';
  const code = countryCode.toUpperCase();
  return COUNTRY_NAMES[code] || countryCode;
}

/**
 * Get formatted country display with flag
 */
export function getCountryDisplay(countryCode: string | undefined): string {
  const flag = getCountryFlag(countryCode);
  const name = getCountryName(countryCode);
  return `${flag} ${name}`;
}