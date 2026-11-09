import { LABEL_CONFIG, type LabelKey } from '../config/labels';

/**
 * Hook to access user-facing labels
 * Enables easy switching between language packs or label variations
 *
 * Usage:
 *   const label = useLabels();
 *   <h1>{label('storefront.pageTitle')}</h1>
 * 
 * Benefits:
 * - All user-facing text in one place
 * - Easy A/B testing of terminology
 * - Supports future multi-language
 * - Investor can request label changes without code edits
 */
export function useLabels() {
  return (key: LabelKey): string => {
    return LABEL_CONFIG[key] ?? key;
  };
}
