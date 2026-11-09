import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import TableHeader from '../components/TableHeader';
import PageHeader from '../components/PageHeader';
import { USERS as MOCK_USERS } from '../data/mockData';
import { NewRecordModal } from '../components/NewRecordModal';
import { Edit, Plus, Trash2, Shield, Lock } from 'lucide-react';
import { loadFromLS, saveToLS, type UserRights, type Company } from '../utils/workflowHelpers';
import { writeCollection } from '../../lib/backend/storage';

const LS_KEY = 'marketsell_users';

// Load mock companies for testing
const MOCK_COMPANIES: Company[] = [
  { id: 'comp-001', name: 'MarketSell Trading', country: 'El Salvador', city: 'San Salvador', contactEmail: 'sales@marketsell.com', status: 'Active', createdAt: '2024-01-01' },
  { id: 'comp-002', name: 'Coffee Imports Ltd', country: 'Colombia', city: 'Bogotá', contactEmail: 'info@coffeeimports.com', status: 'Active', createdAt: '2024-01-15' },
  { id: 'comp-003', name: 'Brazilian Coffee Co', country: 'Brazil', city: 'São Paulo', contactEmail: 'contact@brazilcoffee.com', status: 'Active', createdAt: '2024-02-01' },
];

const DEFAULT_USER_RIGHTS: UserRights[] = [
  { userId: 1, companyId: 'comp-001', canSell: true, canBeAgent: true, canPlaceOrders: true, canUpdateData: true, canAuthoriseUsers: true, role: 'buyer' },
  { userId: 1, companyId: 'comp-001', canSell: true, canBeAgent: true, canPlaceOrders: true, canUpdateData: true, canAuthoriseUsers: false, role: 'seller' },
  { userId: 2, companyId: 'comp-002', canSell: true, canBeAgent: false, canPlaceOrders: true, canUpdateData: true, canAuthoriseUsers: false, role: 'buyer' },
];

function loadUsers() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return MOCK_USERS.map((u, i) => ({
    userId: u.userId,
    email: `user${u.userId}@marketsell.com`,
    name: `User ${u.userId}`,
    sellerGroup: u.sellerGroup,
    buyerGroup: u.buyerGroup,
    agentGroup: u.agentGroup,
    buyerRating: u.buyerRating,
    sellerRating: u.sellerRating,
    agentRating: u.agentRating,
  }));
}

function saveUsers(users: any[]) {
  try {
    writeCollection(LS_KEY, users);
  } catch (e) {}
}

