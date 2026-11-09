import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import formatNumber from '../utils/numberFormat';
import { writeCollection } from '../../lib/backend/storage';

const CATEGORIES = [
  { id: 'PC1', name: 'Green Coffee' },
  { id: 'PC2', name: 'Roasted Coffee' },
  { id: 'PC3', name: 'Specialty Coffee' },
];

const DOC_TYPES = [
  { id: 'DT1', name: 'Invoice' },
  { id: 'DT2', name: 'Packing List' },
];

const PACKAGING = [
  { id: 'PK1', unit: '60 KG' },
  { id: 'PK2', unit: '1 KG' },
  { id: 'PK3', unit: '250 G' },
];

const COUNTRIES = [
  { code: 'ES', name: 'Spain', locale: 'es-ES' },
  { code: 'DE', name: 'Germany', locale: 'de-DE' },
  { code: 'ET', name: 'Ethiopia', locale: 'am-ET' },
];

const TRANSFORMATION_TYPES = [
  { id: 'TT1', name: 'Roasting' },
  { id: 'TT2', name: 'Grinding' },
  { id: 'TT3', name: 'Blending' },
  { id: 'TT4', name: 'Repackaging' },
];

const STOCK_MOVEMENT_TYPES = [
  { code: 'GOODS_IN', label: 'Goods In' },
  { code: 'GOODS_OUT', label: 'Goods Out' },
  { code: 'INITIAL_INVENTORY', label: 'Initial Inventory' },
  { code: 'INVENTORY_CORRECTION', label: 'Inventory Correction' },
];

