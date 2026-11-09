/**
 * User-facing labels for MarketSell
 * Editable/switchable for:
 * - A/B testing language variations
 * - Investor demo customization
 * - Multi-language support (future)
 * 
 * All user-facing text should come from here, not hardcoded
 */

export const LABEL_CONFIG = {
  // === Navigation & Page Titles ===
  'nav.dashboard': 'Dashboard',
  'nav.myCompanies': 'My Companies',
  'nav.myStock': 'My Stock',
  'nav.mySkus': 'My SKUs',
  'nav.myProducts': 'Manage My Products',
  'nav.mySalesOrders': 'My Sales Orders',
  'nav.myShipments': 'My Shipments',
  'nav.myPricingTool': 'My Pricing Tool',
  'nav.myStorefronts': 'My Storefronts',
  'nav.myFees': 'My Fees & Pricing',
  'nav.myCash': 'My Cash Account',
  'nav.myRestocking': 'My Restocking',
  'nav.myTransformations': 'My Transformations',

  // === Storefront Builder Section ===
  'storefront.pageTitle': 'My Storefronts',
  'storefront.builderTitle': 'Choose the storefronts where you want to sell your products',
  'storefront.builderDesc': 'Set pricing, availability, and branding per marketplace',
  'storefront.myStorefronts': 'My Storefronts',
  'storefront.thirdParty': '3rd Party Marketplaces',
  'storefront.addNew': 'Add Storefront',
  'storefront.previewButton': 'Preview Storefront',
  'storefront.configureButton': 'Configure',
  'storefront.advancedSettings': 'Advanced Settings',

  // === Pricing Tool ===
  'pricing.title': 'My Pricing Tool',
  'pricing.productView': 'By Product',
  'pricing.storefrontView': 'By Storefront',
  'pricing.setPrice': 'Set Price',
  'pricing.setPriceDesc': 'Configure prices and discounts',
  'pricing.statusConfigured': 'Pricing Configured',
  'pricing.statusPending': 'Pending Review',
  'pricing.statusInactive': 'Not Configured',
  'pricing.startDate': 'Start Date',
  'pricing.endDate': 'End Date',
  'pricing.dateRange': 'Date Range',
  'pricing.untilFurtherNotice': 'until further notice',
  'pricing.promotion': 'Promotion',
  'pricing.discount': 'Discount',

  // === Manage My Products ===
  'products.pageTitle': 'Manage My Products',
  'products.addNew': 'Add Product',
  'products.editProduct': 'Edit Product',
  'products.deleteProduct': 'Delete Product',
  'products.selectPackaging': 'Choose Packaging',
  'products.packaging': 'Packaging',
  'products.customPackaging': 'Create your own packaging',
  'products.repackage': 'Repackage your product',
  'products.createSamples': 'Request samples',

  // === Stock / Inventory ===
  'stock.pageTitle': 'My Stock',
  'stock.pageDesc': 'Track your inventory across all locations',
  'stock.ownerOfStock': 'Owner',
  'stock.quantity': 'Quantity',
  'stock.quantityUnit': 'Unit (kg)',
  'stock.location': 'Location',
  'stock.lastUpdated': 'Last Updated',

  // === Sales Orders ===
  'orders.pageTitle': 'My Sales Orders',
  'orders.date': 'Date',
  'orders.seller': 'Seller',
  'orders.agent': 'Agent',
  'orders.buyer': 'Buyer',
  'orders.contents': 'Contents',
  'orders.status': 'Status',
  'orders.viewDetails': 'View Details',
  'orders.orderSource': 'Order Source',
  'orders.sourceAgent': 'Agent',
  'orders.sourceOperator': 'Operator',
  'orders.sourceOwner': 'Owner',
  'orders.sourceStorefront': 'Storefront',
  'orders.orderAndDate': 'Order & Date',
  'orders.buyerLocation': 'Buyer Location',

  // === Shipments ===
  'shipments.pageTitle': 'My Shipments',
  'shipments.planNew': 'Plan New Shipment',
  'shipments.completed': 'Completed Shipments',
  'shipments.remaining': 'Remaining to Ship',
  'shipments.carrier': 'Carrier',
  'shipments.destination': 'Destination',
  'shipments.quantityInKg': 'Quantity (kg)',
  'shipments.status': 'Status',
  'shipments.trackingNumber': 'Tracking Number',
  'shipments.delivered': 'Delivered',
  'shipments.inTransit': 'In Transit',
  'shipments.pending': 'Pending',
  'shipments.shipmentHistory': 'Shipment History',

  // === Restocking ===
  'restocking.pageTitle': 'My Restocking',
  'restocking.requestNew': 'Request New Stock',
  'restocking.status': 'Status',
  'restocking.quantity': 'Quantity',

  // === Common Actions ===
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.close': 'Close',
  'action.viewAll': 'View All',
  'action.addNew': 'Add New',
  'action.backToList': 'Back to List',
  'action.print': 'Print',
  'action.download': 'Download',
  'action.view': 'View',
  'action.expand': 'Expand',

  // === Status Labels ===
  'status.active': 'Active',
  'status.inactive': 'Inactive',
  'status.pending': 'Pending',
  'status.approved': 'Approved',
  'status.rejected': 'Rejected',
  'status.completed': 'Completed',
  'status.inProgress': 'In Progress',
  'status.onHold': 'On Hold',
  'status.shipped': 'Shipped',
  'status.delivered': 'Delivered',

  // === Form Labels ===
  'form.name': 'Name',
  'form.email': 'Email',
  'form.phone': 'Phone',
  'form.address': 'Address',
  'form.country': 'Country',
  'form.price': 'Price',
  'form.quantity': 'Quantity',
  'form.description': 'Description',

  // === Empty States & Messages ===
  'empty.noData': 'No data available',
  'empty.noOrders': 'No orders yet',
  'empty.noShipments': 'No shipments yet',
  'empty.noProducts': 'No products yet',

} as const;

export type LabelKey = keyof typeof LABEL_CONFIG;
