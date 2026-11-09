import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Languages } from 'lucide-react';

type TabKey =
  | 'product_categories'
  | 'document_types'
  | 'packaging_units'
  | 'countries_locales'
  | 'user_groups'
  | 'companies'
  | 'users'
  | 'system_admin_rights'
  | 'business_admin_rights'
  | 'seller_rights'
  | 'agent_rights'
  | 'operations_rights'
  | 'allowed_currencies'
  | 'company_types'
  | 'allowed_languages'
  | 'movement_status'
  | 'transformation_status'
  | 'movement_types'
  | 'transformation_types';

interface Translation { language: string; value: string }

interface SystemTableEntry {
  id: string;
  key: string;
  translations: Translation[];
  isUsed: boolean;
  usageCount?: number;
}

interface DocumentType extends SystemTableEntry {
  description: string;
}

interface TransformationOrderType extends SystemTableEntry {
  description: string;
}

type RightEntry = { id: string; userId: string; from: string; to?: string; status: string; companyIds?: string[]; assignableByUser?: boolean };

type UserItem = { id: string; key: string; translations: Translation[]; isUsed: boolean; usageCount?: number; email?: string; groups?: string[]; phone?: string; twoFA?: string; preferredLanguage?: string; preferredCurrency?: string; userType?: string };
type CompanyItem = { id: string; key: string; translations: Translation[]; isUsed: boolean; usageCount?: number };

const TAB_LIST: [TabKey, string][] = [
  ['product_categories', 'Product Categories'],
  ['document_types', 'Document Types'],
  ['packaging_units', 'Packaging Units'],
  ['countries_locales', 'Countries & Locales'],
  ['user_groups', 'User Groups'],
  ['companies', 'Companies'],
  ['users', 'Users'],
  ['allowed_currencies', 'Allowed Currencies'],
  ['company_types', 'Company Types'],
  ['allowed_languages', 'Allowed Languages'],
  ['movement_status', 'Movement Status'],
  ['transformation_status', 'Transformation Status'],
  ['movement_types', 'Movement Types'],
  ['transformation_types', 'Transformation Types'],
];

const LS_PREFIX = 'sys_';

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

function saveLS<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // noop
  }
}

export const MOCK_PRODUCT_CATEGORIES: SystemTableEntry[] = [
  { id: '1', key: 'coffee', translations: [{ language: 'en', value: 'Coffee' }], isUsed: true, usageCount: 320 },
  { id: '2', key: 'tea', translations: [{ language: 'en', value: 'Tea' }], isUsed: true, usageCount: 285 },
];

export const MOCK_DOCUMENT_TYPES: DocumentType[] = [
  { id: '1', key: 'safety_certificate', translations: [{ language: 'en', value: 'Safety Certificate' }], description: 'Safety compliance', isUsed: true, usageCount: 12 },
];

export const MOCK_PACKAGING_UNITS = [ { id: 'PK1', unit: '60 KG' }, { id: 'PK2', unit: '1 KG' } ];

export const MOCK_COUNTRIES = [ { code: 'ES', name: 'Spain', locale: 'es-ES' }, { code: 'DE', name: 'Germany', locale: 'de-DE' } ];

export const MOCK_USER_GROUPS: CompanyItem[] = [ { id: 'g1', key: 'admins', translations: [{ language: 'en', value: 'Admins' }], isUsed: true, usageCount: 2 } ];

export const MOCK_COMPANIES: CompanyItem[] = [ { id: 'c1', key: 'acme', translations: [{ language: 'en', value: 'ACME Corp' }], isUsed: true, usageCount: 5 } ];

export const MOCK_USERS: UserItem[] = [
  { id: '1', key: 'peter', translations: [{ language: 'en', value: 'Peter' }], isUsed: true, usageCount: 1, email: 'peter.h@designstudio.example', phone: '+41 00000003', twoFA: 'Email', preferredLanguage: 'EN', preferredCurrency: 'EUR', userType: 'Frequent user', groups: ['g1'] },
  { id: '2', key: 'daniel', translations: [{ language: 'en', value: 'Daniel' }], isUsed: true, usageCount: 5, email: 'daniel.m@marketsell.com', phone: '+41 00000004', twoFA: 'Phone', preferredLanguage: 'FR', preferredCurrency: 'USD', userType: 'Occasional user', groups: ['g1'] },
  { id: '3', key: 'jonas', translations: [{ language: 'en', value: 'Jonas' }], isUsed: true, usageCount: 3, email: 'jonas.k@globaltrade.example', phone: '+41 00000005', twoFA: 'Email', preferredLanguage: 'ES', preferredCurrency: 'EUR', userType: 'Frequent user', groups: ['g1'] },
  { id: '4', key: 'alex', translations: [{ language: 'en', value: 'Alex' }], isUsed: true, usageCount: 2, email: 'alex.a@marketsell.com', phone: '+41 00000006', twoFA: 'Phone', preferredLanguage: 'EN', preferredCurrency: 'MDL', userType: 'Occasional user', groups: ['g1'] },
];

