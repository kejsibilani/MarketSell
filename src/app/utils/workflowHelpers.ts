import { writeCollection } from '../../lib/backend/storage';
// Workflow helpers for managing the complete business cycle

export interface User {
  userId: number;
  email: string;
  name: string;
  sellerGroup: string;
  buyerGroup: string;
  agentGroup: string;
  buyerRating: number;
  sellerRating: number;
  agentRating: number;
}

export interface UserRights {
  userId: number;
  companyId: string;
  companyGroupId?: string; // NEW: Company group for multi-company access - operators can be assigned to a group
  canSell: boolean;
  canBeAgent: boolean;
  canPlaceOrders: boolean;
  canUpdateData: boolean;
  canAuthoriseUsers: boolean;
  role: 'buyer' | 'seller' | 'agent' | 'operator';
}

export interface Company {
  id: string;
  name: string;
  country: string;
  city: string;
  contactEmail: string;
  status: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
}

export interface Producer {
  id: string;
  name: string;
  country: string;
  status: 'Active' | 'Pending';
  contactEmail: string;
  skuCount: number;
}

export interface SKU {
  id: string;
  skuName: string;
  eanBarcode: string;
  internalCode: string;
  warehouseCode: string;
  productName: string;
  producerName: string;
  producerId: string;
  companyId: string;
  pack: string;
  status: 'selling' | 'pending';
}

export type StockMovementType = 'INITIAL_INVENTORY' | 'GOODS_RECEIPT_FROM_RESTOCK' | 'GOODS_RECEIPT_FROM_RETURN' | 'GOODS_ISSUE_TO_TRANSFORMATION' | 'GOODS_ISSUE_TO_SALES' | 'INVENTORY_CORRECTION';

export interface StockMovement {
  id: string;
  skuId: string;
  date: string;
  type: StockMovementType;
  quantityUnits: number;
  warehouseId: string;
  companyId: string; // NEW: Owner company - required because warehouses can be shared across companies
  referenceNumber?: string;
  linkedToType?: 'SHIPMENT' | 'TRANSFORMATION_ORDER' | null;
  linkedToId?: string;
  comment?: string;
}

export interface ShipmentLineItem {
  skuId: string;
  quantity: number;
  price?: number;
}

export interface Shipment {
  id: string;
  shipmentId: string;
  date: string;
  from: string;
  to: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  items: ShipmentLineItem[]; // 1-N relationship: one shipment can have many line items
  warehouseId?: string; // NEW: Warehouse grouping - all items in a shipment must be from same warehouse
  relatedMovementId?: string;
  buyerId?: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerAccountNumber?: string;
  comment?: string;
  linkedOrderId?: string;
  linkedOrderType?: 'sales' | 'transformation' | 'restock';
  documents?: { name: string; type: string }[];
  pictures?: { name: string }[];
  draftState?: boolean; // NEW: Draft state for delete protection
}

export interface TransformationOrder {
  id: string;
  orderId: string;
  date: string;
  type: 'Roasting' | 'Blending' | 'Grinding' | 'Packaging' | 'Cupping' | 'Sorting';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  inputItems: { skuId: string; quantity: number }[];
  outputItems: { skuId: string; quantity: number }[];
  relatedMovementId?: string;
  comment?: string;
  healthMinistryAuthorizationNumber?: string; // NEW: Required for some jurisdictions when transforming coffee
  draftState?: boolean; // NEW: Draft state for delete protection
}

export interface RestockingOrder {
  id: string;
  date: string;
  company: string;
  companyId: string; // NEW: Company ID for filtering by company group
  product: string;
  sku: string;
  qty: number;
  warehouse: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'awaiting' | 'received' | 'rejected';
  notes?: string;
  linkedShipmentIds?: string[];
  linkedTransformations?: string[];
  draftState?: boolean; // NEW: Draft state for delete protection
}

