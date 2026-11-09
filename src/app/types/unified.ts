/**
 * UNIFIED TYPE DEFINITIONS
 * Standardized types used across all pages (Operators, Sellers, Agents)
 * Ensures consistency in data structures and naming conventions
 */

// ─────────────────────────────────────────────────────────────────────────────
// STATUS ENUMS - Consistent across all modules
// ─────────────────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  RETURNING = 'returning',
  CANCELLED = 'cancelled',
}

export enum TransformationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransformationType {
  ROASTING = 'roasting',
  PACKAGING = 'packaging',
  SAMPLING = 'sampling',
  QUALITY_CHECK = 'quality_check',
  REBRANDING = 'rebranding',
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SKU - Stock Keeping Unit
 * Represents a unique product variant
 */
export interface SKU {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  unitPrice: number;
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * OrderItem - A line item in an order
 */
export interface OrderItem {
  id: string;
  skuId: string;
  sku?: SKU; // Denormalized for convenience
  quantity: number;
  unitPrice: number;
  subtotal: number;
  warehouse?: string;
  linkedShipmentIds?: string[];
  shippedQuantity?: number;
  cancelledQuantity?: number;
  ownerOfStock?: string; // NEW: Company/seller who owns this inventory
}

/**
 * SalesOrder - Main order entity
 */
export interface SalesOrder {
  id: string;
  orderId: string; // User-friendly order number
  
  // Source information
  source: 'storefront' | 'marketplace' | 'direct' | 'api';
  sourceDetails?: {
    storeName?: string;
    marketplaceId?: string;
  };
  
  // Seller/Provider information
  sellerCompanyId: string;
  sellerCompany: string;
  sellerEmail?: string;
  
  // Buyer information
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry?: string;
  buyerDestination?: string;
  
  // Agent information (optional)
  agentId?: string;
  agent?: string;
  agentCommission?: number;
  
  // NEW: How the order was entered into system
  orderSource?: 'agent' | 'operator' | 'owner' | 'storefront';
  orderSourceValue?: string; // Agent name, storefront name, etc.
  
  // Order details
  items: OrderItem[];
  totalItems: number;
  totalValue: number;
  currency: string;
  vat?: number;
  
  // Status and dates
  status: OrderStatus;
  createdDate: string;
  updatedDate: string;
  dueDate?: string;
  fulfilledDate?: string;
  
  // Metadata
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

/**
 * Shipment - Physical shipment/logistics record
 */
export interface Shipment {
  id: string;
  shipmentId: string; // User-friendly shipment number
  
  // Linking
  orderId?: string;
  saleOrderId?: string;
  
  // Shipment details
  carrier: string;
  trackingReference: string;
  trackingNumber?: string;
  trackingUrl?: string;
  
  // Routing
  fromWarehouse?: string;
  toDestination?: string;
  fromCountry?: string;
  toCountry?: string;
  
  // Contents
  items?: Array<{
    skuId: string;
    quantity: number;
    weight?: number;
    ownerOfStock?: string; // NEW: Company/seller who owns this inventory
  }>;
  totalWeight?: number;
  totalValue?: number;
  
  // Status and dates
  status: ShipmentStatus;
  createdDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  
  // Tracking
  events?: ShipmentEvent[];
  currentLocation?: string;
  
  // Documentation
  documents?: {
    packingList?: string;
    invoice?: string;
    certificate?: string;
    customs?: string;
  };
  pictures?: {
    name: string;
    url?: string;
  }[];
  
  // Metadata
  notes?: string;
  customFields?: Record<string, any>;
}

/**
 * ShipmentEvent - Track shipment status changes
 */
export interface ShipmentEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * TransformationOrder - For converting one SKU to another (roasting, rebranding, etc.)
 */
export interface TransformationOrder {
  id: string;
  transformationId: string; // User-friendly ID
  
  // What and where
  type: TransformationType;
  sellerCompanyId: string;
  
  // Input SKU
  inputSkuId: string;
  inputSku?: SKU;
  inputQuantity: number;
  inputWarehouse?: string;
  
  // Output SKU
  outputSkuId: string;
  outputSku?: SKU;
  outputQuantity: number;
  outputWarehouse?: string;
  
  // Process details
  expectedLoss?: number; // percentage
  actualLoss?: number;
  
  // Status and dates
  status: TransformationStatus;
  createdDate: string;
  startDate?: string;
  completedDate?: string;
  
  // Metadata
  notes?: string;
  recipe?: string; // For roasting profiles
  specifications?: Record<string, any>;
  customFields?: Record<string, any>;
}

/**
 * Stock/Inventory - Current stock levels
 */
export interface Stock {
  id: string;
  skuId: string;
  warehouseId: string;
  warehouseName: string;
  
  // Ownership
  ownerOfStock?: string; // Company/seller who owns this inventory
  
  // Quantities
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  transiting: number;
  
  // Dates
  lastUpdated: string;
  lastMovement?: string;
  
  // Metadata
  batchNumber?: string;
  expiryDate?: string;
}

/**
 * PaginatedResponse - Standard pagination wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EntityType = 'order' | 'shipment' | 'transformation' | 'sku' | 'stock';

export interface TableColumn<T> {
  id: string;
  label: string;
  accessor?: keyof T;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}
