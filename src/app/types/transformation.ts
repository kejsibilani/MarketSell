// ============================================================================
// TRANSFORMATION TYPES & ENUMS
// ============================================================================

export enum TransformationType {
  ROASTING = 'roasting',
  PACKAGING = 'packaging',
  REPACKAGING = 'repackaging',
  BRAND_PACKAGING = 'brand_packaging',
  BAG_OPENING = 'bag_opening',
}

export type TransformationTypeKey = keyof typeof TransformationType;

export const TRANSFORMATION_TYPE_LABELS: Record<TransformationType, string> = {
  [TransformationType.ROASTING]: 'Roasting',
  [TransformationType.PACKAGING]: 'Packaging',
  [TransformationType.REPACKAGING]: 'Repackaging',
  [TransformationType.BRAND_PACKAGING]: 'Brand Packaging',
  [TransformationType.BAG_OPENING]: 'Bag Opening',
};

export const TRANSFORMATION_TYPE_DESCRIPTIONS: Record<TransformationType, string> = {
  [TransformationType.ROASTING]: 'Roast green coffee beans to roasted SKU',
  [TransformationType.PACKAGING]: 'Repackage into smaller consumer packages',
  [TransformationType.REPACKAGING]: 'Reconditioning into smaller packages (e.g., samples)',
  [TransformationType.BRAND_PACKAGING]: 'Apply custom branding/logo to packaging',
  [TransformationType.BAG_OPENING]: 'Open closed bag for quality analysis (same product, different SKU state)',
};

export const TRANSFORMATION_TYPE_ICONS: Record<TransformationType, string> = {
  [TransformationType.ROASTING]: '☕',
  [TransformationType.PACKAGING]: '📦',
  [TransformationType.REPACKAGING]: '📦',
  [TransformationType.BRAND_PACKAGING]: '🎨',
  [TransformationType.BAG_OPENING]: '🔓',
};

export const TRANSFORMATION_TYPE_COLORS: Record<TransformationType, { bg: string; text: string; border: string }> = {
  [TransformationType.ROASTING]: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-l-4 border-amber-500' },
  [TransformationType.PACKAGING]: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-l-4 border-blue-500' },
  [TransformationType.REPACKAGING]: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-l-4 border-purple-500' },
  [TransformationType.BRAND_PACKAGING]: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-l-4 border-pink-500' },
  [TransformationType.BAG_OPENING]: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-4 border-orange-500' },
};

// ============================================================================
// TRANSFORMATION ORDER INTERFACES
// ============================================================================

export interface TransformItem {
  sku: string;
  productName: string;
  units: number;
  kg?: number;
}

export interface ShippingEvent {
  date: string;
  event: string;
  location: string;
  carrier?: string;
  trackingRef?: string;
  internalShipmentId?: string;
}

export interface TransformationOrder {
  id: string;
  date: string;
  company: string;
  type: TransformationType;
  description?: string;
  internalShipmentId?: string;
  fromItems: TransformItem[];
  toItems: TransformItem[];
  estimatedQty?: number;
  cost: number;
  status: 'pending' | 'working' | 'completed';
  shippingHistory?: ShippingEvent[];
}

// ============================================================================
// DASHBOARD CARD TYPE
// ============================================================================

export interface TransformationTypeCard {
  type: TransformationType;
  label: string;
  description: string;
  icon: string;
  color: { bg: string; text: string; border: string };
  count: number;
  route: string;
}

export const TRANSFORMATION_TYPE_CARDS = (orders: TransformationOrder[]): TransformationTypeCard[] => {
  const counts = {
    [TransformationType.ROASTING]: orders.filter(o => o.type === TransformationType.ROASTING).length,
    [TransformationType.PACKAGING]: orders.filter(o => o.type === TransformationType.PACKAGING).length,
    [TransformationType.REPACKAGING]: orders.filter(o => o.type === TransformationType.REPACKAGING).length,
    [TransformationType.BRAND_PACKAGING]: orders.filter(o => o.type === TransformationType.BRAND_PACKAGING).length,
    [TransformationType.BAG_OPENING]: orders.filter(o => o.type === TransformationType.BAG_OPENING).length,
  };

  return [
    {
      type: TransformationType.ROASTING,
      label: TRANSFORMATION_TYPE_LABELS[TransformationType.ROASTING],
      description: TRANSFORMATION_TYPE_DESCRIPTIONS[TransformationType.ROASTING],
      icon: TRANSFORMATION_TYPE_ICONS[TransformationType.ROASTING],
      color: TRANSFORMATION_TYPE_COLORS[TransformationType.ROASTING],
      count: counts[TransformationType.ROASTING],
      route: '/seller/roasting-orders',
    },
    {
      type: TransformationType.REPACKAGING,
      label: TRANSFORMATION_TYPE_LABELS[TransformationType.REPACKAGING],
      description: TRANSFORMATION_TYPE_DESCRIPTIONS[TransformationType.REPACKAGING],
      icon: TRANSFORMATION_TYPE_ICONS[TransformationType.REPACKAGING],
      color: TRANSFORMATION_TYPE_COLORS[TransformationType.REPACKAGING],
      count: counts[TransformationType.REPACKAGING],
      route: '/seller/repackaging-orders',
    },
    {
      type: TransformationType.PACKAGING,
      label: 'Create Samples',
      description: 'Create sample packages for testing and distribution',
      icon: '🧪',
      color: TRANSFORMATION_TYPE_COLORS[TransformationType.PACKAGING],
      count: counts[TransformationType.PACKAGING],
      route: '/seller/sampling-orders',
    },
    {
      type: TransformationType.BAG_OPENING,
      label: 'Quality Analysis',
      description: 'Open bags for quality checks and analysis at any stage',
      icon: TRANSFORMATION_TYPE_ICONS[TransformationType.BAG_OPENING],
      color: TRANSFORMATION_TYPE_COLORS[TransformationType.BAG_OPENING],
      count: counts[TransformationType.BAG_OPENING],
      route: '/seller/quality-analysis-orders',
    },
  ];
};
