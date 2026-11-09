// Mock data for coffee products and orders

export interface Product {
  id: string;
  name: string;
  category: string;
  origin: string;
  price: number;
  stock: number;
  status: 'selling' | 'pending' | 'out-of-stock';
  demand: 'high' | 'medium' | 'low';
  owner: string;
  warehouse: string;
  lot: string;
  image?: string;
}

export interface OrderItem { sku: string; productName: string; units: number; kg: number; gross?: number; vat?: number; net?: number }

// --- Shipments ---
export interface ShipmentHistoryEvent {
  timestamp: string; // e.g. "2026-05-06 14:30"
  location: string;
  statusDescription: string;
}

export interface Shipment {
  shipmentId: string; // e.g. "SHP-0001"
  internalTrackingNumber: string; // e.g. "ISP-1001"
  carrier: string;
  trackingReference: string;
  latestStatus: string; // e.g. "In Transit"
  date: string;
  units?: number; // e.g. 42 units of product(s) being shipped
  from?: string; // e.g. "Rotterdam Warehouse"
  to?: string; // e.g. "Madrid Distribution"
  history: ShipmentHistoryEvent[];
  items?: Array<{ skuId: string; quantity: number; price?: number; ownerOfStock?: string }>;
  pictures?: Array<{ name: string }>;
  documents?: Array<{ name: string; type?: string }>;
  linkedOrderId?: string; // e.g. "SO-2026-001", "TRF-2026-001", "REST-2026-001"
  linkedOrderType?: 'sales' | 'transformation' | 'restock'; // Order type this shipment belongs to
}

// --- Traceability / Transformations ---
export interface TraceabilityEntry {
  orderId: string; // e.g. "TRF-2026-001"
  date: string;
  type: string; // "Roasting", "Repackaging", "Blending"
  direction: 'upstream' | 'downstream';
  fromItems: { sku: string; productName: string; units: number; kg?: number }[];
  toItems: { sku: string; productName: string; units: number; kg?: number }[];
  status: string;
}

export const MOCK_TRACEABILITY: Record<string, TraceabilityEntry[]> = {
  'GC-COL-001-60KG': [
    {
      orderId: 'TRF-2026-001',
      date: '2026-03-01',
      type: 'Import',
      direction: 'upstream',
      fromItems: [{ sku: 'PL-IMP-001', productName: 'Green bean lot import', units: 1, kg: 60 }],
      toItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 1, kg: 60 }],
      status: 'completed',
    },
    {
      orderId: 'TRF-2026-010',
      date: '2026-04-12',
      type: 'Roasting',
      direction: 'downstream',
      fromItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 1, kg: 60 }],
      toItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40 }],
      status: 'completed',
    },
  ],
  'RC-COL-001-1KG': [
    {
      orderId: 'TRF-2026-010',
      date: '2026-04-12',
      type: 'Roasting',
      direction: 'upstream',
      fromItems: [{ sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 1, kg: 60 }],
      toItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40 }],
      status: 'completed',
    },
    {
      orderId: 'TRF-2026-020',
      date: '2026-05-03',
      type: 'Repackaging',
      direction: 'downstream',
      fromItems: [{ sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 10, kg: 10 }],
      toItems: [{ sku: 'RC-COL-001-250G', productName: 'Colombian Supremo — 250 g pack', units: 20, kg: 5 }],
      status: 'working',
    },
  ],
};

// --- Stock Movements ---
export type StockMovementType = 'INITIAL_INVENTORY' | 'GOODS_RECEIPT_FROM_RESTOCK' | 'GOODS_RECEIPT_FROM_RETURN' | 'GOODS_ISSUE_TO_TRANSFORMATION' | 'GOODS_ISSUE_TO_SALES' | 'INVENTORY_CORRECTION';
export type LinkedToType = 'SALES_ORDER' | 'SHIPMENT' | 'TRANSFORMATION_ORDER' | null;

// Use the StockMovement interface from workflowHelpers
export interface StockMovement {
  id: string;
  skuId: string;
  date: string; // ISO 8601 format, e.g. "2026-05-12T14:30:00Z"
  type: StockMovementType;
  quantityUnits: number; // number of units (positive or negative)
  warehouseId: string; // e.g. "Lisbon-Main", "Rotterdam-North"
  referenceNumber?: string;
  linkedToType?: 'SHIPMENT' | 'TRANSFORMATION_ORDER' | null;
  linkedToId?: string;
  comment?: string; // optional user note
}

