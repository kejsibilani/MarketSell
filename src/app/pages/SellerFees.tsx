import { useState, useMemo } from 'react';
import { DollarSign, Package, Truck, Zap, TrendingUp, ArrowDownRight } from 'lucide-react';

type FeeType = 'shipment' | 'sales_order' | 'transformation';

interface FeeDetail {
  type: FeeType;
  description: string;
  perKg?: number;
  perUnit?: number;
  perOrder?: number;
  icon: React.ReactNode;
  color: string;
}

const FEE_STRUCTURE: Record<FeeType, FeeDetail> = {
  shipment: {
    type: 'shipment',
    description: 'Shipment Fees',
    perKg: 0.15,
    icon: <Truck className="w-5 h-5" />,
    color: 'bg-blue-50 border-blue-200'
  },
  sales_order: {
    type: 'sales_order',
    description: 'Sales Order Fees',
    perUnit: 0.25,
    perOrder: 5.00,
    icon: <Package className="w-5 h-5" />,
    color: 'bg-green-50 border-green-200'
  },
  transformation: {
    type: 'transformation',
    description: 'Transformation Fees',
    perUnit: 0.50,
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-purple-50 border-purple-200'
  },
};

type Transaction = {
  id: string;
  type: FeeType;
  description: string;
  amount: number;
  date: string;
  linkedOrder?: string;
  revenue?: number; // Associated revenue/sales amount
};

const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'sales_order', description: 'Order SO-001 — 100 units', amount: 25.00, date: '2026-06-08', linkedOrder: 'SO-001', revenue: 850.00 },
  { id: 'tx2', type: 'shipment', description: 'Shipment SP-005 — 500 kg', amount: 75.00, date: '2026-06-07', linkedOrder: 'SP-005', revenue: 2500.00 },
  { id: 'tx3', type: 'transformation', description: 'Transform TO-012 — 80 units', amount: 40.00, date: '2026-06-06', linkedOrder: 'TO-012', revenue: 1200.00 },
  { id: 'tx4', type: 'sales_order', description: 'Order SO-002 per order', amount: 5.00, date: '2026-06-05', linkedOrder: 'SO-002', revenue: 650.00 },
  { id: 'tx5', type: 'shipment', description: 'Shipment SP-004 — 250 kg', amount: 37.50, date: '2026-06-04', linkedOrder: 'SP-004', revenue: 1800.00 },
];

export default function SellerFees() {
  const [filterType, setFilterType] = useState<FeeType | 'all'>('all');
  const totalFees = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const totalRevenue = TRANSACTIONS.reduce((s, t) => s + (t.revenue || 0), 0);
  const netIncome = totalRevenue - totalFees;
  const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0';
  
  const filteredTx = useMemo(() => {
    return filterType === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filterType);
  }, [filterType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A] flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Fees & Pricing
        </h1>
        <p className="text-sm text-gray-600">Understand our service fees and transaction history.</p>
      </div>

      {/* Fee Structure Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-[#0B1F3A] to-[#1a3a5f]">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Service Pricing
          </h2>
          <p className="text-gray-200 text-sm mt-1">Understand how fees are calculated for each service type</p>
        </div>

        {/* Fees Grid */}
        <div className="grid md:grid-cols-3 gap-6 p-6">
          {Object.values(FEE_STRUCTURE).map((fee) => (
            <div key={fee.type} className={`border-2 rounded-lg p-5 ${fee.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{fee.icon}</div>
                <h3 className="font-semibold text-gray-900">{fee.description}</h3>
              </div>
              <div className="space-y-3">
                {fee.perKg !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per kilogram:</span>
                    <span className="font-bold text-lg text-gray-900">€{fee.perKg.toFixed(2)}/kg</span>
                  </div>
                )}
                {fee.perUnit !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per unit:</span>
                    <span className="font-bold text-lg text-gray-900">€{fee.perUnit.toFixed(2)}/u</span>
                  </div>
                )}
                {fee.perOrder !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per order:</span>
                    <span className="font-bold text-lg text-gray-900">€{fee.perOrder.toFixed(2)}/order</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Transaction History</h3>
              <div className="flex gap-2">
                {(['all', 'shipment', 'sales_order', 'transformation'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      filterType === ft ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ft === 'all' ? 'All' : ft === 'sales_order' ? 'Sales' : ft === 'shipment' ? 'Shipment' : 'Transform'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{tx.description}</div>
                    <div className="text-xs text-gray-500">
                      {tx.date} • {tx.linkedOrder && `Linked to ${tx.linkedOrder}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">€{tx.amount.toFixed(2)}</div>
                    <span className="text-xs px-2 py-0.5 inline-block capitalize bg-gray-100 text-gray-700 rounded">
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 space-y-4">
          <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Financial Overview
          </h3>
          
          {/* Main Revenue Display */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Sales Revenue</p>
                <p className="text-3xl font-bold text-green-700">€{totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 opacity-30" />
            </div>
            <p className="text-xs text-gray-500">From {TRANSACTIONS.length} active transactions</p>
          </div>

          {/* Fees vs Income Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Service Fees</p>
              <p className="text-xl font-bold text-red-600">-€{totalFees.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{((totalFees / totalRevenue) * 100).toFixed(1)}% of revenue</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Net Income</p>
              <p className="text-xl font-bold text-green-600">€{netIncome.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{profitMargin}% profit margin</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Shipment Transactions</p>
                <p className="text-lg font-bold text-gray-900">{TRANSACTIONS.filter((t) => t.type === 'shipment').length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sales Orders</p>
                <p className="text-lg font-bold text-gray-900">{TRANSACTIONS.filter((t) => t.type === 'sales_order').length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Transformations</p>
                <p className="text-lg font-bold text-gray-900">{TRANSACTIONS.filter((t) => t.type === 'transformation').length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Efficiency</p>
                <p className="text-lg font-bold text-green-600">{(100 - parseFloat(profitMargin)).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