function RatingStars({ value }: { value: number }) {
  return <div className="flex gap-1">{[...Array(5)].map((_, i) => <span key={i} className={i < value ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}</div>;
}

function UserRightsModal({ isOpen, user, onClose, onSave, companies }: { 
  isOpen: boolean; 
  user: any; 
  onClose: () => void; 
  onSave: (rights: UserRights) => void; 
  companies: Company[];
}) {
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '');
  const [selectedRoles, setSelectedRoles] = useState<Set<'buyer' | 'seller' | 'agent'>>(new Set());
  const [permissions, setPermissions] = useState({
    canCreateOrders: true,
    canCreateShipments: true,
    canCreateTransformations: false,
    canManageStock: true,
    canViewReports: true,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Assign Rights to {user?.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companies.map(c => (
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

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Permissions</label>
            <div className="space-y-2">
              {Object.entries(permissions).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPermissions(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedRoles.size === 0) {
                alert('Please select at least one role');
                return;
              }
              // Save rights for each selected role
              Array.from(selectedRoles).forEach(role => {
                return onSave({
                    userId: user.userId,
                    companyId: selectedCompany,
                    role,
                    ...permissions,
                    canSell: false,
                    canBeAgent: false,
                    canPlaceOrders: false,
                    canUpdateData: false,
                    canAuthoriseUsers: false
                });
              });
              onClose();
            }}
            disabled={selectedRoles.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Rights ({selectedRoles.size})
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorUsers() {
  const [users, setUsers] = useState<any[]>(() => loadUsers());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userRights, setUserRights] = useState<UserRights[]>(() => loadFromLS('userRights', DEFAULT_USER_RIGHTS));
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [selectedUserForRights, setSelectedUserForRights] = useState<any>(null);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveToLS('userRights', userRights);
  }, [userRights]);

  const allGroups = Array.from(new Set(users.flatMap(u => [u.sellerGroup, u.buyerGroup, u.agentGroup])));
  const rows = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    return (!q || `u${u.userId}`.includes(q) || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.sellerGroup.toLowerCase().includes(q))
      && (!filterGroup || [u.sellerGroup, u.buyerGroup, u.agentGroup].includes(filterGroup));
  }), [search, filterGroup, users]);

  const getUserRights = (userId: number) => {
    return userRights.filter(r => r.userId === userId);
  };

  const handleAddUser = (data: any) => {
    const newUser = {
      userId: Math.max(...users.map(u => u.userId), 0) + 1,
      email: data.email || `user${Date.now()}@marketsell.com`,
      name: data.name || `User ${Date.now()}`,
      sellerGroup: data.sellerGroup || 'New Group',
      buyerGroup: data.buyerGroup || 'Wholesale',
      agentGroup: data.agentGroup || 'None',
      buyerRating: 3,
      sellerRating: 3,
      agentRating: 0,
    };
    setUsers([...users, newUser]);
    setShowNewUserModal(false);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowNewUserModal(true);
  };

  const handleSaveEdit = (data: any) => {
    if (!editingUser) return;
    const updatedUsers = users.map(u => u.userId === editingUser.userId ? { ...editingUser, ...data } : u);
    setUsers(updatedUsers);
    setEditingUser(null);
    setShowNewUserModal(false);
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.userId !== userId));
      setUserRights(userRights.filter(r => r.userId !== userId));
    }
  };

  const handleSaveRights = (rights: UserRights) => {
    const existingIndex = userRights.findIndex(r => r.userId === rights.userId && r.companyId === rights.companyId);
    if (existingIndex >= 0) {
      const updated = [...userRights];
      updated[existingIndex] = rights;
      setUserRights(updated);
    } else {
      setUserRights([...userRights, rights]);
    }
  };

  return (
      <div className="space-y-6">
          <PageHeader
              title="Users"
              description="Manage user accounts and permissions"
              onAddNew={() => { setEditingUser(null); setShowNewUserModal(true); } }
              addNewLabel="New User" />

          {/* Status filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
                  {['all', 'Active', 'Pending'].map(s => (
                      <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          {s}
                      </button>
                  ))}
              </div>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button onClick={() => { setSearch(''); setStatus('all'); } } className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-600">Total Users</div>
                  <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
                  <div className="text-xs text-gray-500 mt-1">All users</div>
              </button>
              <button onClick={() => { setSearch(''); setStatus('all'); } } className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-600">Groups</div>
                  <div className="text-2xl font-bold text-blue-600">{allGroups.length}</div>
                  <div className="text-xs text-gray-500 mt-1">User groups</div>
              </button>
              <button className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors">
                  <div className="text-sm text-gray-600">With Rights</div>
                  <div className="text-2xl font-bold text-green-600">{new Set(userRights.map(r => r.userId)).size}</div>
                  <div className="text-xs text-gray-500 mt-1">Users assigned</div>
              </button>
              <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  <div className="text-sm text-gray-600">Companies</div>
                  <div className="text-2xl font-bold text-gray-900">{MOCK_COMPANIES.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Available</div>
              </div>
          </div>

          {/* Table section */}
          <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex-1">
                      <div className="flex items-center gap-3">
                          <input
                              type="text"
                              placeholder="Search users..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                              <th className="px-4 py-3">User ID</th>
                              <th className="px-4 py-3">Seller Group</th>
                              <th className="px-4 py-3">Buyer Group</th>
                              <th className="px-4 py-3">Agent Group</th>
                              <th className="px-4 py-3">Buyer Rating</th>
                              <th className="px-4 py-3">Seller Rating</th>
                              <th className="px-4 py-3">Rights</th>
                              <th className="px-4 py-3">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {rows.map(u => {
                              const rights = getUserRights(u.userId);
                              return (
                                  <tr key={u.userId} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 font-mono font-bold text-gray-800">U{String(u.userId).padStart(3, '0')}</td>
                                      <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-semibold">{u.sellerGroup}</span></td>
                                      <td className="px-4 py-3"><span className="bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded text-xs font-semibold">{u.buyerGroup}</span></td>
                                      <td className="px-4 py-3"><span className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-xs font-semibold">{u.agentGroup}</span></td>
                                      <td className="px-4 py-3"><RatingStars value={u.buyerRating} /></td>
                                      <td className="px-4 py-3"><RatingStars value={u.sellerRating} /></td>
                                      <td className="px-4 py-3">
                                          <button
                                              onClick={() => {
                                                  setSelectedUserForRights(u);
                                                  setShowRightsModal(true);
                                              } }
                                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
                                          >
                                              <Shield size={14} />
                                              {rights.length}
                                          </button>
                                      </td>
                                      <td className="px-4 py-3 flex gap-2">
                                          <button onClick={() => handleEditUser(u)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium">
                                              <Edit size={13} /> Edit
                                          </button>
                                          <button onClick={() => handleDeleteUser(u.userId)} className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs font-medium">
                                              <Trash2 size={13} /> Delete
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      <NewRecordModal
              isOpen={showNewUserModal}
              onClose={() => { setShowNewUserModal(false); setEditingUser(null); } }
              title={editingUser ? 'Edit User' : 'New User'}
              entityType="user"
              onSubmit={editingUser ? handleSaveEdit : handleAddUser} />
      <UserRightsModal
              isOpen={showRightsModal}
              user={selectedUserForRights}
              onClose={() => setShowRightsModal(false)}
              onSave={handleSaveRights}
              companies={MOCK_COMPANIES} />
      </div>
  );
}