// LocalStorage helpers
const LS_KEYS = {
  users: 'marketsell_users',
  userRights: 'marketsell_user_rights',
  companies: 'marketsell_companies',
  producers: 'marketsell_producers',
  skus: 'marketsell_skus',
  stockMovements: 'marketsell_stock_movements',
  shipments: 'marketsell_shipments',
  transformations: 'marketsell_transformations',
  salesOrders: 'marketsell_sales_orders',
  restockingOrders: 'marketsell_restocking_orders',
};

export const loadFromLS = <T,>(key: keyof typeof LS_KEYS, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(LS_KEYS[key]);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const saveToLS = (key: keyof typeof LS_KEYS, data: any) => {
  try {
    writeCollection(LS_KEYS[key], data);
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
};

// ID Generators
export const generateId = (prefix: string): string => {
  return `${prefix}-${String(Date.now()).slice(-6)}`;
};

export const generateShipmentId = (): string => {
  return `SHP-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
};

export const generateTransformationId = (): string => {
  return `TRF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
};

export const generateRestockingId = (): string => {
  return `RSK-${String(Date.now()).slice(-6)}`;
};

export const generateStockMovementId = (): string => {
  return `MOV-${String(Date.now()).slice(-6)}`;
};

// Workflow validations
export const canUserSell = (user: User, rights: UserRights[]): boolean => {
  return rights.some(r => r.userId === user.userId && r.canSell);
};

export const canUserBeAgent = (user: User, rights: UserRights[]): boolean => {
  return rights.some(r => r.userId === user.userId && r.canBeAgent);
};

export const canUserPlaceOrders = (user: User, rights: UserRights[]): boolean => {
  return rights.some(r => r.userId === user.userId && r.canPlaceOrders);
};

export const canUserUpdateData = (user: User, rights: UserRights[]): boolean => {
  return rights.some(r => r.userId === user.userId && r.canUpdateData);
};

export const canUserAuthoriseUsers = (user: User, rights: UserRights[]): boolean => {
  return rights.some(r => r.userId === user.userId && r.canAuthoriseUsers);
};

// Data helpers
export const getCompanyName = (companyId: string, companies: Company[]): string => {
  return companies.find(c => c.id === companyId)?.name || companyId;
};

export const getProducerName = (producerId: string, producers: Producer[]): string => {
  return producers.find(p => p.id === producerId)?.name || producerId;
};

export const getSKUInfo = (skuId: string, skus: SKU[]): SKU | undefined => {
  return skus.find(s => s.id === skuId);
};

export const getMovementTypeColor = (type: StockMovement['type']): string => {
  switch (type) {
    case 'INITIAL_INVENTORY':
      return 'bg-blue-100 text-blue-800';
    case 'GOODS_RECEIPT_FROM_RESTOCK':
      return 'bg-green-100 text-green-800';
    case 'GOODS_RECEIPT_FROM_RETURN':
      return 'bg-green-100 text-green-800';
    case 'GOODS_ISSUE_TO_TRANSFORMATION':
      return 'bg-red-100 text-red-800';
    case 'GOODS_ISSUE_TO_SALES':
      return 'bg-red-100 text-red-800';
    case 'INVENTORY_CORRECTION':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getMovementTypeLabel = (type: StockMovement['type']): string => {
  switch (type) {
    case 'INITIAL_INVENTORY':
      return 'Initial Inventory';
    case 'GOODS_RECEIPT_FROM_RESTOCK':
      return 'Receipt from Re-stock';
    case 'GOODS_RECEIPT_FROM_RETURN':
      return 'Receipt from Return';
    case 'GOODS_ISSUE_TO_TRANSFORMATION':
      return 'Issue to Transformation';
    case 'GOODS_ISSUE_TO_SALES':
      return 'Issue to Sales';
    case 'INVENTORY_CORRECTION':
      return 'Inventory Correction';
    default:
      return type;
  }
};
