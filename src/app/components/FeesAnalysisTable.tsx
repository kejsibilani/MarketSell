import { Link, TrendingUp, Package, Truck, Zap } from 'lucide-react';

interface FeeTransaction {
  id: string;
  type: 'shipment' | 'sales_order' | 'transformation';
  description: string;
  quantity: number;
  unit: string;
  feeAmount: number;
  date: string;
  linkedOrder: string;
  status: 'completed' | 'pending';
}

interface FeesAnalysisTableProps {
  transactions: FeeTransaction[];
  filterType?: 'shipment' | 'sales_order' | 'transformation' | 'all';
}

const typeConfig = {
  shipment: { label: 'Shipment', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  sales_order: { label: 'Sales Order', icon: Package, color: 'text-green-600', bgColor: 'bg-green-100' },
  transformation: { label: 'Transformation', icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export function FeesAnalysisTable({ transactions, filterType = 'all' }: FeesAnalysisTableProps) {
  const filteredTx = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const totalFees = filteredTx.reduce((sum, t) => sum + t.feeAmount, 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">€{totalFees.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{filteredTx.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Avg. Fee</p>
          <p className="text-2xl font-bold text-gray-900">€{(totalFees / (filteredTx.length || 1)).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{filteredTx.filter(t => t.status === 'pending').length}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked Order</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fee Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTx.length > 0 ? (
                filteredTx.map((tx) => {
                  const config = typeConfig[tx.type];
                  const IconComponent = config.icon;
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-2 w-fit px-2 py-1 rounded ${config.bgColor}`}>
                          <IconComponent className={`w-4 h-4 ${config.color}`} />
                          <span className="text-xs font-medium">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{tx.description}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1">
                          {tx.linkedOrder}
                          <Link className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {tx.quantity} {tx.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">€{tx.feeAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{tx.date}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
