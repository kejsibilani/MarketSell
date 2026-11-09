import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { transactions } from '../data/mockData';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function OperatorCash() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const types = Array.from(new Set(transactions.map(t => t.type)));

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      (filterType === 'all' || t.type === filterType) &&
      (search === '' || t.description.toLowerCase().includes(search.toLowerCase()) ||
       t.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, filterType]);

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'sale' || t.type === 'commission').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const quickActionsData = [
    { icon: '💰', label: 'Available Balance', value: `€${balance.toFixed(2)}`, bgColor: 'bg-green-50', textColor: 'text-green-600', subtext: 'Current' },
    { icon: '📥', label: 'Total Income', value: `€${totalIncome.toFixed(2)}`, bgColor: 'bg-blue-50', textColor: 'text-blue-600', subtext: 'All time' },
    { icon: '📤', label: 'Total Expenses', value: `€${totalExpense.toFixed(2)}`, bgColor: 'bg-red-50', textColor: 'text-red-600', subtext: 'All time' },
  ];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">Cash Management</h1>
          <p className="text-gray-600">Track financial transactions and cash flow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActionsData.map((action, index) => (
            <div key={index} className={`${action.bgColor} rounded-lg border border-gray-200 p-4`}>
              <div className="text-sm text-gray-600 mb-1">{action.label}</div>
              <div className={`text-2xl font-bold ${action.textColor} mb-1`}>{action.value}</div>
              <div className="text-xs text-gray-500">{action.subtext}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <button className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              Record Transaction
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono font-semibold">{transaction.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold gap-1 ${
                          transaction.type === 'sale' || transaction.type === 'commission'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'sale' || transaction.type === 'commission' ? (
                            <>
                              <TrendingUp size={14} />
                              {transaction.type === 'sale' ? 'Sale' : 'Commission'}
                            </>
                          ) : (
                            <>
                              <TrendingDown size={14} />
                              Withdrawal
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{transaction.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{transaction.description}</td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} EUR
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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
