import { Percent, DollarSign, Receipt, Tag } from "lucide-react";
import formatNumber from "../utils/numberFormat";
import { useAgentData } from "../hooks/useAgentData";

export default function AgentCommissions() {
  const { commissionTransactions, totalCommission, commissionRate } = useAgentData();

  // Helper to fallback to default commission rate if transaction doesn't specify its own
  const getTxRate = (tx: any) => tx.commissionRate ?? commissionRate;

  // Helper to get total order value (if recorded, otherwise estimated from amount & rate)
  const getSaleAmount = (tx: any) => {
    if (tx.saleAmount) return tx.saleAmount;
    const rate = getTxRate(tx);
    return rate > 0 ? tx.amount / rate : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Commissions</h1>
        <p className="text-sm text-gray-600 mt-1">
          Detailed breakdown of sales performance, product rates, and earned commission.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600">€{formatNumber(totalCommission, 2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#0B1F3A]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Default Rate</p>
            <p className="text-2xl font-bold text-[#0B1F3A]">{(commissionRate * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Payouts</p>
            <p className="text-2xl font-bold text-gray-800">{commissionTransactions.length}</p>
          </div>
        </div>
      </div>

      {/* Commission Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A]">Commission Breakdown</h2>
            <p className="text-xs text-gray-500">Credited automatically upon order delivery</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
            Rate per Product & Order
          </span>
        </div>

        <div className="overflow-x-auto">
          {commissionTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">
              No commissions yet — they're credited automatically once an order you placed is delivered.
            </p>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Description / Product</th>
                  <th className="py-3.5 px-5 text-right">Gross Sale</th>
                  <th className="py-3.5 px-5 text-center">Commission Rate</th>
                  <th className="py-3.5 px-5 text-right">Earned Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissionTransactions.map((tx) => {
                  const rate = getTxRate(tx);
                  const saleAmount = getSaleAmount(tx);

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap text-xs font-medium text-gray-400">
                        {tx.date}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-semibold text-[#0B1F3A]">{tx.description}</p>
                            {tx.description && (
                              <p className="text-xs text-gray-500">{tx.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right font-medium text-gray-700 whitespace-nowrap">
                        €{formatNumber(saleAmount, 2)}
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {(rate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span className="font-bold text-emerald-600 text-base">
                          +€{formatNumber(tx.amount, 2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}