export const MOCK_MOVEMENT_STATUS: SystemTableEntry[] = [
  { id: '1', key: 'pending', translations: [{ language: 'en', value: 'Pending' }], isUsed: true, usageCount: 45 },
  { id: '2', key: 'in_progress', translations: [{ language: 'en', value: 'In Progress' }], isUsed: true, usageCount: 32 },
  { id: '3', key: 'completed', translations: [{ language: 'en', value: 'Completed' }], isUsed: true, usageCount: 128 },
  { id: '4', key: 'cancelled', translations: [{ language: 'en', value: 'Cancelled' }], isUsed: false, usageCount: 2 },
];

export const MOCK_TRANSFORMATION_STATUS: SystemTableEntry[] = [
  { id: '1', key: 'draft', translations: [{ language: 'en', value: 'Draft' }], isUsed: true, usageCount: 12 },
  { id: '2', key: 'scheduled', translations: [{ language: 'en', value: 'Scheduled' }], isUsed: true, usageCount: 8 },
  { id: '3', key: 'in_progress', translations: [{ language: 'en', value: 'In Progress' }], isUsed: true, usageCount: 24 },
  { id: '4', key: 'completed', translations: [{ language: 'en', value: 'Completed' }], isUsed: true, usageCount: 67 },
  { id: '5', key: 'failed', translations: [{ language: 'en', value: 'Failed' }], isUsed: false, usageCount: 1 },
];

export const MOCK_MOVEMENT_TYPES: SystemTableEntry[] = [
  { id: '1', key: 'goods_in', translations: [{ language: 'en', value: 'Goods In' }], isUsed: true, usageCount: 156 },
  { id: '2', key: 'goods_out', translations: [{ language: 'en', value: 'Goods Out' }], isUsed: true, usageCount: 89 },
  { id: '3', key: 'stock_adjustment', translations: [{ language: 'en', value: 'Stock Adjustment' }], isUsed: true, usageCount: 34 },
  { id: '4', key: 'return', translations: [{ language: 'en', value: 'Return' }], isUsed: true, usageCount: 12 },
  { id: '5', key: 'damaged', translations: [{ language: 'en', value: 'Damaged' }], isUsed: false, usageCount: 2 },
];

export const MOCK_TRANSFORMATION_TYPES: SystemTableEntry[] = [
  { id: '1', key: 'blending', translations: [{ language: 'en', value: 'Blending' }], isUsed: true, usageCount: 45 },
  { id: '2', key: 'bottling', translations: [{ language: 'en', value: 'Bottling' }], isUsed: true, usageCount: 67 },
  { id: '3', key: 'packaging', translations: [{ language: 'en', value: 'Packaging' }], isUsed: true, usageCount: 52 },
  { id: '4', key: 'labeling', translations: [{ language: 'en', value: 'Labeling' }], isUsed: true, usageCount: 58 },
  { id: '5', key: 'fermentation', translations: [{ language: 'en', value: 'Fermentation' }], isUsed: true, usageCount: 23 },
  { id: '6', key: 'aging', translations: [{ language: 'en', value: 'Aging' }], isUsed: true, usageCount: 18 },
];