export const stockMovements: StockMovement[] = [
  {
    id: 'SM-001',
    date: '2026-05-06T08:15:00Z',
    type: 'GOODS_RECEIPT_FROM_RESTOCK',
    skuId: '1',
    warehouseId: 'Lisbon-Main',
    quantityUnits: 16,
    linkedToType: null,
    linkedToId: undefined,
    comment: 'Initial import shipment from supplier',
  },
  {
    id: 'SM-002',
    date: '2026-05-08T10:45:00Z',
    type: 'INITIAL_INVENTORY',
    skuId: '1',
    warehouseId: 'Lisbon-Main',
    quantityUnits: 16,
    linkedToType: null,
    linkedToId: undefined,
    comment: 'System initial inventory setup',
  },
  {
    id: 'SM-003',
    date: '2026-05-12T14:30:00Z',
    type: 'GOODS_ISSUE_TO_SALES',
    skuId: '1',
    warehouseId: 'Lisbon-Main',
    quantityUnits: -10,
    linkedToType: 'SHIPMENT',
    linkedToId: 'ORD-1264',
    comment: '',
  },
  {
    id: 'SM-004',
    date: '2026-05-15T09:20:00Z',
    type: 'INVENTORY_CORRECTION',
    skuId: '1',
    warehouseId: 'Lisbon-Main',
    quantityUnits: 2,
    linkedToType: null,
    linkedToId: undefined,
    comment: 'Physical count adjustment - found 2 damaged bags',
  },
  {
    id: 'SM-005',
    date: '2026-05-18T16:00:00Z',
    type: 'GOODS_ISSUE_TO_SALES',
    skuId: '2',
    warehouseId: 'Rotterdam-North',
    quantityUnits: -40,
    linkedToType: 'SHIPMENT',
    linkedToId: 'SHP-0001',
    comment: '',
  },
  {
    id: 'SM-006',
    date: '2026-05-20T11:10:00Z',
    type: 'GOODS_RECEIPT_FROM_RESTOCK',
    skuId: '2',
    warehouseId: 'Rotterdam-North',
    quantityUnits: 120,
    linkedToType: 'TRANSFORMATION_ORDER',
    linkedToId: 'TRF-2026-010',
    comment: 'Roasted output from transformation process',
  },
  {
    id: 'SM-007',
    date: '2026-05-22T13:45:00Z',
    type: 'GOODS_ISSUE_TO_SALES',
    skuId: '1',
    warehouseId: 'Lisbon-Main',
    quantityUnits: -5,
    linkedToType: 'SHIPMENT',
    linkedToId: 'SHP-0002',
    comment: 'Shipped to customer order ORD-1265',
  },
  {
    id: 'SM-008',
    date: '2026-05-23T08:30:00Z',
    type: 'GOODS_RECEIPT_FROM_RETURN',
    skuId: '3',
    warehouseId: 'Madrid-Central',
    quantityUnits: 25,
    linkedToType: null,
    linkedToId: undefined,
    comment: 'Received from Kenya supplier - batch KEN-2026-Q2-001',
  },
  {
    id: 'SM-009',
    date: '2026-05-24T15:20:00Z',
    type: 'INVENTORY_CORRECTION',
    skuId: '2',
    warehouseId: 'Rotterdam-North',
    quantityUnits: -8,
    linkedToType: null,
    linkedToId: undefined,
    comment: 'Inventory shrinkage - 8 units missing from shelf audit',
  },
  {
    id: 'SM-010',
    date: '2026-05-25T10:15:00Z',
    type: 'GOODS_ISSUE_TO_TRANSFORMATION',
    skuId: '3',
    warehouseId: 'Madrid-Central',
    quantityUnits: -12,
    linkedToType: 'TRANSFORMATION_ORDER',
    linkedToId: 'TRF-2026-025',
    comment: 'Sent to roasting facility for processing',
  },
  {
    id: 'SM-011',
    date: '2026-05-26T09:00:00Z',
    type: 'GOODS_RECEIPT_FROM_RESTOCK',
    skuId: '4',
    warehouseId: 'Valencia-West',
    quantityUnits: 200,
    linkedToType: 'TRANSFORMATION_ORDER',
    linkedToId: 'TRF-2026-015',
    comment: 'Roasted Ethiopian beans - output from batch processing',
  },
];

// --- Cost assignment / invoices ---
export type CostEntityType =
  | 'shipment'
  | 'sales_order'
  | 'restock_order'
  | 'transformation_order';

export interface CostAllocationLine {
  sku: string;
  productName: string;
  weightKg: number;            // basis for proportional split
  proposedAmount: number;      // auto-calculated: (weightKg / totalKg) * invoice.totalAmount
  finalAmount: number;         // operator may override; must still sum to totalAmount
}

export interface Invoice {
  id: string;                  // internal e.g. "INV-2026-001"
  invoiceNumber: string;       // external ref e.g. "EXT-INV-7821"
  provider: string;
  totalAmount: number;
  currency: 'EUR' | 'USD';
  date: string;                // "YYYY-MM-DD"
  status: 'unassigned' | 'assigned' | 'partial';
  assignedTo?: {
    entityType: CostEntityType;
    entityId: string;
  };
  allocationLines: CostAllocationLine[];
  // optional uploaded PDF URL (client-side blob or remote link)
  pdfUrl?: string;
}

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'EXT-INV-7821',
    provider: 'Costas Ocean Freight',
    totalAmount: 1000.00,
    currency: 'EUR',
    date: '2026-05-01',
    status: 'assigned',
    assignedTo: { entityType: 'shipment', entityId: 'SHP-0001' },
    allocationLines: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee',  weightKg: 300, proposedAmount: 312.50, finalAmount: 312.50 },
      { sku: 'RC-ETH-002-1KG',  productName: 'Ethiopian Yirgacheffe Roasted',   weightKg: 290, proposedAmount: 302.08, finalAmount: 302.08 },
      { sku: 'GC-BRA-003-60KG', productName: 'Brazilian Santos Green Coffee',   weightKg: 180, proposedAmount: 187.50, finalAmount: 187.50 },
    ],
  pdfUrl: undefined,
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'EXT-INV-8001',
    provider: 'FedEx Spain',
    totalAmount: 75.00,
    currency: 'EUR',
    date: '2026-05-03',
    status: 'unassigned',
    allocationLines: [],
  },
  {
    id: 'INV-2026-003',
    invoiceNumber: 'EXT-INV-8190',
    provider: 'Rotterdam Roast Lab',
    totalAmount: 35.00,
    currency: 'EUR',
    date: '2026-04-25',
    status: 'partial',
    assignedTo: { entityType: 'transformation_order', entityId: 'TRF-2026-001' },
    allocationLines: [
      { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo Green Coffee', weightKg: 300, proposedAmount: 35.00, finalAmount: 35.00 },
    ],
  },
];

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'approved' | 'rejected';
  customer: string;
  date: string;
  orderType: 'client' | 'restocking';
  warehouse?: string;
  // optional per-order item breakdown used by seller/operator accordions
  items?: OrderItem[];
  shipments?: Shipment[];
  // Source of order (PRD §4.2.4) — which channel placed it. Orders with no
  // channel set are treated as storefront orders for backwards compatibility.
  channel?: 'storefront' | 'agent' | 'operator';
  agentName?: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'commission' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  agentName?: string;
}

