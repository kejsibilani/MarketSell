import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { USER_RIGHTS, USERS, COMPANIES } from '../data/mockData';
import { loadFromLS, saveToLS, type UserRights, type Company } from '../utils/workflowHelpers';
import { Edit, Plus, X } from 'lucide-react';

function BoolCell({ value }: { value: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value ? '✓ Yes' : '✗ No'}
    </span>
  );
}

// Mock companies for the modal
const MOCK_COMPANIES_RIGHTS: Company[] = [
  { id: 'comp-001', name: 'MarketSell Trading', country: 'El Salvador', city: 'San Salvador', contactEmail: 'sales@marketsell.com', status: 'Active', createdAt: '2024-01-01' },
  { id: 'comp-002', name: 'Coffee Imports Ltd', country: 'Colombia', city: 'Bogotá', contactEmail: 'info@coffeeimports.com', status: 'Active', createdAt: '2024-01-15' },
  { id: 'comp-003', name: 'Brazilian Coffee Co', country: 'Brazil', city: 'São Paulo', contactEmail: 'contact@brazilcoffee.com', status: 'Active', createdAt: '2024-02-01' },
];

function GrantRightsModal({ isOpen, onClose, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (rights: UserRights) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES_RIGHTS[0]?.id || '');
  const [selectedRoles, setSelectedRoles] = useState<Set<'buyer' | 'seller' | 'agent'>>(new Set());
  const [permissions, setPermissions] = useState({
    canSell: true,
    canBeAgent: false,
    canPlaceOrders: true,
    canUpdateData: true,
    canAuthoriseUsers: false,
  });

  if (!isOpen) return null;

  const toggleRole = (role: 'buyer' | 'seller' | 'agent') => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const roleConfig = [
    { id: 'buyer', label: 'Buyer', icon: '📥', color: 'blue' },
    { id: 'seller', label: 'Seller', icon: '🏪', color: 'green' },
    { id: 'agent', label: 'Agent', icon: '👤', color: 'gray' },
  ] as const;

  const userIds = Array.from(new Set(USER_RIGHTS.map(r => r.userId)));

  const permissionLabels = {
    canSell: 'Can Sell?',
    canBeAgent: 'Can Be Agent?',
    canPlaceOrders: 'Can Place Orders?',
    canUpdateData: 'Can Update Data?',
    canAuthoriseUsers: 'Can Authorise Users?',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Grant Rights to User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose a user --</option>
              {userIds.map(uid => (
                <option key={uid} value={uid}>User U{String(uid).padStart(3, '0')}</option>
              ))}
            </select>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MOCK_COMPANIES_RIGHTS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Multiple Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Roles (Select multiple)</label>
            <div className="grid grid-cols-3 gap-3">
              {roleConfig.map(roleItem => (
                <button
                  key={roleItem.id}
                  onClick={() => toggleRole(roleItem.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedRoles.has(roleItem.id)
                      ? `border-blue-500 bg-blue-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{roleItem.icon}</div>
                  <p className={`text-sm font-semibold ${selectedRoles.has(roleItem.id) ? 'text-blue-700' : 'text-gray-700'}`}>
                    {roleItem.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedRoles.has(roleItem.id) ? '✓ Selected' : 'Click to select'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions - CRUD Operations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Permissions (CRUD Operations)</label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {Object.entries(permissions).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPermissions(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{permissionLabels[key as keyof typeof permissionLabels]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedUser && selectedRoles.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Grant Summary</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• User: <strong>U{String(selectedUser).padStart(3, '0')}</strong></li>
                <li>• Company: <strong>{MOCK_COMPANIES_RIGHTS.find(c => c.id === selectedCompany)?.name}</strong></li>
                <li>• Roles: <strong>{Array.from(selectedRoles).map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}</strong></li>
                <li>• Permissions: <strong>{Object.values(permissions).filter(Boolean).length} of 5 enabled</strong></li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!selectedUser) {
                alert('Please select a user');
                return;
              }
              if (selectedRoles.size === 0) {
                alert('Please select at least one role');
                return;
              }
              // Save rights for each selected role
              Array.from(selectedRoles).forEach(role => {
                onSave({
                  userId: selectedUser,
                  companyId: selectedCompany,
                  role,
                  ...permissions,
                });
              });
              alert('Rights assigned successfully!');
              onClose();
            }}
            disabled={!selectedUser || selectedRoles.size === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            Grant Rights ({selectedRoles.size})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorUserRights() {
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [showGrantRightsModal, setShowGrantRightsModal] = useState(false);
  const [userRights, setUserRights] = useState<UserRights[]>(() => 
    loadFromLS('userRights', [])
  );

  const filteredRights = useMemo(() => {
    return USER_RIGHTS.filter(r =>
      (filterUser === 'all' || r.userId === parseInt(filterUser)) &&
      (filterCompany === 'all' || r.companyId === filterCompany) &&
      (search === '' || `U${r.userId}`.includes(search) || r.companyId.includes(search))
    );
  }, [search, filterUser, filterCompany]);

  const userIds = Array.from(new Set(USER_RIGHTS.map(r => r.userId)));
  const companyIds = Array.from(new Set(USER_RIGHTS.map(r => r.companyId)));

  const quickActionsData = [
    { icon: '👥', label: 'Total Rights', value: USER_RIGHTS.length, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { icon: '🔓', label: 'Can Sell', value: USER_RIGHTS.filter(r => r.canSell).length, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { icon: '🛒', label: 'Can Order', value: USER_RIGHTS.filter(r => r.canPlaceOrders).length, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  ];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-1">User Rights & Permissions</h1>
          <p className="text-gray-600">Manage user access levels and company permissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Users</option>
              {userIds.map(uid => (
                <option key={uid} value={String(uid)}>User U{String(uid).padStart(3, '0')}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Company</label>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Companies</option>
              {companyIds.map(cid => (
                <option key={cid} value={cid}>{cid}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActionsData.map((action, index) => (
            <div key={index} className={`${action.bgColor} rounded-lg border border-gray-200 p-4`}>
              <div className="text-sm text-gray-600 mb-2">{action.label}</div>
              <div className={`text-2xl font-bold ${action.textColor}`}>{action.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search user or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <button 
              onClick={() => setShowGrantRightsModal(true)}
              className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Grant Rights
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Company ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Can Sell?</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Can Be Agent?</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Can Place Orders?</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Can Update Data?</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Can Authorise Users?</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky right-0 z-10 bg-gray-50">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredRights.length > 0 ? (
                  filteredRights.map((right, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono font-bold">U{String(right.userId).padStart(3, '0')}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{right.companyId}</td>
                      <td className="px-4 py-3"><BoolCell value={right.canSell} /></td>
                      <td className="px-4 py-3"><BoolCell value={right.canBeAgent} /></td>
                      <td className="px-4 py-3"><BoolCell value={right.canPlaceOrders} /></td>
                      <td className="px-4 py-3"><BoolCell value={right.canUpdateData} /></td>
                      <td className="px-4 py-3"><BoolCell value={right.canAuthoriseUsers} /></td>
                      <td className="px-4 py-3 sticky right-0 z-10 bg-white hover:bg-gray-50">
                        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <Edit size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No user rights found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <GrantRightsModal 
          isOpen={showGrantRightsModal}
          onClose={() => setShowGrantRightsModal(false)}
          onSave={(rights) => {
            setUserRights([...userRights, rights]);
            saveToLS('userRights', [...userRights, rights]);
          }}
        />
      </div>
  );
}