export default function SystemTablesManagement() {
  const [activeTable, setActiveTable] = useState<TabKey>('product_categories');
  const [search, setSearch] = useState('');

  // per-table state
  const [productCategories, setProductCategories] = useState<SystemTableEntry[]>(() => loadLS(LS_PREFIX + 'product_categories', MOCK_PRODUCT_CATEGORIES));
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() => loadLS(LS_PREFIX + 'document_types', MOCK_DOCUMENT_TYPES));
  const [packagingUnits, setPackagingUnits] = useState<{id:string;unit:string}[]>(() => loadLS(LS_PREFIX + 'packaging_units', MOCK_PACKAGING_UNITS));
  const [countriesLocales, setCountriesLocales] = useState<{code:string;name:string;locale:string}[]>(() => loadLS(LS_PREFIX + 'countries_locales', MOCK_COUNTRIES));
  const [userGroups, setUserGroups] = useState<CompanyItem[]>(() => loadLS(LS_PREFIX + 'user_groups', MOCK_USER_GROUPS));
  const [companies, setCompanies] = useState<CompanyItem[]>(() => loadLS(LS_PREFIX + 'companies', MOCK_COMPANIES));
  const [users, setUsers] = useState<UserItem[]>(() => loadLS(LS_PREFIX + 'users', MOCK_USERS));
  const [movementStatus, setMovementStatus] = useState<SystemTableEntry[]>(() => loadLS(LS_PREFIX + 'movement_status', MOCK_MOVEMENT_STATUS));
  const [transformationStatus, setTransformationStatus] = useState<SystemTableEntry[]>(() => loadLS(LS_PREFIX + 'transformation_status', MOCK_TRANSFORMATION_STATUS));
  const [movementTypes, setMovementTypes] = useState<SystemTableEntry[]>(() => loadLS(LS_PREFIX + 'movement_types', MOCK_MOVEMENT_TYPES));
  const [transformationTypes, setTransformationTypes] = useState<SystemTableEntry[]>(() => loadLS(LS_PREFIX + 'transformation_types', MOCK_TRANSFORMATION_TYPES));

  // rights and lists
  const [systemAdminRights, setSystemAdminRights] = useState<RightEntry[]>(() => loadLS(LS_PREFIX + 'system_admin_rights', []));
  const [businessAdminRights, setBusinessAdminRights] = useState<RightEntry[]>(() => loadLS(LS_PREFIX + 'business_admin_rights', []));
  const [sellerRights, setSellerRights] = useState<RightEntry[]>(() => loadLS(LS_PREFIX + 'seller_rights', []));
  const [agentRights, setAgentRights] = useState<RightEntry[]>(() => loadLS(LS_PREFIX + 'agent_rights', []));
  const [operationsRights, setOperationsRights] = useState<RightEntry[]>(() => loadLS(LS_PREFIX + 'operations_rights', [ { id: 'op1', userId: '1', from: '2026-01-01', to: '', status: 'Active', companyIds: ['c1'] } ]));

  // company access requests (when someone tries to register a company that already exists)
  const [pendingCompanyRequests, setPendingCompanyRequests] = useState<{ id: string; companyId: string; companyName: string; requesterId: string; status: 'pending'|'approved'|'rejected'; createdAt: string }[]>(
    () => loadLS(LS_PREFIX + 'pending_company_requests', [])
  );

  const [allowedCurrencies, setAllowedCurrencies] = useState<string[]>(() => loadLS(LS_PREFIX + 'allowed_currencies', ['EUR','USD']));
  const [companyTypes, setCompanyTypes] = useState<string[]>(() => loadLS(LS_PREFIX + 'company_types', ['SRL','SA']));
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(() => loadLS(LS_PREFIX + 'allowed_languages', ['EN','ES']));

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [modalType, setModalType] = useState<'packaging'|'country'|'userform'|'rights'|'company'|'movement_status'|'transformation_status'|'movement_types'|'transformation_types'|null>(null);
  const [modalData, setModalData] = useState<any>({});

  // persist important arrays to localStorage
  useEffect(() => saveLS(LS_PREFIX + 'product_categories', productCategories), [productCategories]);
  useEffect(() => saveLS(LS_PREFIX + 'document_types', documentTypes), [documentTypes]);
  useEffect(() => saveLS(LS_PREFIX + 'packaging_units', packagingUnits), [packagingUnits]);
  useEffect(() => saveLS(LS_PREFIX + 'countries_locales', countriesLocales), [countriesLocales]);
  useEffect(() => saveLS(LS_PREFIX + 'user_groups', userGroups), [userGroups]);
  useEffect(() => saveLS(LS_PREFIX + 'companies', companies), [companies]);
  useEffect(() => saveLS(LS_PREFIX + 'users', users), [users]);
  useEffect(() => saveLS(LS_PREFIX + 'movement_status', movementStatus), [movementStatus]);
  useEffect(() => saveLS(LS_PREFIX + 'transformation_status', transformationStatus), [transformationStatus]);
  // Rights persistence and mutations are intentionally managed outside of this table manager.
  // This component should not write or persist rights entries (operations, system, business, seller, agent).
  useEffect(() => saveLS(LS_PREFIX + 'pending_company_requests', pendingCompanyRequests), [pendingCompanyRequests]);
  

  useEffect(() => saveLS(LS_PREFIX + 'allowed_currencies', allowedCurrencies), [allowedCurrencies]);
  useEffect(() => saveLS(LS_PREFIX + 'company_types', companyTypes), [companyTypes]);
  useEffect(() => saveLS(LS_PREFIX + 'allowed_languages', allowedLanguages), [allowedLanguages]);
  useEffect(() => saveLS(LS_PREFIX + 'movement_types', movementTypes), [movementTypes]);
  useEffect(() => saveLS(LS_PREFIX + 'transformation_types', transformationTypes), [transformationTypes]);

  const getCurrentData = () => {
    switch (activeTable) {
      case 'product_categories': return productCategories;
      case 'document_types': return documentTypes;
      case 'packaging_units': return packagingUnits;
      case 'countries_locales': return countriesLocales;
      case 'user_groups': return userGroups;
      case 'companies': return companies;
      case 'users': return users;
      case 'movement_status': return movementStatus;
      case 'transformation_status': return transformationStatus;
      case 'movement_types': return movementTypes;
      case 'transformation_types': return transformationTypes;
      case 'company_types': return companyTypes;
      case 'allowed_languages': return allowedLanguages;
      default: return [] as any[];
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return getCurrentData();
    const data = getCurrentData();
    return (data as any[]).filter(item => {
      if (typeof item === 'string') return item.toLowerCase().includes(q);
      if ('key' in item && item.key) return String(item.key).toLowerCase().includes(q) || (item.translations || []).some((t:any)=>t.value.toLowerCase().includes(q));
      if ('userId' in item) return String(item.userId).toLowerCase().includes(q);
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [activeTable, search, productCategories, documentTypes, packagingUnits, countriesLocales, userGroups, companies, users, movementStatus, transformationStatus, systemAdminRights, operationsRights, allowedCurrencies, companyTypes, allowedLanguages]);

  const openAdd = () => {
    if (activeTable === 'packaging_units') { setModalType('packaging'); setModalMode('add'); setModalData({ id:'', unit:'' }); setShowModal(true); }
    else if (activeTable === 'countries_locales') { setModalType('country'); setModalMode('add'); setModalData({ code:'', name:'', locale:'' }); setShowModal(true); }
    else if (activeTable === 'companies') { setModalType('company'); setModalMode('add'); setModalData({ id:'', name:'' }); setShowModal(true); }
    else if (activeTable === 'users') { setModalType('userform'); setModalMode('add'); setModalData({ id:'', key:'', name:'', email:'', groups:[] }); setShowModal(true); }
    else if (activeTable === 'movement_status') { setModalType('movement_status'); setModalMode('add'); setModalData({ id:'', key:'', name:'' }); setShowModal(true); }
    else if (activeTable === 'transformation_status') { setModalType('transformation_status'); setModalMode('add'); setModalData({ id:'', key:'', name:'' }); setShowModal(true); }
    else if (activeTable === 'movement_types') { setModalType('movement_types'); setModalMode('add'); setModalData({ id:'', key:'', name:'' }); setShowModal(true); }
    else if (activeTable === 'transformation_types') { setModalType('transformation_types'); setModalMode('add'); setModalData({ id:'', key:'', name:'' }); setShowModal(true); }
    else if (activeTable === 'operations_rights' || activeTable === 'system_admin_rights' || activeTable === 'business_admin_rights' || activeTable === 'seller_rights' || activeTable === 'agent_rights') {
      // Rights may only be managed from the Business Admin console. Make this view read-only for rights.
      alert('Rights are read-only in System Tables Management. Use the Business Admin console to create or edit rights.');
      return;
    }
  };

  const openEdit = (id: string) => {
    if (activeTable === 'packaging_units') {
      const p = packagingUnits.find(x=>x.id===id); if (p) { setModalType('packaging'); setModalMode('edit'); setModalData({ ...p }); setShowModal(true); }
    } else if (activeTable === 'countries_locales') {
      const c = countriesLocales.find(x=>x.code===id); if (c) { setModalType('country'); setModalMode('edit'); setModalData({ ...c }); setShowModal(true); }
    } else if (activeTable === 'companies') {
      const c = companies.find(x=>x.id===id); if (c) { setModalType('company'); setModalMode('edit'); setModalData({ id:c.id, name: c.translations?.[0]?.value || c.key }); setShowModal(true); }
    } else if (activeTable === 'users') {
      const u = users.find(x=>x.id===id); if (u) { setModalType('userform'); setModalMode('edit'); setModalData(u); setShowModal(true); }
    } else if (activeTable === 'movement_status') {
      const m = movementStatus.find(x=>x.id===id); if (m) { setModalType('movement_status'); setModalMode('edit'); setModalData({ id:m.id, key:m.key, name: m.translations?.[0]?.value || '' }); setShowModal(true); }
    } else if (activeTable === 'transformation_status') {
      const t = transformationStatus.find(x=>x.id===id); if (t) { setModalType('transformation_status'); setModalMode('edit'); setModalData({ id:t.id, key:t.key, name: t.translations?.[0]?.value || '' }); setShowModal(true); }
    } else if (activeTable === 'movement_types') {
      const m = movementTypes.find(x=>x.id===id); if (m) { setModalType('movement_types'); setModalMode('edit'); setModalData({ id:m.id, key:m.key, name: m.translations?.[0]?.value || '' }); setShowModal(true); }
    } else if (activeTable === 'transformation_types') {
      const t = transformationTypes.find(x=>x.id===id); if (t) { setModalType('transformation_types'); setModalMode('edit'); setModalData({ id:t.id, key:t.key, name: t.translations?.[0]?.value || '' }); setShowModal(true); }
    } else if (['operations_rights','system_admin_rights','business_admin_rights','seller_rights','agent_rights'].includes(activeTable)) {
      // Rights are read-only in this manager - edits are not permitted here.
      alert('Editing rights is not allowed in System Tables Management. Use the Business Admin console to modify rights.');
      return;
    }
  };

  // helper to open edit for a specific rights category (used when Business Admin shows all categories)
  const openEditRight = (id: string, rightsType: string) => {
  // Edits to rights are prohibited in this manager. Direct the user to the Business Admin console.
  alert('Open the Business Admin console to edit rights entries.');
  return;
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete entry?')) return;
    switch (activeTable) {
      case 'packaging_units': setPackagingUnits(prev => prev.filter(x=>x.id!==id)); break;
      case 'countries_locales': setCountriesLocales(prev => prev.filter(x=>x.code!==id)); break;
      case 'companies': setCompanies(prev => prev.filter(x=>x.id!==id)); break;
      case 'users': setUsers(prev => prev.filter(x=>x.id!==id)); break;
      case 'movement_status': setMovementStatus(prev => prev.filter(x=>x.id!==id)); break;
      case 'transformation_status': setTransformationStatus(prev => prev.filter(x=>x.id!==id)); break;
      case 'movement_types': setMovementTypes(prev => prev.filter(x=>x.id!==id)); break;
      case 'transformation_types': setTransformationTypes(prev => prev.filter(x=>x.id!==id)); break;
      // rights tables are managed by Business Admins elsewhere; no deletes allowed here.
      case 'operations_rights':
      case 'system_admin_rights':
      case 'business_admin_rights':
      case 'seller_rights':
      case 'agent_rights':
        alert('Deleting rights is not permitted from System Tables Management. Use the Business Admin console.');
        break;
      case 'allowed_currencies': setAllowedCurrencies(prev => prev.filter((_,i)=>String(i)!==id)); break;
      case 'company_types': setCompanyTypes(prev => prev.filter((_,i)=>String(i)!==id)); break;
      case 'allowed_languages': setAllowedLanguages(prev => prev.filter((_,i)=>String(i)!==id)); break;
      default: break;
    }
  };

  const approveRequest = (reqId: string) => {
    const req = pendingCompanyRequests.find(r => r.id === reqId); if (!req) return; 
  // Approve the request but do NOT auto-create rights from this manager.
  // Rights must be created by a Business Admin using the dedicated console.
  setPendingCompanyRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
  alert('Request approved. A Business Admin should create the necessary operations right for this user in the Business Admin console.');
  };

  const rejectRequest = (reqId: string) => {
    setPendingCompanyRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
  };

  const saveModal = () => {
    if (modalType === 'packaging') {
      const { id, unit } = modalData; if (!id || !unit) { alert('Provide id and unit'); return; }
      if (modalMode === 'add') setPackagingUnits(prev=>[...prev,{ id, unit }]); else setPackagingUnits(prev=>prev.map(x=>x.id===id?{id,unit}:x));
    } else if (modalType === 'country') {
      const { code, name, locale } = modalData; if (!code || !name || !locale) { alert('Provide code,name,locale'); return; }
      if (modalMode === 'add') setCountriesLocales(prev=>[...prev,{ code, name, locale }]); else setCountriesLocales(prev=>prev.map(x=>x.code===code?{code,name,locale}:x));
    } else if (modalType === 'company') {
      const { id, name } = modalData; if (!id || !name) { alert('Provide id and name'); return; }
      // prevent creating a company that already exists (by id or by name)
      const existsById = companies.some(c => c.id === id);
      const existsByName = companies.some(c => (c.translations?.[0]?.value || c.key || '').toLowerCase() === String(name).toLowerCase());
      if (modalMode === 'add' && (existsById || existsByName)) {
        // offer to create an access request instead of creating duplicate company
        const alreadyRequested = pendingCompanyRequests.some(r => r.companyId === id || r.companyName.toLowerCase() === String(name).toLowerCase());
        if (alreadyRequested) { alert('There is already a pending access request for this company.'); return; }
        if (confirm('This company already exists. Create an access request for the company administrator to grant you access?')) {
          const requesterId = users?.[0]?.id || modalData.requesterId || 'unknown';
          const req = { id: String(Date.now()), companyId: id, companyName: name, requesterId, status: 'pending' as const, createdAt: new Date().toISOString() };
          setPendingCompanyRequests(prev => [...prev, req]);
          alert('Access request created. An operations admin can approve it from the Companies section.');
          setShowModal(false);
          return;
        }
        return;
      }
      const mapped = { id, key: id, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0 };
      if (modalMode === 'add') setCompanies(prev=>[...prev,mapped]); else setCompanies(prev=>prev.map(x=>x.id===id?mapped:x));
    } else if (modalType === 'userform') {
      const { id, key, name, email, groups, phone, twoFA, preferredLanguage, preferredCurrency, userType } = modalData; if (!id || !key || !name || !email) { alert('Provide id,key,name,email'); return; }
      const mapped: UserItem = { id, key, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0, email, groups: groups || [], phone: phone || '', twoFA: twoFA || 'Email', preferredLanguage: preferredLanguage || 'EN', preferredCurrency: preferredCurrency || 'EUR', userType: userType || 'Occasional user' };
      if (modalMode === 'add') setUsers(prev=>[...prev,mapped]); else setUsers(prev=>prev.map(x=>x.id===id?{ ...mapped }:{ ...x }));
    } else if (modalType === 'movement_status') {
      const { id, key, name } = modalData; if (!id || !key || !name) { alert('Provide id, key, and name'); return; }
      const mapped: SystemTableEntry = { id, key, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0 };
      if (modalMode === 'add') setMovementStatus(prev=>[...prev,mapped]); else setMovementStatus(prev=>prev.map(x=>x.id===id?mapped:x));
    } else if (modalType === 'transformation_status') {
      const { id, key, name } = modalData; if (!id || !key || !name) { alert('Provide id, key, and name'); return; }
      const mapped: SystemTableEntry = { id, key, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0 };
      if (modalMode === 'add') setTransformationStatus(prev=>[...prev,mapped]); else setTransformationStatus(prev=>prev.map(x=>x.id===id?mapped:x));
    } else if (modalType === 'movement_types') {
      const { id, key, name } = modalData; if (!id || !key || !name) { alert('Provide id, key, and name'); return; }
      const mapped: SystemTableEntry = { id, key, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0 };
      if (modalMode === 'add') setMovementTypes(prev=>[...prev,mapped]); else setMovementTypes(prev=>prev.map(x=>x.id===id?mapped:x));
    } else if (modalType === 'transformation_types') {
      const { id, key, name } = modalData; if (!id || !key || !name) { alert('Provide id, key, and name'); return; }
      const mapped: SystemTableEntry = { id, key, translations: [{ language: 'en', value: name }], isUsed: false, usageCount: 0 };
      if (modalMode === 'add') setTransformationTypes(prev=>[...prev,mapped]); else setTransformationTypes(prev=>prev.map(x=>x.id===id?mapped:x));
    } else if (modalType === 'rights') {
      // Rights modifications are disabled from this manager. Manage rights from the Business Admin console.
      alert('Modifying rights is not supported from System Tables Management. Use the Business Admin console to add or edit rights.');
      setShowModal(false);
      return;
    }
    setShowModal(false);
  };

  const renderTableHeader = () => (
    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
      <div className="col-span-2">Key</div>
      <div className="col-span-4">Translations</div>
      <div className="col-span-2">Status</div>
      <div className="col-span-2">Usage Count</div>
      <div className="col-span-2 text-right">Actions</div>
    </div>
  );

  const renderRow = (item: any) => {
    const id = item.id || item.code || item;
    const key = item.key || item.code || item;
    const translations = item.translations || (item.unit ? [{ language: 'en', value: item.unit }] : []);
    const isUsed = item.isUsed || false;
    const usageCount = item.usageCount || 0;
    return (
      <div key={id} className="border-b border-gray-200 hover:bg-gray-50">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
          <div className="col-span-2"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{key}</code></div>
          <div className="col-span-4">
            <div className="space-y-1">{translations.map((t:any,idx:number)=> <div key={idx} className="text-sm text-gray-900">{t.value}</div>)}</div>
          </div>
          <div className="col-span-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${isUsed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {isUsed ? (<><Check className="w-3 h-3"/> Used</>) : (<><X className="w-3 h-3"/> Not Used</>)}
            </span>
          </div>
          <div className="col-span-2"><span className="text-sm font-medium text-gray-900">{usageCount}</span></div>
          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={()=>openEdit(id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Edit"><Edit2 className="w-4 h-4"/></button>
            <button onClick={()=>handleDelete(String(id))} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    );
  };

  const Modal = () => {
    if (!showModal || !modalType) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white rounded-lg shadow-lg w-[640px] p-6">
          <h3 className="text-lg font-semibold mb-4">{modalMode==='add' ? 'Add' : 'Edit'} {modalType}</h3>
          {modalType === 'packaging' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Unit</label>
              <input value={modalData.unit||''} onChange={e=>setModalData((d:any)=>({...d,unit:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}
          {modalType === 'country' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Code</label>
              <input value={modalData.code||''} onChange={e=>setModalData((d:any)=>({...d,code:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Locale</label>
              <input value={modalData.locale||''} onChange={e=>setModalData((d:any)=>({...d,locale:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}
          {modalType === 'company' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}

          {modalType === 'userform' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Username (key)</label>
              <input value={modalData.key||''} onChange={e=>setModalData((d:any)=>({...d,key:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Full name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Email</label>
              <input value={modalData.email||''} onChange={e=>setModalData((d:any)=>({...d,email:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Phone</label>
              <input value={modalData.phone||''} onChange={e=>setModalData((d:any)=>({...d,phone:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">2FA</label>
                  <select value={modalData.twoFA||'Email'} onChange={e=>setModalData((d:any)=>({...d,twoFA:e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option>Email</option>
                    <option>Phone</option>
                    <option>Authenticator</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Preferred Language</label>
                  <select value={modalData.preferredLanguage||'EN'} onChange={e=>setModalData((d:any)=>({...d,preferredLanguage:e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option>EN</option>
                    <option>ES</option>
                    <option>FR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Preferred Currency</label>
                  <select value={modalData.preferredCurrency||'EUR'} onChange={e=>setModalData((d:any)=>({...d,preferredCurrency:e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option>EUR</option>
                    <option>USD</option>
                    <option>MDL</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">User Type</label>
                  <select value={modalData.userType||'Occasional user'} onChange={e=>setModalData((d:any)=>({...d,userType:e.target.value}))} className="w-full border px-3 py-2 rounded">
                    <option>Frequent user</option>
                    <option>Occasional user</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {modalType === 'movement_status' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Key</label>
              <input value={modalData.key||''} onChange={e=>setModalData((d:any)=>({...d,key:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}

          {modalType === 'transformation_status' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Key</label>
              <input value={modalData.key||''} onChange={e=>setModalData((d:any)=>({...d,key:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}

          {modalType === 'movement_types' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Key</label>
              <input value={modalData.key||''} onChange={e=>setModalData((d:any)=>({...d,key:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}

          {modalType === 'transformation_types' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ID</label>
              <input value={modalData.id||''} onChange={e=>setModalData((d:any)=>({...d,id:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Key</label>
              <input value={modalData.key||''} onChange={e=>setModalData((d:any)=>({...d,key:e.target.value}))} className="w-full border px-3 py-2 rounded" />
              <label className="text-sm font-medium">Name</label>
              <input value={modalData.name||''} onChange={e=>setModalData((d:any)=>({...d,name:e.target.value}))} className="w-full border px-3 py-2 rounded" />
            </div>
          )}

          {modalType === 'rights' && (
            <div className="space-y-3">
              {/* rights type selector for Business Admin to choose category */}
              {(activeTable === 'business_admin_rights' || modalData.rightsType) && (
                <div>
                  <label className="text-sm font-medium">Rights Category</label>
                  <select value={modalData.rightsType||activeTable} onChange={e=>setModalData((d:any)=>({...d, rightsType: e.target.value}))} className="w-full border px-3 py-2 rounded mb-2">
                    <option value="operations_rights">Operations Rights</option>
                    <option value="system_admin_rights">System Admin Rights</option>
                    <option value="business_admin_rights">Business Admin Rights</option>
                    <option value="seller_rights">Seller Rights</option>
                    <option value="agent_rights">Agent Rights</option>
                  </select>
                </div>
              )}

              <label className="text-sm font-medium">User</label>
              <select value={modalData.userId||''} onChange={e=>setModalData((d:any)=>({...d,userId:e.target.value}))} className="w-full border px-3 py-2 rounded">
                <option value="">Select user</option>
                {users.map(u=> <option key={u.id} value={u.id}>{u.translations?.[0]?.value||u.key}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">From</label>
                  <input value={modalData.from||''} onChange={e=>setModalData((d:any)=>({...d,from:e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium">To</label>
                  <input value={modalData.to||''} onChange={e=>setModalData((d:any)=>({...d,to:e.target.value}))} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
              <label className="text-sm font-medium">Status</label>
              <select value={modalData.status||'Active'} onChange={e=>setModalData((d:any)=>({...d,status:e.target.value}))} className="w-full border px-3 py-2 rounded"><option>Active</option><option>Blocked</option></select>

              <label className="text-sm font-medium">Assign companies (for scoped/operator rights)</label>
              <div className="space-y-1 max-h-36 overflow-auto">
                {companies.map(c=> (
                  <label key={c.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={(modalData.companyIds||[]).includes(c.id)} onChange={e=>{
                      const prev = modalData.companyIds || [];
                      if (e.target.checked) setModalData((d:any)=>({...d, companyIds: Array.from(new Set([...prev, c.id]))}));
                      else setModalData((d:any)=>({...d, companyIds: prev.filter((x:any)=>x!==c.id)}));
                    }} />
                    <span className="text-sm">{c.translations?.[0]?.value || c.key}</span>
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={!!modalData.assignableByUser} onChange={e=>setModalData((d:any)=>({...d, assignableByUser: e.target.checked}))} />
                <span className="text-sm">Allow user self-assignment (creates requestable assignments)</span>
              </label>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={saveModal} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Tables Management</h1>
        <p className="text-gray-600">Configure system-wide categories, document types, transformation orders, and access rights</p>
      </div>

      {/* responsive selector: horizontal on desktop, select on mobile */}
      <div className="mb-4">
        <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
          {TAB_LIST.map(([key,label])=> (
            <button key={key} onClick={()=>setActiveTable(key)} className={`px-4 py-2 font-medium border-b-2 ${activeTable===key? 'border-blue-600 text-blue-600':'border-transparent text-gray-600 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <select value={activeTable} onChange={e=>setActiveTable(e.target.value as TabKey)} className="w-full border px-3 py-2 rounded">
            {TAB_LIST.map(([key,label])=> <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">{TAB_LIST.find(t=>t[0]===activeTable)?.[1]}</h2>
            <div className="ml-3 text-sm text-gray-500">{filtered.length} / {getCurrentData().length}</div>
          </div>
          <div className="flex items-center gap-3">
            <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="border px-3 py-2 rounded" />
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4"/>Add New</button>
          </div>
        </div>

        {(['product_categories','document_types','user_groups','companies','packaging_units','countries_locales','movement_status','transformation_status','movement_types','transformation_types'].includes(activeTable)) && renderTableHeader()}
        <div>
          {/* simple rendering for a variety of table types */}
          {activeTable === 'packaging_units' && packagingUnits.map(p=> renderRow({ id: p.id, key: p.id, unit: p.unit, translations: [{ language:'en', value: p.unit }], isUsed: false }))}
          {activeTable === 'countries_locales' && countriesLocales.map(c=> renderRow({ id: c.code, key: c.code, translations: [{ language: c.locale, value: c.name }], isUsed: false }))}
          {activeTable === 'user_groups' && userGroups.map(g=> renderRow(g))}
          {activeTable === 'companies' && companies.map(c=> renderRow(c))}
          {activeTable === 'companies' && pendingCompanyRequests.length>0 && (
            <div className="mt-4 border-t border-dashed pt-4 px-6">
              <h4 className="text-sm font-medium mb-2">Pending Company Access Requests</h4>
              <div className="space-y-3">
                {pendingCompanyRequests.map(r=> (
                  <div key={r.id} className="p-3 bg-gray-50 rounded flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{r.companyName} <span className="text-xs text-gray-500">({r.companyId})</span></div>
                      <div className="text-xs text-gray-500">Requested by: {r.requesterId} • {r.createdAt.split('T')[0]}</div>
                      <div className="text-xs text-gray-500">Status: {r.status}</div>
                    </div>
                    <div className="flex gap-2">
                      {r.status === 'pending' && <button onClick={()=>approveRequest(r.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>}
                      {r.status === 'pending' && <button onClick={()=>rejectRequest(r.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTable === 'users' && (
            <div>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                <div className="col-span-1">User Id</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Email</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-1">2FA</div>
                <div className="col-span-1">Lang</div>
                <div className="col-span-1">Curr</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              {users.map(u=> (
                <div key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm">
                    <div className="col-span-1"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{u.id}</code></div>
                    <div className="col-span-2"><div className="text-sm text-gray-900">{u.translations?.[0]?.value || u.key}</div></div>
                    <div className="col-span-2"><div className="text-sm text-gray-900">{u.email}</div></div>
                    <div className="col-span-2"><div className="text-sm text-gray-900">{u.phone || <span className="text-gray-400">—</span>}</div></div>
                    <div className="col-span-1"><div className="text-sm text-gray-900">{u.twoFA || '—'}</div></div>
                    <div className="col-span-1"><div className="text-sm text-gray-900">{u.preferredLanguage || '—'}</div></div>
                    <div className="col-span-1"><div className="text-sm text-gray-900">{u.preferredCurrency || '—'}</div></div>
                    <div className="col-span-1"><div className="text-sm text-gray-900">{u.userType || '—'}</div></div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <button onClick={()=>openEdit(u.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Edit"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(['system_admin_rights','business_admin_rights','seller_rights','agent_rights','operations_rights'].includes(activeTable)) && (
            <div>
              {activeTable === 'business_admin_rights' ? (
                <div className="space-y-6 px-3 py-3">
                  {([
                    ['system_admin_rights','System Admin Rights', systemAdminRights],
                    ['business_admin_rights','Business Admin Rights', businessAdminRights],
                    ['operations_rights','Operations Rights', operationsRights],
                    ['seller_rights','Seller Rights', sellerRights],
                    ['agent_rights','Agent Rights', agentRights],
                  ] as [string,string,RightEntry[]][]).map(([key,label,arr])=> (
                    <div key={String(key)} className="bg-white border rounded">
                      <div className="p-3 border-b flex items-center justify-between"><div className="font-medium">{String(label)}</div><div className="text-sm text-gray-500">{(arr || []).length}</div></div>
                      <div>
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-600">
                          <div className="col-span-2">User</div>
                          <div className="col-span-3">From</div>
                          <div className="col-span-3">To</div>
                          <div className="col-span-2">Status</div>
                          <div className="col-span-2 text-right">Actions</div>
                        </div>
                        {(arr as RightEntry[]).map((r:RightEntry)=> (
                          <div key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                              <div className="col-span-2"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{r.userId}</code></div>
                              <div className="col-span-3"><div className="text-sm text-gray-900">{r.from || '—'}</div></div>
                              <div className="col-span-3"><div className="text-sm text-gray-900">{r.to || '—'}</div></div>
                              <div className="col-span-2"><span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${r.status==='Active'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'}`}>{r.status}</span></div>
                              <div className="col-span-2 flex justify-end gap-2">
                                <button onClick={()=>openEditRight(r.id, String(key))} className="p-2 text-gray-600 hover:bg-gray-100 rounded">Edit</button>
                                <button onClick={()=>{ if(confirm('Delete entry?')){ alert('Deleting rights is disabled in this manager. Use the Business Admin console to remove rights.'); } }} className="p-2 text-red-600 hover:bg-red-50 rounded">Delete</button>
                              </div>
                            </div>
                            {r.companyIds && r.companyIds.length>0 && <div className="px-6 pb-4 text-sm text-gray-600">Scoped to companies: {r.companyIds.join(', ')}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                    <div className="col-span-2">User</div>
                    <div className="col-span-3">From</div>
                    <div className="col-span-3">To</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {(getCurrentData() as RightEntry[]).map(r=> (
                    <div key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                        <div className="col-span-2"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{r.userId}</code></div>
                        <div className="col-span-3"><div className="text-sm text-gray-900">{r.from || '—'}</div></div>
                        <div className="col-span-3"><div className="text-sm text-gray-900">{r.to || '—'}</div></div>
                        <div className="col-span-2"><span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${r.status==='Active'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-600'}`}>{r.status}</span></div>
                        <div className="col-span-2 flex justify-end gap-2"><button onClick={()=>openEdit(r.id)} className="p-2 text-gray-600 hover:bg-gray-100 rounded">Edit</button><button onClick={()=>handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">Delete</button></div>
                      </div>
                      {r.companyIds && r.companyIds.length>0 && <div className="px-6 pb-4 text-sm text-gray-600">Scoped to companies: {r.companyIds.join(', ')}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(['product_categories','document_types','movement_status','transformation_status','movement_types','transformation_types'].includes(activeTable)) && (getCurrentData() as any[]).map(i=> renderRow(i))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About System Tables</h3>
        <p className="text-sm text-blue-900">Rights can be scoped to companies (useful for operators who should only manage specific companies). Create rights entries and assign companies via the Rights modal.</p>
      </div>

      <Modal />
    </div>
  );
}