// --- Agent Sales Channel: Assigned Stock & Stock Requests (PRD §4.2.5, §4.3.1, §4.4.5) ---
// A newly-registered agent starts with zero assigned stock. Sellers allocate
// quantity + price per agent (same mechanic as a storefront allocation).
// Until a product is allocated, the agent can only "request" it.
export interface AgentStockAllocation {
  id: string;
  productId: string;
  agentName: string;
  qtyAllocatedKg: number;
  qtySoldKg: number;
  unitPriceEurPerKg: number;
}

export interface AgentStockRequest {
  id: string;
  productId: string;
  agentName: string;
  qtyRequestedKg: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export const CURRENT_AGENT_NAME = 'Ventura Marco';
export const AGENT_COMMISSION_RATE = 0.12; // 12%, shown next to commission figures throughout the Agent portal

export const agentStockAllocations: AgentStockAllocation[] = [
  { id: 'ALLOC-001', productId: '1', agentName: CURRENT_AGENT_NAME, qtyAllocatedKg: 720, qtySoldKg: 210, unitPriceEurPerKg: 8.50 },
  { id: 'ALLOC-002', productId: '3', agentName: CURRENT_AGENT_NAME, qtyAllocatedKg: 300, qtySoldKg: 60, unitPriceEurPerKg: 7.80 },
];

export const agentStockRequests: AgentStockRequest[] = [
  { id: 'AREQ-001', productId: '4', agentName: CURRENT_AGENT_NAME, qtyRequestedKg: 150, status: 'pending', requestedAt: '2026-07-24' },
];


export const products: Product[] = [
  {
    id: '1',
    name: 'Colombian Supremo',
    category: 'Green Coffee',
    origin: 'Colombia',
    price: 8.50,
    stock: 2400,
    status: 'selling',
    demand: 'high',
    owner: 'Costa Coffee Co.',
    warehouse: 'Rotterdam',
    lot: 'LOT-2024-001',
  },
  {
    id: '2',
    name: 'Ethiopian Yirgacheffe',
    category: 'Green Coffee',
    origin: 'Ethiopia',
    price: 9.20,
    stock: 1800,
    status: 'selling',
    demand: 'high',
    owner: 'African Beans Ltd.',
    warehouse: 'Madrid',
    lot: 'LOT-2024-002',
  },
  {
    id: '3',
    name: 'Brazilian Santos',
    category: 'Green Coffee',
    origin: 'Brazil',
    price: 7.80,
    stock: 3200,
    status: 'selling',
    demand: 'medium',
    owner: 'Costa Coffee Co.',
    warehouse: 'Rotterdam',
    lot: 'LOT-2024-003',
  },
  {
    id: '4',
    name: 'Kenya AA',
    category: 'Green Coffee',
    origin: 'Kenya',
    price: 10.50,
    stock: 1200,
    status: 'selling',
    demand: 'medium',
    owner: 'African Beans Ltd.',
    warehouse: 'Lisbon',
    lot: 'LOT-2024-004',
  },
  {
    id: '5',
    name: 'Sumatra Mandheling',
    category: 'Green Coffee',
    origin: 'Indonesia',
    price: 8.90,
    stock: 0,
    status: 'out-of-stock',
    demand: 'low',
    owner: 'Asian Origins',
    warehouse: 'Madrid',
    lot: 'LOT-2024-005',
  },
  {
    id: '6',
    name: 'Guatemala Antigua',
    category: 'Roasted Coffee',
    origin: 'Guatemala',
    price: 12.50,
    stock: 800,
    status: 'selling',
    demand: 'high',
    owner: 'Central American Traders',
    warehouse: 'Rotterdam',
    lot: 'LOT-2024-006',
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    productName: 'Colombian Supremo',
    quantity: 100,
    total: 850,
    status: 'delivered',
    customer: 'Cafe Milano',
    date: '2024-03-20',
    orderType: 'client',
    channel: 'agent',
    agentName: CURRENT_AGENT_NAME,
  items: [ { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 1, kg: 60, gross: 300, vat: 60, net: 240 }, { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40, gross: 550, vat: 110, net: 440 } ],
  },
  {
    id: 'ORD-1264',
    productName: 'Mixed Shipment Example',
    quantity: 160,
    total: 1360,
    status: 'processing',
    customer: 'Demo Buyer',
    date: '2026-05-20',
    orderType: 'client',
    items: [ { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 2, kg: 120, gross: 600, vat: 120, net: 480 }, { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40, gross: 760, vat: 152, net: 608 } ],
    shipments: [
      {
        shipmentId: 'SHP-0001',
        internalTrackingNumber: 'ISP-1001',
        carrier: 'DHL',
        trackingReference: 'DHL-TRK-1001',
        latestStatus: 'In Transit',
        date: '2026-05-21',
        history: [
          { timestamp: '2026-05-21 08:30', location: 'Rotterdam - Depot', statusDescription: 'Picked up' },
          { timestamp: '2026-05-22 12:10', location: 'Transit Hub', statusDescription: 'In transit' },
        ],
      },
      {
        shipmentId: 'SHP-0002',
        internalTrackingNumber: 'ISP-1002',
        carrier: 'GLS',
        trackingReference: 'GLS-TRK-2002',
        latestStatus: 'Pending',
        date: '2026-05-21',
        history: [
          { timestamp: '2026-05-21 09:15', location: 'Madrid - Warehouse', statusDescription: 'Awaiting pickup' },
          { timestamp: '2026-05-22 14:00', location: 'Madrid - Depot', statusDescription: 'Collected' },
        ],
      },
    ],
  },
  {
    id: 'ORD-002',
    productName: 'Ethiopian Yirgacheffe',
    quantity: 50,
    total: 460,
    status: 'shipped',
    customer: 'The Coffee House',
    date: '2024-03-22',
    orderType: 'client',
  items: [ { sku: 'GC-ETH-001-60KG', productName: 'Ethiopian Yirgacheffe — 60 kg bag', units: 0, kg: 0, gross: 0, vat: 0, net: 0 }, { sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 50, kg: 50, gross: 460, vat: 92, net: 368 } ],
  },
  {
    id: 'ORD-003',
    productName: 'Brazilian Santos',
    quantity: 200,
    total: 1560,
    status: 'processing',
    customer: 'Roasters United',
    date: '2024-03-24',
    orderType: 'client',
    channel: 'agent',
    agentName: CURRENT_AGENT_NAME,
  items: [ { sku: 'GC-BRA-001-60KG', productName: 'Brazilian Santos — 60 kg bag', units: 3, kg: 180, gross: 900, vat: 180, net: 720 }, { sku: 'RC-BRA-002-1KG', productName: 'Brazilian Santos — 1 kg bag', units: 20, kg: 20, gross: 660, vat: 132, net: 528 } ],
  },
  {
    id: 'ORD-004',
    productName: 'Kenya AA',
    quantity: 75,
    total: 787.50,
    status: 'pending',
    customer: 'Specialty Brew Co.',
    date: '2024-03-25',
    orderType: 'client',
  items: [ { sku: 'GC-KEN-001-25KG', productName: 'Kenya AA — 25 kg bag', units: 3, kg: 75, gross: 787.5, vat: 157.5, net: 630 } ],
  },
  {
    id: 'REP-001',
    productName: 'Colombian Supremo',
    quantity: 1000,
    total: 8500,
    status: 'pending',
    customer: 'Costa Coffee Co.',
    date: '2024-03-26',
    orderType: 'restocking',
    warehouse: 'Madrid Central',
  items: [ { sku: 'GC-COL-001-60KG', productName: 'Colombian Supremo — 60 kg bag', units: 16, kg: 960, gross: 4800, vat: 960, net: 3840 }, { sku: 'RC-COL-001-1KG', productName: 'Colombian Supremo — 1 kg bag', units: 40, kg: 40, gross: 400, vat: 80, net: 320 } ],
  },
  {
    id: 'REP-002',
    productName: 'Brazilian Santos',
    quantity: 750,
    total: 5850,
    status: 'approved',
    customer: 'Costa Coffee Co.',
    date: '2024-03-20',
    orderType: 'restocking',
    warehouse: 'Rotterdam North',
  items: [ { sku: 'GC-BRA-001-60KG', productName: 'Brazilian Santos — 60 kg bag', units: 12, kg: 720, gross: 3600, vat: 720, net: 2880 }, { sku: 'RC-BRA-002-1KG', productName: 'Brazilian Santos — 1 kg bag', units: 30, kg: 30, gross: 450, vat: 90, net: 360 } ],
  },
  {
    id: 'REP-003',
    productName: 'Ethiopian Yirgacheffe',
    quantity: 500,
    total: 4600,
    status: 'pending',
    customer: 'Bean Masters Ltd',
    date: '2024-03-27',
    orderType: 'restocking',
    warehouse: 'Madrid Central',
  items: [ { sku: 'GC-ETH-001-60KG', productName: 'Ethiopian Yirgacheffe — 60 kg bag', units: 8, kg: 480, gross: 3680, vat: 736, net: 2944 }, { sku: 'RC-ETH-002-1KG', productName: 'Ethiopian Yirgacheffe — 1 kg bag', units: 20, kg: 20, gross: 920, vat: 184, net: 736 } ],
  },
];

export const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'sale',
    amount: 850,
    date: '2024-03-20',
    description: 'Sale: Colombian Supremo - Cafe Milano',
  },
  {
    id: 'TXN-002',
    type: 'commission',
    amount: 92,
    date: '2024-03-21',
    description: 'Commission: Ethiopian Yirgacheffe',
    agentName: CURRENT_AGENT_NAME,
  },
  {
    id: 'TXN-003',
    type: 'sale',
    amount: 1560,
    date: '2024-03-24',
    description: 'Sale: Brazilian Santos - Roasters United',
  },
  {
    id: 'TXN-004',
    type: 'withdrawal',
    amount: -500,
    date: '2024-03-25',
    description: 'Withdrawal to bank account',
  },
];