export default function SystemAdminTables() {
  const [activeTab, setActiveTab] = useState<'categories' | 'docs' | 'packaging' | 'countries' | 'transformations' | 'movements'>('categories');

  // hydrate from localStorage or fall back to defaults
  const [categories, setCategories] = useState(() => {
    try { const v = localStorage.getItem('sys_categories'); return v ? JSON.parse(v) : CATEGORIES; } catch { return CATEGORIES; }
  });
  const [docTypes, setDocTypes] = useState(() => {
    try { const v = localStorage.getItem('sys_doc_types'); return v ? JSON.parse(v) : DOC_TYPES; } catch { return DOC_TYPES; }
  });
  const [packaging, setPackaging] = useState(() => {
    try { const v = localStorage.getItem('sys_packaging'); return v ? JSON.parse(v) : PACKAGING; } catch { return PACKAGING; }
  });
  const [countries, setCountries] = useState(() => {
    try { const v = localStorage.getItem('sys_countries'); return v ? JSON.parse(v) : COUNTRIES; } catch { return COUNTRIES; }
  });
  const [transformationTypes, setTransformationTypes] = useState(() => {
    try { const v = localStorage.getItem('sys_transformation_types'); return v ? JSON.parse(v) : TRANSFORMATION_TYPES; } catch { return TRANSFORMATION_TYPES; }
  });
  const [stockMovementTypes, setStockMovementTypes] = useState(() => {
    try { const v = localStorage.getItem('sys_stock_movement_types'); return v ? JSON.parse(v) : STOCK_MOVEMENT_TYPES; } catch { return STOCK_MOVEMENT_TYPES; }
  });

  useEffect(() => { try { writeCollection('sys_categories', categories); } catch {} }, [categories]);
  useEffect(() => { try { writeCollection('sys_doc_types', docTypes); } catch {} }, [docTypes]);
  useEffect(() => { try { writeCollection('sys_packaging', packaging); } catch {} }, [packaging]);
  useEffect(() => { try { writeCollection('sys_countries', countries); } catch {} }, [countries]);
  useEffect(() => { try { writeCollection('sys_transformation_types', transformationTypes); } catch {} }, [transformationTypes]);
  useEffect(() => { try { writeCollection('sys_stock_movement_types', stockMovementTypes); } catch {} }, [stockMovementTypes]);

  // UI state for CRUD
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded ${activeTab === 'categories' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Product Categories
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-2 rounded ${activeTab === 'docs' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Document Types
          </button>
          <button
            onClick={() => setActiveTab('packaging')}
            className={`px-3 py-2 rounded ${activeTab === 'packaging' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Packaging Units
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`px-3 py-2 rounded ${activeTab === 'countries' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Countries & Locales
          </button>
          <button
            onClick={() => setActiveTab('transformations')}
            className={`px-3 py-2 rounded ${activeTab === 'transformations' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Transformation Types
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-2 rounded ${activeTab === 'movements' ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Stock Movement Types
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Product Categories</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Category</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { setCategories(prev => [...prev, { id: `PC${Date.now()}`, name: newName.trim() }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {categories.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{editingId === c.id ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : c.name}</TableCell>
                    <TableCell>
                      {editingId === c.id ? (
                        <>
                          <button onClick={() => { setCategories(prev => prev.map(p => p.id === c.id ? { ...p, name: editingValue } : p)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(c.id); setEditingValue(c.name); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setCategories(prev => prev.filter(x => x.id !== c.id))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Document Types</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Doc Type</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { setDocTypes(prev => [...prev, { id: `DT${Date.now()}`, name: newName.trim() }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {docTypes.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{editingId === d.id ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : d.name}</TableCell>
                    <TableCell>
                      {editingId === d.id ? (
                        <>
                          <button onClick={() => { setDocTypes(prev => prev.map(p => p.id === d.id ? { ...p, name: editingValue } : p)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(d.id); setEditingValue(d.name); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setDocTypes(prev => prev.filter(x => x.id !== d.id))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'packaging' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Packaging Units</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Packaging</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Unit" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { setPackaging(prev => [...prev, { id: `PK${Date.now()}`, unit: newName.trim() }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>ID</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {packaging.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{editingId === p.id ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : p.unit}</TableCell>
                    <TableCell>
                      {editingId === p.id ? (
                        <>
                          <button onClick={() => { setPackaging(prev => prev.map(x => x.id === p.id ? { ...x, unit: editingValue } : x)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(p.id); setEditingValue(p.unit); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setPackaging(prev => prev.filter(x => x.id !== p.id))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'countries' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Countries & Locales</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Country</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. Spain|es-ES)" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { const [name, locale] = newName.split('|').map(s => s.trim()); setCountries(prev => [...prev, { code: `C${Date.now()}`, name: name || newName, locale: locale || 'en-US' }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {countries.map(c => (
                  <TableRow key={c.code}>
                    <TableCell>{c.code}</TableCell>
                    <TableCell>{editingId === c.code ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : c.name}</TableCell>
                    <TableCell>{c.locale}</TableCell>
                    <TableCell>
                      {editingId === c.code ? (
                        <>
                          <button onClick={() => { setCountries(prev => prev.map(x => x.code === c.code ? { ...x, name: editingValue } : x)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(c.code); setEditingValue(c.name); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setCountries(prev => prev.filter(x => x.code !== c.code))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'transformations' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Transformation Types</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Type</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { setTransformationTypes(prev => [...prev, { id: `TT${Date.now()}`, name: newName.trim() }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {transformationTypes.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{editingId === t.id ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : t.name}</TableCell>
                    <TableCell>
                      {editingId === t.id ? (
                        <>
                          <button onClick={() => { setTransformationTypes(prev => prev.map(p => p.id === t.id ? { ...p, name: editingValue } : p)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(t.id); setEditingValue(t.name); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setTransformationTypes(prev => prev.filter(x => x.id !== t.id))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Stock Movement Types</h3>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAdding(true); setNewName(''); }} className="px-3 py-1 bg-blue-600 text-white rounded">Add Type</button>
              {adding && (
                <div className="flex items-center gap-2">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Label (e.g., Goods In)" className="px-2 py-1 border rounded" />
                  <button onClick={() => { if (newName.trim()) { setStockMovementTypes(prev => [...prev, { code: `SMT_${Date.now()}`, label: newName.trim() }]); setAdding(false); setNewName(''); } }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                  <button onClick={() => setAdding(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Code</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {stockMovementTypes.map(m => (
                  <TableRow key={m.code}>
                    <TableCell className="font-mono text-sm text-gray-600">{m.code}</TableCell>
                    <TableCell>{editingId === m.code ? <input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : m.label}</TableCell>
                    <TableCell>
                      {editingId === m.code ? (
                        <>
                          <button onClick={() => { setStockMovementTypes(prev => prev.map(p => p.code === m.code ? { ...p, label: editingValue } : p)); setEditingId(null); setEditingValue(''); }} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => { setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(m.code); setEditingValue(m.label); }} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => setStockMovementTypes(prev => prev.filter(x => x.code !== m.code))} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
