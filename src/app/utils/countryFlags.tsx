import React, { ReactNode } from 'react';

// Country name to flag emoji mapping
export const COUNTRY_FLAG_MAP: Record<string, string> = {
  // Europe
  'Spain': '🇪🇸',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Italy': '🇮🇹',
  'Portugal': '🇵🇹',
  'Greece': '🇬🇷',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
  'Switzerland': '🇨🇭',
  'United Kingdom': '🇬🇧',
  'Ireland': '🇮🇪',
  'Scandinavia': '🇸🇪',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Poland': '🇵🇱',
  'Czech Republic': '🇨🇿',
  'Slovakia': '🇸🇰',
  'Hungary': '🇭🇺',
  'Romania': '🇷🇴',
  'Bulgaria': '🇧🇬',
  'Croatia': '🇭🇷',
  'Serbia': '🇷🇸',
  'Slovenia': '🇸🇮',
  'Lithuania': '🇱🇹',
  'Latvia': '🇱🇻',
  'Estonia': '🇪🇪',
  'Ukraine': '🇺🇦',
  'Russia': '🇷🇺',
  'Belarus': '🇧🇾',
  'Turkey': '🇹🇷',

  // Americas
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Colombia': '🇨🇴',
  'Peru': '🇵🇪',
  'Ecuador': '🇪🇨',
  'El Salvador': '🇸🇻',
  'Costa Rica': '🇨🇷',
  'Guatemala': '🇬🇹',
  'Honduras': '🇭🇳',
  'Nicaragua': '🇳🇮',
  'Panama': '🇵🇦',
  'Venezuela': '🇻🇪',
  'Chile': '🇨🇱',
  'Argentina': '🇦🇷',
  'Uruguay': '🇺🇾',
  'Paraguay': '🇵🇾',
  'Bolivia': '🇧🇴',
  'Jamaica': '🇯🇲',
  'Dominican Republic': '🇩🇴',
  'Haiti': '🇭🇹',
  'Puerto Rico': '🇵🇷',
  'Belize': '🇧🇿',

  // Africa
  'Ethiopia': '🇪🇹',
  'Kenya': '🇰🇪',
  'Uganda': '🇺🇬',
  'Tanzania': '🇹🇿',
  'Rwanda': '🇷🇼',
  'Burundi': '🇧🇮',
  'South Africa': '🇿🇦',
  'Nigeria': '🇳🇬',
  'Ghana': '🇬🇭',
  'Ivory Coast': '🇨🇮',
  'Cameroon': '🇨🇲',
  'Angola': '🇦🇴',
  'Zambia': '🇿🇲',
  'Zimbabwe': '🇿🇼',
  'Morocco': '🇲🇦',
  'Egypt': '🇪🇬',

  // Asia
  'India': '🇮🇳',
  'Indonesia': '🇮🇩',
  'Vietnam': '🇻🇳',
  'Thailand': '🇹🇭',
  'China': '🇨🇳',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Taiwan': '🇹🇼',
  'Philippines': '🇵🇭',
  'Malaysia': '🇲🇾',
  'Singapore': '🇸🇬',
  'Hong Kong': '🇭🇰',
  'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩',
  'Sri Lanka': '🇱🇰',
  'Iran': '🇮🇷',
  'Iraq': '🇮🇶',
  'Saudi Arabia': '🇸🇦',
  'United Arab Emirates': '🇦🇪',
  'UAE': '🇦🇪',
  'Israel': '🇮🇱',
  'Lebanon': '🇱🇧',
  'Jordan': '🇯🇴',

  // Oceania
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Fiji': '🇫🇯',
  'Papua New Guinea': '🇵🇬',

  // ISO 2-letter country codes (for tax codes)
  'ES': '🇪🇸',
  'FR': '🇫🇷',
  'DE': '🇩🇪',
  'IT': '🇮🇹',
  'PT': '🇵🇹',
  'GR': '🇬🇷',
  'NL': '🇳🇱',
  'BE': '🇧🇪',
  'AT': '🇦🇹',
  'CH': '🇨🇭',
  'GB': '🇬🇧',
  'IE': '🇮🇪',
  'SE': '🇸🇪',
  'NO': '🇳🇴',
  'DK': '🇩🇰',
  'FI': '🇫🇮',
  'PL': '🇵🇱',
  'CZ': '🇨🇿',
  'SK': '🇸🇰',
  'HU': '🇭🇺',
  'RO': '🇷🇴',
  'BG': '🇧🇬',
  'HR': '🇭🇷',
  'RS': '🇷🇸',
  'SI': '🇸🇮',
  'LT': '🇱🇹',
  'LV': '🇱🇻',
  'EE': '🇪🇪',
  'UA': '🇺🇦',
  'RU': '🇷🇺',
  'BY': '🇧🇾',
  'TR': '🇹🇷',
  'US': '🇺🇸',
  'CA': '🇨🇦',
  'MX': '🇲🇽',
  'BR': '🇧🇷',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
  'EC': '🇪🇨',
  'SV': '🇸🇻',
  'CR': '🇨🇷',
  'GT': '🇬🇹',
  'HN': '🇭🇳',
  'NI': '🇳🇮',
  'PA': '🇵🇦',
  'VE': '🇻🇪',
  'CL': '🇨🇱',
  'AR': '🇦🇷',
  'UY': '🇺🇾',
  'PY': '🇵🇾',
  'BO': '🇧🇴',
  'JM': '🇯🇲',
  'DO': '🇩🇴',
  'HT': '🇭🇹',
  'PR': '🇵🇷',
  'BZ': '🇧🇿',
  'ET': '🇪🇹',
  'KE': '🇰🇪',
  'UG': '🇺🇬',
  'TZ': '🇹🇿',
  'RW': '🇷🇼',
  'BI': '🇧🇮',
  'ZA': '🇿🇦',
  'NG': '🇳🇬',
  'GH': '🇬🇭',
  'CI': '🇨🇮',
  'CM': '🇨🇲',
  'AO': '🇦🇴',
  'ZM': '🇿🇲',
  'ZW': '🇿🇼',
  'MA': '🇲🇦',
  'EG': '🇪🇬',
  'IN': '🇮🇳',
  'ID': '🇮🇩',
  'VN': '🇻🇳',
  'TH': '🇹🇭',
  'CN': '🇨🇳',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'TW': '🇹🇼',
  'PH': '🇵🇭',
  'MY': '🇲🇾',
  'SG': '🇸🇬',
  'HK': '🇭🇰',
  'PK': '🇵🇰',
  'BD': '🇧🇩',
  'LK': '🇱🇰',
  'IR': '🇮🇷',
  'IQ': '🇮🇶',
  'SA': '🇸🇦',
  'AE': '🇦🇪',
  'IL': '🇮🇱',
  'LB': '🇱🇧',
  'JO': '🇯🇴',
  'AU': '🇦🇺',
  'NZ': '🇳🇿',
  'FJ': '🇫🇯',
  'PG': '🇵🇬',
};

/**
 * Get flag emoji for a country
 * Accepts country name or ISO 2-letter code
 */
export function getCountryFlag(country: string | null | undefined): string {
  if (!country) return '🌍';
  const flag = COUNTRY_FLAG_MAP[country.trim()];
  return flag || '🌍';
}

/**
 * React component for displaying country with flag and tooltip
 */
export function CountryDisplay({ country }: { country: string | null | undefined }): ReactNode {
  const flag = getCountryFlag(country);
  return (
    <span title={country || 'Unknown'} className="inline-flex items-center gap-2 cursor-help">
      <span className="text-lg">{flag}</span>
      <span className="text-gray-900">{country || 'Unknown'}</span>
    </span>
  );
}

/**
 * Display country flag only with hover tooltip
 */
export function CountryFlag({ country }: { country: string | null | undefined }): ReactNode {
  const flag = getCountryFlag(country);
  return (
    <span title={country || 'Unknown'} className="text-lg cursor-help inline-block">
      {flag}
    </span>
  );
}