// --- Operator Dashboard Data ---
export const USERS = [
  { userId: 1, sellerGroup: 'Northfield', buyerGroup: 'Local', agentGroup: 'None', buyerRating: 4, sellerRating: 5, agentRating: 0 },
  { userId: 2, sellerGroup: 'RoastCo', buyerGroup: 'Wholesale', agentGroup: 'North', buyerRating: 3, sellerRating: 4, agentRating: 0 },
];

export const COMPANIES = [
  { companyId: 'C001', status: 'Active', companyType: 'Seller', companyGroup: 'Group A', shortName: 'Northfield', legalName: 'Northfield Coffee SL', taxId: 'ES123', taxCountry: 'ES', legalAddress: 'Rotterdam', documents: 'ok', roles: ['seller','operations'] },
  { companyId: 'C002', status: 'Pending', companyType: 'Buyer', companyGroup: 'Group B', shortName: 'RoastCo', legalName: 'RoastCo Ltd', taxId: 'GB321', taxCountry: 'GB', legalAddress: 'London', documents: 'nok', roles: ['buyer'] },
];

export const USER_RIGHTS = [
  { userId: 1, companyId: 'C001', canSell: true, canBeAgent: false, canPlaceOrders: true, canUpdateData: true, canAuthoriseUsers: false },
  { userId: 2, companyId: 'C002', canSell: false, canBeAgent: true, canPlaceOrders: true, canUpdateData: false, canAuthoriseUsers: false },
];

export const PRODUCERS = [
  { id: 'PROD-001', name: 'Cooperativa Los Altos', country: 'El Salvador', status: 'Active', contactEmail: 'contact@losaltos-coop.example', skuCount: 12 },
  { id: 'PROD-002', name: 'Coffee Farms Colombia', country: 'Colombia', status: 'Active', contactEmail: 'sales@coffeefarms-co.example', skuCount: 8 },
  { id: 'PROD-003', name: 'Roasters International', country: 'Italy', status: 'Pending', contactEmail: 'info@roasters.it', skuCount: 5 },
];

