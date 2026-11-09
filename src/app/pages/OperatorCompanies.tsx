import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import TableHeader from '../components/TableHeader';
import { NewRecordModal } from '../components/NewRecordModal';
import { Edit, Trash2 } from 'lucide-react';
import { type Company } from '../utils/workflowHelpers';
import { writeCollection } from '../../lib/backend/storage';

const LS_KEY = 'marketsell_companies';

const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'comp-001',
    name: 'MarketSell Trading',
    country: 'El Salvador',
    city: 'San Salvador',
    contactEmail: 'sales@marketsell.com',
    status: 'Active',
    createdAt: '2024-01-01',
  },
  {
    id: 'comp-002',
    name: 'Coffee Imports Ltd',
    country: 'Colombia',
    city: 'Bogotá',
    contactEmail: 'info@coffeeimports.com',
    status: 'Active',
    createdAt: '2024-01-15',
  },
  {
    id: 'comp-003',
    name: 'Brazilian Coffee Co',
    country: 'Brazil',
    city: 'São Paulo',
    contactEmail: 'contact@brazilcoffee.com',
    status: 'Active',
    createdAt: '2024-02-01',
  },
];

function loadCompanies(): Company[] {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return DEFAULT_COMPANIES;
}

function saveCompanies(companies: Company[]) {
  try {
    writeCollection(LS_KEY, companies);
  } catch (e) {}
}

export default function OperatorCompanies() {
  const [companies, setCompanies] = useState<Company[]>(() => loadCompanies());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  useEffect(() => {
    saveCompanies(companies);
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c =>
      (filterStatus === 'all' || c.status === filterStatus) &&
      (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) ||
       c.contactEmail.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, filterStatus, companies]);

  const handleAddCompany = (data: any) => {
    const newCompany: Company = {
      id: `comp-${String(Math.floor(Date.now() / 1000) % 10000).padStart(3, '0')}`,
      name: data.name,
      country: data.country || 'El Salvador',
      city: data.city || 'San Salvador',
      contactEmail: data.contactEmail,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCompanies([...companies, newCompany]);
    setShowNewCompanyModal(false);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowNewCompanyModal(true);
  };

  const handleSaveEdit = (data: any) => {
    if (!editingCompany) return;
    const updated = companies.map(c =>
      c.id === editingCompany.id
        ? { ...editingCompany, ...data }
        : c
    );
    setCompanies(updated);
    setShowNewCompanyModal(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Companies"
          description="Manage company profiles and configurations"
          onAddNew={() => { setEditingCompany(null); setShowNewCompanyModal(true); }}
          addNewLabel="New Company"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all', 'Active', 'Pending', 'Inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#0B1F3A] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Statuses' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => { setSearch(''); setFilterStatus('all'); }}
            className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm text-gray-600">Total Companies</div>
            <div className="text-2xl font-bold text-gray-900">{filteredCompanies.length}</div>
            <div className="text-xs text-gray-500 mt-1">All companies</div>
          </button>
          <button
            onClick={() => { setSearch(''); setFilterStatus('Active'); }}
            className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.status === 'Active').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active companies</div>
          </button>
          <button
            onClick={() => { setSearch(''); setFilterStatus('Pending'); }}
            className="p-4 rounded-lg border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {companies.filter(c => c.status === 'Pending').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
          </button>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm text-gray-600">Countries</div>
            <div className="text-2xl font-bold text-blue-600">{new Set(companies.map(c => c.country)).size}</div>
            <div className="text-xs text-gray-500 mt-1">Active regions</div>
          </div>
        </div>

        {/* Table section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader
            title="Companies"
            count={filteredCompanies.length}
            query={search}
            setQuery={setSearch}
            status={filterStatus}
            setStatus={setFilterStatus}
            statusOptions={['Active', 'Pending', 'Inactive'].map(s => ({ value: s, label: s }))}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">City</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-gray-800">{company.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{company.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{company.country}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{company.city}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{company.contactEmail}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            company.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : company.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{company.createdAt}</td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No companies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <NewRecordModal
        isOpen={showNewCompanyModal}
        onClose={() => { setShowNewCompanyModal(false); setEditingCompany(null); }}
        title={editingCompany ? 'Edit Company' : 'New Company'}
        entityType="company"
        onSubmit={editingCompany ? handleSaveEdit : handleAddCompany}
      />
    </>
  );
}