export const SKUS = [
  { id: 'S1', userId: 1, sku: 'GC-COL-001-60KG', skuName: 'GC-COL-001-60KG', eanBarcode: '1234567890123', barcode: '23857228428', warehouseCode: 'JA482', product: 'Colombian Supremo', productName: 'Colombian 60kg', productLine: 'Green Coffee', productCategory: 'Green Coffee', origin: 'El Salvador', originBatch: 'LOT-2024-001', producerId: 'PROD-001', producerName: 'Cooperativa Los Altos', pack: '60kg', weight: 60, size: '60 x 80 x 40 cm', pelletisation: 'no', pictures: '1', companyId: 'C001', status: 'selling', registeredDate: '14.06.2026', registeredBy: 'Peter Smith', internalCode: 'CO-345', temp: '15°C / 25°C', humidity: '45% / 80%', light: 'No light', rack: 'No rack', warehouses: ['Rotterdam', 'Chisinau'], documents: [{ date: '02.06.2026', type: 'Sanitary certificate', name: 'Original scan from farmer' }, { date: '02.06.2026', type: 'Labor certificate', name: 'Producer labour statement' }, { date: '08.05.2026', type: 'Quality check', name: 'Test Incalabs' }, { date: '12.05.2026', type: 'Quality check', name: '3rd party test' }, { date: '18.04.2026', type: 'Sample picture', name: 'Picture of current status' }] },
  { id: 'S2', userId: 2, sku: 'RC-COL-001-1KG', skuName: 'RC-COL-001-1KG', eanBarcode: '1234567890456', barcode: '23857228456', warehouseCode: 'JA483', product: 'Colombian Supremo', productName: 'Colombian 1kg', productLine: 'Roasted Coffee', productCategory: 'Roasted Coffee', origin: 'Colombia', originBatch: 'LOT-2024-002', producerId: 'PROD-002', producerName: 'Coffee Farms Colombia', pack: '1kg', weight: 1, size: '20 x 15 x 10 cm', pelletisation: 'no', pictures: '1', companyId: 'C001', status: 'selling', registeredDate: '12.06.2026', registeredBy: 'Anna Garcia', internalCode: 'CO-346', temp: '18°C / 20°C', humidity: '50% / 70%', light: 'No light', rack: 'Yes', warehouses: ['Rotterdam'], documents: [{ date: '01.06.2026', type: 'Sanitary certificate', name: 'Compliance certificate' }] },
];

// --- Sales Orders ---
export interface SalesOrderItem {
  skuId: string;
  quantity: number;
  price?: number;
  warehouse?: string;
  linkedShipmentIds?: string[];
  shippedQuantity?: number;
  ownerOfStock?: string; // NEW: Company/seller who owns this inventory
}

export interface SalesOrderData {
  id: string;
  orderId: string;
  date: string;
  buyerName: string;
  buyerEmail: string;
  buyerCountry?: string;
  buyerDestination?: string;
  sellerCompanyId?: string;
  sellerCompany?: string;
  sellerEmail?: string;
  agent?: string;
  agentCommission?: number;
  orderSource?: 'agent' | 'operator' | 'owner' | 'storefront';
  orderSourceValue?: string;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  items: SalesOrderItem[];
  totalValue?: number;
  currency?: string;
  totalItems?: number;
  createdDate: string;
  dueDate?: string;
  linkedShipmentIds?: string[];
  notes?: string;
}

export const MOCK_SALES_ORDERS: SalesOrderData[] = [
  {
    id: '1',
    orderId: 'SO-2026-001',
    date: '2026-05-10',
    buyerName: 'RoastCo Ltd',
    buyerEmail: 'orders@roastco.com',
    buyerCountry: 'RO',
    buyerDestination: 'Chisinau MD',
    sellerCompanyId: 'seller-001',
    sellerCompany: 'Ember France',
    sellerEmail: 'sales@emberfrance.example',
    agent: 'Pergamino',
    agentCommission: 5.5,
    orderSource: 'agent',
    orderSourceValue: 'Pergamino',
    status: 'fulfilled',
    items: [
      { 
        skuId: '1', 
        quantity: 100, 
        price: 8.50,
        warehouse: 'Rotterdam WH',
        linkedShipmentIds: ['SHP-0001', 'SHP-0002'],
        shippedQuantity: 100,
        ownerOfStock: 'Ember France'
      },
      { 
        skuId: '2', 
        quantity: 50, 
        price: 12.00,
        warehouse: 'Rotterdam WH',
        linkedShipmentIds: ['SHP-0003', 'SHP-0004'],
        shippedQuantity: 50,
        ownerOfStock: 'Ember France'
      },
    ],
    createdDate: '2026-05-10T08:00:00Z',
    dueDate: '2026-05-25T23:59:59Z',
    notes: 'Standard order for Q2 supply',
    totalValue: 1450,
    currency: 'EUR',
    totalItems: 150,
  },
  {
    id: '2',
    orderId: 'SO-2026-002',
    date: '2026-05-15',
    buyerName: 'Espresso Italia',
    buyerEmail: 'procurement@espresso-italia.it',
    buyerCountry: 'IT',
    buyerDestination: 'Milan MI',
    sellerCompanyId: 'seller-002',
    sellerCompany: 'Specialty Imports',
    sellerEmail: 'sales@specialty-imports.it',
    agent: 'Maria Santos',
    agentCommission: 4.5,
    orderSource: 'agent',
    orderSourceValue: 'Maria Santos',
    status: 'partial',
    items: [
      { 
        skuId: '2', 
        quantity: 200, 
        price: 12.00,
        warehouse: 'Madrid WH',
        linkedShipmentIds: ['SHP-0005', 'SHP-0006'],
        shippedQuantity: 120,
        ownerOfStock: 'Specialty Imports'
      },
      { 
        skuId: '1', 
        quantity: 60, 
        price: 8.50,
        warehouse: 'Rotterdam WH',
        linkedShipmentIds: ['SHP-0007', 'SHP-0008'],
        shippedQuantity: 0,
        ownerOfStock: 'Specialty Imports'
      },
    ],
    createdDate: '2026-05-15T10:30:00Z',
    dueDate: '2026-06-15T23:59:59Z',
    notes: 'Large order - partial shipment allowed',
    totalValue: 2910,
    currency: 'EUR',
    totalItems: 260,
  },
  {
    id: '3',
    orderId: 'SO-2026-003',
    date: '2026-05-20',
    buyerName: 'Nordic Coffee House',
    buyerEmail: 'supply@nordiccoffee.se',
    buyerCountry: 'SE',
    buyerDestination: 'Stockholm AB',
    sellerCompanyId: 'seller-003',
    sellerCompany: 'Nordic Supplies',
    sellerEmail: 'sales@nordic-supplies.se',
    agent: 'Erik Svensson',
    agentCommission: 3.5,
    orderSource: 'agent',
    orderSourceValue: 'Erik Svensson',
    status: 'pending',
    items: [
      { 
        skuId: '1', 
        quantity: 80, 
        price: 8.50,
        warehouse: 'Stockholm WH',
        linkedShipmentIds: ['SHP-0009', 'SHP-0010'],
        shippedQuantity: 0,
        ownerOfStock: 'Nordic Supplies'
      },
    ],
    createdDate: '2026-05-20T14:15:00Z',
    dueDate: '2026-06-20T23:59:59Z',
    notes: 'Waiting for warehouse confirmation',
    totalValue: 680,
    currency: 'EUR',
    totalItems: 80,
  },
  {
    id: '4',
    orderId: 'SO-2026-004',
    date: '2026-05-22',
    buyerName: 'Café Berlin',
    buyerEmail: 'orders@cafeberlin.de',
    buyerCountry: 'DE',
    buyerDestination: 'Berlin BE',
    sellerCompanyId: 'seller-004',
    sellerCompany: 'European Roasters',
    sellerEmail: 'sales@european-roasters.de',
    agent: 'Klaus Mueller',
    agentCommission: 3.0,
    orderSource: 'agent',
    orderSourceValue: 'Klaus Mueller',
    status: 'partial',
    items: [
      { 
        skuId: '2', 
        quantity: 120, 
        price: 12.00,
        warehouse: 'Berlin WH',
        linkedShipmentIds: ['SHP-0001', 'SHP-0002', 'SHP-0003'],
        shippedQuantity: 80,
        ownerOfStock: 'European Roasters'
      },
    ],
    createdDate: '2026-05-22T09:45:00Z',
    dueDate: '2026-06-05T23:59:59Z',
    notes: 'Express order - 2-3 shipments planned',
    totalValue: 1440,
    currency: 'EUR',
    totalItems: 120,
  },
  {
    id: '5',
    orderId: 'SO-2026-005',
    date: '2026-05-24',
    buyerName: 'Amsterdam Coffee Co',
    buyerEmail: 'orders@amsterdamcoffee.nl',
    buyerCountry: 'NL',
    buyerDestination: 'Amsterdam NH',
    sellerCompanyId: 'seller-005',
    sellerCompany: 'Benelux Trading',
    sellerEmail: 'sales@benelux-trading.nl',
    agent: 'Jan van der Berg',
    agentCommission: 4.0,
    orderSource: 'storefront',
    orderSourceValue: 'Amsterdam Marketplace',
    status: 'fulfilled',
    items: [
      { 
        skuId: '1', 
        quantity: 90, 
        price: 8.50,
        warehouse: 'Rotterdam WH',
        linkedShipmentIds: ['SHP-0011'],
        shippedQuantity: 90,
        ownerOfStock: 'Benelux Trading'
      },
    ],
    createdDate: '2026-05-24T11:20:00Z',
    dueDate: '2026-06-10T23:59:59Z',
    notes: 'Storefront order - direct marketplace sale',
    totalValue: 765,
    currency: 'EUR',
    totalItems: 90,
  },
  {
    id: '6',
    orderId: 'SO-2026-006',
    date: '2026-05-25',
    buyerName: 'Premium Café Paris',
    buyerEmail: 'achats@premiumcafe.fr',
    buyerCountry: 'FR',
    buyerDestination: 'Paris 75',
    sellerCompanyId: 'seller-001',
    sellerCompany: 'Ember France',
    sellerEmail: 'sales@emberfrance.example',
    agent: 'Operator Admin',
    agentCommission: 0,
    orderSource: 'operator',
    orderSourceValue: 'System Entry',
    status: 'pending',
    items: [
      { 
        skuId: '2', 
        quantity: 150, 
        price: 12.00,
        warehouse: 'Paris WH',
        linkedShipmentIds: [],
        shippedQuantity: 0,
        ownerOfStock: 'Ember France'
      },
      { 
        skuId: '1', 
        quantity: 75, 
        price: 8.50,
        warehouse: 'Paris WH',
        linkedShipmentIds: [],
        shippedQuantity: 0,
        ownerOfStock: 'Ember France'
      },
    ],
    createdDate: '2026-05-25T13:45:00Z',
    dueDate: '2026-07-05T23:59:59Z',
    notes: 'Operator-created order for key account',
    totalValue: 2437.50,
    currency: 'EUR',
    totalItems: 225,
  },
];

// --- Activity Log / Transformations & Shipments ---
export interface ActivityLogEntry {
  id: string;
  orderId: string;
  skuId: string;
  date: string;
  type: 'transformation' | 'shipment';
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  description: string;
  quantity: number;
  location?: string;
  carrier?: string;
  trackingNumber?: string;
  linkedId?: string; // reference to transformation or shipment ID
}

export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  // SO-2026-001 items activity
  {
    id: 'ACT-001',
    orderId: 'SO-2026-001',
    skuId: '1',
    date: '2026-05-18T08:00:00Z',
    type: 'transformation',
    status: 'completed',
    description: 'Green beans roasted and packaged',
    quantity: 100,
    location: 'Rotterdam Roasting Facility',
    linkedId: 'TRF-2026-050',
  },
  {
    id: 'ACT-002',
    orderId: 'SO-2026-001',
    skuId: '1',
    date: '2026-05-19T10:30:00Z',
    type: 'shipment',
    status: 'completed',
    description: 'Shipped via FedEx',
    quantity: 100,
    location: 'Rotterdam Warehouse',
    carrier: 'FedEx',
    trackingNumber: 'FDX-2026-0001',
    linkedId: 'SHP-0001',
  },
  {
    id: 'ACT-003',
    orderId: 'SO-2026-001',
    skuId: '2',
    date: '2026-05-18T14:00:00Z',
    type: 'transformation',
    status: 'completed',
    description: 'Repackaging from bulk to 1kg units',
    quantity: 50,
    location: 'Rotterdam Distribution Center',
    linkedId: 'TRF-2026-051',
  },
  {
    id: 'ACT-004',
    orderId: 'SO-2026-001',
    skuId: '2',
    date: '2026-05-20T09:00:00Z',
    type: 'shipment',
    status: 'completed',
    description: 'Shipped via UPS',
    quantity: 50,
    location: 'Rotterdam Warehouse',
    carrier: 'UPS',
    trackingNumber: 'UPS-2026-0001',
    linkedId: 'SHP-0002',
  },
  // SO-2026-002 items activity
  {
    id: 'ACT-005',
    orderId: 'SO-2026-002',
    skuId: '2',
    date: '2026-05-22T10:00:00Z',
    type: 'transformation',
    status: 'in_progress',
    description: 'Repackaging 200 units into smaller bags',
    quantity: 200,
    location: 'Rotterdam Distribution Center',
    linkedId: 'TRF-2026-052',
  },
  {
    id: 'ACT-006',
    orderId: 'SO-2026-002',
    skuId: '2',
    date: '2026-05-24T11:30:00Z',
    type: 'shipment',
    status: 'completed',
    description: 'Shipped via DHL Express',
    quantity: 120,
    location: 'Rotterdam Warehouse',
    carrier: 'DHL',
    trackingNumber: 'DHL-2026-0001',
    linkedId: 'SHP-0003',
  },
  {
    id: 'ACT-007',
    orderId: 'SO-2026-002',
    skuId: '1',
    date: '2026-05-23T08:00:00Z',
    type: 'transformation',
    status: 'completed',
    description: 'Quality check and sorting',
    quantity: 60,
    location: 'Quality Control Lab',
    linkedId: 'TRF-2026-053',
  },
  {
    id: 'ACT-008',
    orderId: 'SO-2026-002',
    skuId: '1',
    date: '2026-05-25T14:00:00Z',
    type: 'shipment',
    status: 'pending',
    description: 'Ready for shipment - waiting carrier pickup',
    quantity: 60,
    location: 'Rotterdam Warehouse',
    linkedId: 'SHP-0005',
  },
  // SO-2026-003 items activity
  {
    id: 'ACT-009',
    orderId: 'SO-2026-003',
    skuId: '1',
    date: '2026-05-21T09:00:00Z',
    type: 'transformation',
    status: 'pending',
    description: 'Scheduled for roasting',
    quantity: 80,
    location: 'Rotterdam Roasting Facility',
    linkedId: 'TRF-2026-054',
  },
  // SO-2026-004 items activity
  {
    id: 'ACT-010',
    orderId: 'SO-2026-004',
    skuId: '2',
    date: '2026-05-23T10:00:00Z',
    type: 'transformation',
    status: 'completed',
    description: 'Blend and repackaging into 1kg bags',
    quantity: 120,
    location: 'Rotterdam Distribution Center',
    linkedId: 'TRF-2026-055',
  },
  {
    id: 'ACT-011',
    orderId: 'SO-2026-004',
    skuId: '2',
    date: '2026-05-24T12:30:00Z',
    type: 'shipment',
    status: 'completed',
    description: 'Shipped via DPD',
    quantity: 120,
    location: 'Rotterdam Warehouse',
    carrier: 'DPD',
    trackingNumber: 'DPD-2026-0001',
    linkedId: 'SHP-0004',
  },
];

// --- Mock Shipments for Sales Orders ---
export const MOCK_SHIPMENTS = [
  {
    id: 'SHP-0001',
    shipmentId: 'SHP-0001',
    carrier: 'FedEx',
    trackingReference: 'FDX-2026-0001',
    trackingNumber: 'FDX2026000100',
    internalTrackingNumber: 'INT-OP-001',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Milano',
    date: '2026-05-19T10:30:00Z',
    status: 'delivered',
    units: 100,
    items: [{ skuId: '1', quantity: 100, price: 8.50, ownerOfStock: 'Ember France' }],
    pictures: [
      { name: 'package-front.jpg' },
      { name: 'package-back.jpg' },
      { name: 'contents-overview.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0001.pdf', type: 'Packing List' },
      { name: 'Invoice_SHP0001.pdf', type: 'Invoice' },
      { name: 'Customs_Declaration.pdf', type: 'Customs' },
    ],
  },
  {
    id: 'SHP-0002',
    shipmentId: 'SHP-0002',
    carrier: 'UPS',
    trackingReference: 'UPS-2026-0001',
    trackingNumber: 'UPS2026000100',
    internalTrackingNumber: 'INT-OP-002',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Milano',
    date: '2026-05-20T09:00:00Z',
    status: 'delivered',
    units: 50,
    items: [{ skuId: '2', quantity: 50, price: 12.00, ownerOfStock: 'Ember France' }],
    pictures: [
      { name: 'shipment-sealed.jpg' },
      { name: 'label-applied.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0002.pdf', type: 'Packing List' },
      { name: 'ShippingLabel_UPS.pdf', type: 'Shipping Label' },
      { name: 'Receipt_Proof.pdf', type: 'Receipt' },
    ],
  },
  {
    id: 'SHP-0003',
    shipmentId: 'SHP-0003',
    carrier: 'DHL',
    trackingReference: 'DHL-2026-0001',
    trackingNumber: 'DHL2026000100',
    internalTrackingNumber: 'INT-OP-003',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Milano',
    date: '2026-05-23T14:30:00Z',
    status: 'in_transit',
    units: 120,
    items: [{ skuId: '2', quantity: 120, price: 12.00 }],
    pictures: [
      { name: 'warehouse-pickup.jpg' },
      { name: 'box-preparation.jpg' },
      { name: 'truck-loading.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0003.pdf', type: 'Packing List' },
      { name: 'DHL_Tracking_Number.pdf', type: 'Tracking' },
      { name: 'Invoice_SHP0003.pdf', type: 'Invoice' },
    ],
  },
  {
    id: 'SHP-0004',
    shipmentId: 'SHP-0004',
    carrier: 'DPD',
    trackingReference: 'DPD-2026-0001',
    trackingNumber: 'DPD2026000100',
    internalTrackingNumber: 'INT-OP-004',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Milano',
    date: '2026-05-24T11:00:00Z',
    status: 'in_transit',
    units: 50,
    items: [{ skuId: '2', quantity: 50, price: 12.00 }],
    pictures: [
      { name: 'package-ready.jpg' },
      { name: 'qr-code-scan.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0004.pdf', type: 'Packing List' },
      { name: 'DPD_Manifest.pdf', type: 'Manifest' },
    ],
  },
  {
    id: 'SHP-0005',
    shipmentId: 'SHP-0005',
    carrier: 'PostNL',
    trackingReference: 'PNLX-2026-0001',
    trackingNumber: 'PNLX2026000100',
    internalTrackingNumber: 'INT-OP-005',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Milano',
    date: '2026-05-26T08:15:00Z',
    status: 'pending',
    units: 30,
    items: [{ skuId: '2', quantity: 30, price: 12.00 }],
    pictures: [
      { name: 'preparation-stage.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0005.pdf', type: 'Packing List' },
    ],
  },
  {
    id: 'SHP-0006',
    shipmentId: 'SHP-0006',
    carrier: 'GLS',
    trackingReference: 'GLS-2026-0002',
    trackingNumber: 'GLS2026000200',
    internalTrackingNumber: 'INT-OP-006',
    fromWarehouse: 'Madrid',
    toDestination: 'Rotterdam',
    date: '2026-05-25T13:45:00Z',
    status: 'delivered',
    units: 75,
    items: [
      { skuId: '1', quantity: 45, price: 8.50 },
      { skuId: '2', quantity: 30, price: 12.00 },
    ],
    pictures: [
      { name: 'warehouse-view.jpg' },
      { name: 'boxes-stacked.jpg' },
      { name: 'delivery-confirmation.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0006.pdf', type: 'Packing List' },
      { name: 'Invoice_SHP0006.pdf', type: 'Invoice' },
      { name: 'Receipt_GLS.pdf', type: 'Receipt' },
    ],
  },
  {
    id: 'SHP-0007',
    shipmentId: 'SHP-0007',
    carrier: 'TNT',
    trackingReference: 'TNT-2026-0001',
    trackingNumber: 'TNT2026000100',
    internalTrackingNumber: 'INT-OP-007',
    fromWarehouse: 'Madrid',
    toDestination: 'Valencia',
    date: '2026-05-27T10:20:00Z',
    status: 'in_transit',
    units: 60,
    items: [
      { skuId: '1', quantity: 60, price: 8.50 },
    ],
    pictures: [
      { name: 'truck-departure.jpg' },
      { name: 'route-tracker.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0007.pdf', type: 'Packing List' },
      { name: 'TNT_Manifest.pdf', type: 'Manifest' },
    ],
  },
  {
    id: 'SHP-0008',
    shipmentId: 'SHP-0008',
    carrier: 'Fedex',
    trackingReference: 'FDX-2026-0002',
    trackingNumber: 'FDX2026000200',
    internalTrackingNumber: 'INT-OP-008',
    fromWarehouse: 'Stockholm',
    toDestination: 'Copenhagen',
    date: '2026-05-28T15:30:00Z',
    status: 'pending',
    units: 90,
    items: [
      { skuId: '2', quantity: 90, price: 12.00 },
    ],
    pictures: [
      { name: 'pallet-wrapped.jpg' },
      { name: 'label-attached.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0008.pdf', type: 'Packing List' },
      { name: 'ShippingLabel_FDX.pdf', type: 'Shipping Label' },
    ],
  },
  {
    id: 'SHP-0009',
    shipmentId: 'SHP-0009',
    carrier: 'UPS',
    trackingReference: 'UPS-2026-0002',
    trackingNumber: 'UPS2026000200',
    internalTrackingNumber: 'INT-OP-009',
    fromWarehouse: 'Berlin',
    toDestination: 'Munich',
    date: '2026-05-29T09:00:00Z',
    status: 'delivered',
    units: 120,
    items: [
      { skuId: '1', quantity: 70, price: 8.50 },
      { skuId: '2', quantity: 50, price: 12.00 },
    ],
    pictures: [
      { name: 'package-arrived.jpg' },
      { name: 'recipient-signature.jpg' },
      { name: 'delivery-photo.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0009.pdf', type: 'Packing List' },
      { name: 'Invoice_SHP0009.pdf', type: 'Invoice' },
      { name: 'Proof_of_Delivery.pdf', type: 'POD' },
    ],
  },
  {
    id: 'SHP-0010',
    shipmentId: 'SHP-0010',
    carrier: 'DHL',
    trackingReference: 'DHL-2026-0002',
    trackingNumber: 'DHL2026000200',
    internalTrackingNumber: 'INT-OP-010',
    fromWarehouse: 'Rotterdam',
    toDestination: 'Amsterdam',
    date: '2026-05-30T11:15:00Z',
    status: 'in_transit',
    units: 45,
    items: [
      { skuId: '1', quantity: 45, price: 8.50 },
    ],
    pictures: [
      { name: 'hub-processing.jpg' },
      { name: 'belt-conveyor.jpg' },
    ],
    documents: [
      { name: 'Packing_List_SHP0010.pdf', type: 'Packing List' },
      { name: 'DHL_Label.pdf', type: 'Label' },
    ],
  },
];