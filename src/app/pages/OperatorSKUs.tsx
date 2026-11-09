import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { SKUS, PRODUCERS, stockMovements } from '../data/mockData';
import { loadFromLS, saveToLS } from '../utils/workflowHelpers';
import { NewRecordModal } from '../components/NewRecordModal';
import { Edit, Plus, X, Eye, FileText, ChevronDown, ChevronUp, Printer } from 'lucide-react';

export default function OperatorSKUs() {
  const [skuList, setSkuList] = useState<any[]>(() => loadFromLS('skus', SKUS as any[]));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showNewSKUModal, setShowNewSKUModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const [editingSKU, setEditingSKU] = useState<any>(null);
  const [printingLabel, setPrintingLabel] = useState<string | null>(null);
  
  // Editable SKU modal states
  const [editingProductDetails, setEditingProductDetails] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(false);
  const [editingStorage, setEditingStorage] = useState(false);
  const [editingDocuments, setEditingDocuments] = useState(false);
  
  // Form state for editable sections
  const [editedProductDetails, setEditedProductDetails] = useState<any>({});
  const [editedPackaging, setEditedPackaging] = useState<any>({});
  const [editedStorage, setEditedStorage] = useState<any>({});
  const [newDocumentName, setNewDocumentName] = useState('');
  const [newSKUForm, setNewSKUForm] = useState({
    skuCode: '',
    internalCode: '',
    eanBarcode: '',
    warehouseCode: '',
    productName: '',
    productLine: '',
    category: '',
    origin: '',
    originBatch: '',
    producer: '',
    company: '',
    packType: '',
    weight: '',
    size: '',
    pelletisation: 'no',
    pictures: '0',
    temperature: '',
    humidity: '',
    light: '',
    rack: 'no',
    warehouses: [] as string[]
  });

  const handlePrintEANLabel = (sku: any) => {
    setPrintingLabel('ean');
    // Simulate print
    setTimeout(() => {
      const printWindow = window.open('', '', 'width=600,height=400');
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <title>Print EAN Label - ${sku.skuName}</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: white; }
              .label { text-align: center; padding: 40px; border: 2px solid #333; width: 400px; }
              .title { font-size: 12px; font-weight: bold; margin-bottom: 15px; color: #666; }
              .sku-code { font-size: 14px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; }
              .barcode { font-size: 40px; font-family: 'Code39', monospace; letter-spacing: 3px; margin: 20px 0; font-weight: bold; }
              .ean { font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 4px; margin: 20px 0; }
              .internal { font-size: 11px; margin-top: 15px; }
              .product-name { font-size: 12px; font-weight: bold; margin-top: 10px; color: #2c3e50; }
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="title">EAN BARCODE LABEL</div>
              <div class="sku-code">${sku.skuName}</div>
              <div class="ean">${sku.eanBarcode}</div>
              <div class="barcode">|| || | | || || | | ||</div>
              <div class="internal"><strong>Internal Code:</strong> ${sku.internalCode}</div>
              <div class="product-name">${sku.productName}</div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      setPrintingLabel(null);
    }, 500);
  };

  const handlePrintWarehouseLabel = (sku: any) => {
    setPrintingLabel('warehouse');
    // Simulate print
    setTimeout(() => {
      const printWindow = window.open('', '', 'width=600,height=400');
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <title>Print Warehouse Label - ${sku.skuName}</title>
            <style>
              body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: white; }
              .label { text-align: center; padding: 40px; border: 2px solid #333; width: 400px; }
              .title { font-size: 12px; font-weight: bold; margin-bottom: 15px; color: #666; }
              .code-label { font-size: 11px; font-weight: bold; margin-bottom: 5px; color: #666; }
              .warehouse-code { font-size: 32px; font-weight: bold; font-family: monospace; margin: 20px 0; letter-spacing: 3px; }
              .barcode { font-size: 40px; font-family: 'Code39', monospace; letter-spacing: 3px; margin: 20px 0; font-weight: bold; }
              .sku { font-size: 13px; font-weight: bold; margin-top: 10px; font-family: monospace; }
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="title">WAREHOUSE LOCATION LABEL</div>
              <div class="code-label">Warehouse Code</div>
              <div class="warehouse-code">${sku.warehouseCode}</div>
              <div class="barcode">███████████</div>
              <div class="sku">SKU: ${sku.skuName}</div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      setPrintingLabel(null);
    }, 500);
  };

  const filteredSKUs = useMemo(() => {
    return skuList.filter(s =>
      (status === 'all' || s.status === status) &&
      (search === '' || s.sku.toLowerCase().includes(search.toLowerCase()) ||
       s.productName.toLowerCase().includes(search.toLowerCase()) ||
       s.producerName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [skuList, search, status]);

  const handleAddSKU = () => {
    setNewSKUForm({
      skuCode: '',
      internalCode: '',
      eanBarcode: '',
      warehouseCode: '',
      productName: '',
      productLine: '',
      category: '',
      origin: '',
      originBatch: '',
      producer: '',
      company: '',
      packType: '',
      weight: '',
      size: '',
      pelletisation: 'no',
      pictures: '0',
      temperature: '',
      humidity: '',
      light: '',
      rack: 'no',
      warehouses: []
    });
    setShowNewSKUModal(true);
  };

  const handleEditSKU = (sku: any) => {
    setEditingSKU(sku);
    setShowNewSKUModal(true);
  };

  const handleSaveEdit = (data: any) => {
    console.log('Saving SKU:', editingSKU ? 'Edit' : 'New', data);
    setShowNewSKUModal(false);
    setEditingSKU(null);
  };

  // Handler for updating product details
  const handleUpdateProductDetails = () => {
    if (selectedSKU) {
      const updatedSKU = {
        ...selectedSKU,
        ...editedProductDetails
      };
      setSelectedSKU(updatedSKU);
      setEditingProductDetails(false);
      // Persist to localStorage
      const skus = loadFromLS('skus', SKUS as any[]);
      const index = skus.findIndex((s: any) => s.id === selectedSKU.id);
      if (index !== -1) {
        skus[index] = updatedSKU;
        saveToLS('skus', skus);
        setSkuList(skus);
      }
    }
  };

  // Handler for updating packaging information
  const handleUpdatePackaging = () => {
    if (selectedSKU) {
      const updatedSKU = {
        ...selectedSKU,
        ...editedPackaging
      };
      setSelectedSKU(updatedSKU);
      setEditingPackaging(false);
      // Persist to localStorage
      const skus = loadFromLS('skus', SKUS as any[]);
      const index = skus.findIndex((s: any) => s.id === selectedSKU.id);
      if (index !== -1) {
        skus[index] = updatedSKU;
        saveToLS('skus', skus);
        setSkuList(skus);
      }
    }
  };

  // Handler for updating storage conditions
  const handleUpdateStorage = () => {
    if (selectedSKU) {
      const updatedSKU = {
        ...selectedSKU,
        ...editedStorage
      };
      setSelectedSKU(updatedSKU);
      setEditingStorage(false);
      // Persist to localStorage
      const skus = loadFromLS('skus', SKUS as any[]);
      const index = skus.findIndex((s: any) => s.id === selectedSKU.id);
      if (index !== -1) {
        skus[index] = updatedSKU;
        saveToLS('skus', skus);
        setSkuList(skus);
      }
    }
  };

  // Handler for adding document
  const handleAddDocument = () => {
    if (selectedSKU && newDocumentName.trim()) {
      const newDocument = {
        date: new Date().toLocaleDateString(),
        type: 'Certificate',
        name: newDocumentName.trim()
      };
      const updatedDocuments = [...(selectedSKU.documents || []), newDocument];
      const updatedSKU = {
        ...selectedSKU,
        documents: updatedDocuments
      };
      setSelectedSKU(updatedSKU);
      setNewDocumentName('');
      // Persist to localStorage
      const skus = loadFromLS('skus', SKUS as any[]);
      const index = skus.findIndex((s: any) => s.id === selectedSKU.id);
      if (index !== -1) {
        skus[index] = updatedSKU;
        saveToLS('skus', skus);
        setSkuList(skus);
      }
    }
  };

  // Handler for removing document
  const handleRemoveDocument = (index: number) => {
    if (selectedSKU) {
      const updatedDocuments = selectedSKU.documents.filter((_: any, i: number) => i !== index);
      const updatedSKU = {
        ...selectedSKU,
        documents: updatedDocuments
      };
      setSelectedSKU(updatedSKU);
      // Persist to localStorage
      const skus = loadFromLS('skus', SKUS as any[]);
      const skuIndex = skus.findIndex((s: any) => s.id === selectedSKU.id);
      if (skuIndex !== -1) {
        skus[skuIndex] = updatedSKU;
        saveToLS('skus', skus);
        setSkuList(skus);
      }
    }
  };

  const quickActionsData = [
    { icon: '📦', label: 'Total SKUs', value: skuList.length, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { icon: '✅', label: 'Selling', value: skuList.filter(s => s.status === 'selling').length, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { icon: '📦', label: 'Green Coffee', value: skuList.filter(s => s.productLine === 'Green Coffee').length, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
  ];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Registered SKUs"
          description="Manage product SKUs, variants and their registration details."
          onAddNew={handleAddSKU}
          addNewLabel="New SKU"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-2">
            {['all', 'selling', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActionsData.map((action, index) => (
            <div key={index} className={`${action.bgColor} rounded-lg border border-gray-200 p-4`}>
              <div className="text-sm text-gray-600 mb-2">{action.label}</div>
              <div className={`text-2xl font-bold ${action.textColor}`}>{action.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm !compact">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SKU Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Producer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product Line</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Pack Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Registered Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky right-0 z-10 bg-gray-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSKUs.length > 0 ? (
                  filteredSKUs.map((sku, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSKU(sku)}>
                      <td className="px-4 py-3 text-xs text-gray-900 sticky left-0 z-10 bg-white hover:bg-gray-50 font-medium">{sku.sku}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.productName}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.producerName}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.productLine}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.origin}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.pack}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sku.status === 'selling'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'}`}>
                          {sku.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{sku.registeredDate}</td>
                      <td className="px-4 py-3 text-xs sticky right-0 z-10 bg-white hover:bg-gray-50" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditSKU(sku)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No SKUs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed SKU Modal */}
      {selectedSKU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Internal Code</span>
                    <p className="text-red-600 font-bold text-lg">{selectedSKU.internalCode}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">SKU</span>
                    <p className="text-gray-900 font-bold text-lg">{selectedSKU.skuName}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-green-600 mt-2">{selectedSKU.productName}</h2>
              </div>
              <button onClick={() => setSelectedSKU(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Key Identifiers */}
              <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase">EAN Barcode</span>
                  <p className="font-mono text-sm text-gray-900 font-bold mt-1">{selectedSKU.eanBarcode}</p>
                  <p className="text-xs text-gray-600 mt-2"><strong>Internal:</strong> {selectedSKU.internalCode}</p>
                  <button 
                    onClick={() => handlePrintEANLabel(selectedSKU)}
                    disabled={printingLabel === 'ean'}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-2 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Printer size={12} /> {printingLabel === 'ean' ? 'Printing...' : 'Print Label'}
                  </button>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase">Product Barcode</span>
                  <p className="font-mono text-xs text-gray-600 font-bold mt-1">{selectedSKU.barcode}</p>
                  <div className="mt-2 h-12 bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 font-bold">
                    {/* Simple ASCII barcode representation */}
                    <span style={{fontFamily: 'monospace', letterSpacing: '2px'}}>|| || | | ||</span>
                  </div>
                  <button 
                    onClick={() => handlePrintEANLabel(selectedSKU)}
                    disabled={printingLabel === 'ean'}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-2 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Printer size={12} /> {printingLabel === 'ean' ? 'Printing...' : 'Print Label'}
                  </button>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase">Warehouse Code</span>
                  <p className="font-mono text-xs text-gray-600 font-bold mt-1">{selectedSKU.warehouseCode}</p>
                  <div className="mt-2 h-12 bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 font-bold">
                    <span style={{fontFamily: 'monospace', letterSpacing: '2px'}}>█████████</span>
                  </div>
                  <button 
                    onClick={() => handlePrintWarehouseLabel(selectedSKU)}
                    disabled={printingLabel === 'warehouse'}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-2 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Printer size={12} /> {printingLabel === 'warehouse' ? 'Printing...' : 'Print Label'}
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <legend className="text-sm font-bold text-gray-900 px-2">Product Details</legend>
                  <button onClick={() => {
                    if (editingProductDetails) {
                      handleUpdateProductDetails();
                    } else {
                      setEditedProductDetails({
                        product: selectedSKU.product,
                        productLine: selectedSKU.productLine,
                        productCategory: selectedSKU.productCategory,
                        origin: selectedSKU.origin,
                        producerName: selectedSKU.producerName
                      });
                      setEditingProductDetails(true);
                    }
                  }} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${editingProductDetails ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {editingProductDetails ? 'Save' : 'Edit'}
                  </button>
                </div>
                {editingProductDetails ? (
                  <div className="grid grid-cols-2 gap-4 text-sm space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Product</label>
                      <input type="text" value={editedProductDetails.product || ''} onChange={(e) => setEditedProductDetails({...editedProductDetails, product: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Product Line</label>
                      <input type="text" value={editedProductDetails.productLine || ''} onChange={(e) => setEditedProductDetails({...editedProductDetails, productLine: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                      <input type="text" value={editedProductDetails.productCategory || ''} onChange={(e) => setEditedProductDetails({...editedProductDetails, productCategory: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Origin</label>
                      <input type="text" value={editedProductDetails.origin || ''} onChange={(e) => setEditedProductDetails({...editedProductDetails, origin: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Producer</label>
                      <input type="text" value={editedProductDetails.producerName || ''} onChange={(e) => setEditedProductDetails({...editedProductDetails, producerName: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Product:</strong> {selectedSKU.product}</p>
                    <p><strong>Product Line:</strong> {selectedSKU.productLine}</p>
                    <p><strong>Category:</strong> {selectedSKU.productCategory}</p>
                    <p><strong>Origin:</strong> {selectedSKU.origin}</p>
                    <p className="col-span-2"><strong>Producer:</strong> {selectedSKU.producerName}</p>
                    <p className="col-span-2"><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedSKU.status === 'selling' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{selectedSKU.status === 'selling' ? 'Active - Selling' : 'Pending approval'}</span></p>
                  </div>
                )}
              </fieldset>

              {/* Packaging Image */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm mb-3">Packaging Image</h3>
                <div className="flex gap-4 items-start">
                  <div className="w-40 h-40 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-xs text-gray-500 font-semibold">Coffee Package</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-gray-600">Upload or view packaging images for this SKU.</p>
                    <button className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 font-semibold">Upload Image</button>
                  </div>
                </div>
              </div>

              {/* Packaging Information */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <legend className="text-sm font-bold text-gray-900 px-2">Packaging Information</legend>
                  <button onClick={() => {
                    if (editingPackaging) {
                      handleUpdatePackaging();
                    } else {
                      setEditedPackaging({
                        pack: selectedSKU.pack,
                        weight: selectedSKU.weight,
                        size: selectedSKU.size,
                        pelletisation: selectedSKU.pelletisation
                      });
                      setEditingPackaging(true);
                    }
                  }} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${editingPackaging ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {editingPackaging ? 'Save' : 'Edit'}
                  </button>
                </div>
                {editingPackaging ? (
                  <div className="grid grid-cols-2 gap-4 text-sm space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Pack Type</label>
                      <input type="text" value={editedPackaging.pack || ''} onChange={(e) => setEditedPackaging({...editedPackaging, pack: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Weight (kg)</label>
                      <input type="text" value={editedPackaging.weight || ''} onChange={(e) => setEditedPackaging({...editedPackaging, weight: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Size</label>
                      <input type="text" value={editedPackaging.size || ''} onChange={(e) => setEditedPackaging({...editedPackaging, size: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Pelletisation</label>
                      <input type="text" value={editedPackaging.pelletisation || ''} onChange={(e) => setEditedPackaging({...editedPackaging, pelletisation: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Pack Type:</strong> {selectedSKU.pack}</p>
                    <p><strong>Weight:</strong> {selectedSKU.weight} kg</p>
                    <p><strong>Size:</strong> {selectedSKU.size}</p>
                    <p><strong>Pelletisation:</strong> {selectedSKU.pelletisation}</p>
                  </div>
                )}
              </fieldset>

              {/* Storage Conditions */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <legend className="text-sm font-bold text-gray-900 px-2">Storage Conditions</legend>
                  <button onClick={() => {
                    if (editingStorage) {
                      handleUpdateStorage();
                    } else {
                      setEditedStorage({
                        temp: selectedSKU.temp,
                        humidity: selectedSKU.humidity,
                        light: selectedSKU.light,
                        rack: selectedSKU.rack
                      });
                      setEditingStorage(true);
                    }
                  }} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${editingStorage ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {editingStorage ? 'Save' : 'Edit'}
                  </button>
                </div>
                {editingStorage ? (
                  <div className="grid grid-cols-2 gap-4 text-sm space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Temperature</label>
                      <input type="text" value={editedStorage.temp || ''} onChange={(e) => setEditedStorage({...editedStorage, temp: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Humidity</label>
                      <input type="text" value={editedStorage.humidity || ''} onChange={(e) => setEditedStorage({...editedStorage, humidity: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Light</label>
                      <input type="text" value={editedStorage.light || ''} onChange={(e) => setEditedStorage({...editedStorage, light: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Rack</label>
                      <input type="text" value={editedStorage.rack || ''} onChange={(e) => setEditedStorage({...editedStorage, rack: e.target.value})} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Temperature:</strong> {selectedSKU.temp}</p>
                    <p><strong>Humidity:</strong> {selectedSKU.humidity}</p>
                    <p><strong>Light:</strong> {selectedSKU.light}</p>
                    <p><strong>Rack:</strong> {selectedSKU.rack}</p>
                  </div>
                )}
              </fieldset>

              {/* Warehouses - Auto-populated from Stock Movements */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3 bg-blue-50">
                <legend className="text-sm font-bold text-gray-900 px-2">📍 Warehouses Using This SKU</legend>
                <div className="text-xs text-gray-600 mb-2">
                  ℹ️ Auto-populated from stock movements
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Get warehouses from stock movements for this SKU
                    const warehousesForSKU = Array.from(new Set(
                      stockMovements
                        .filter(m => m.skuId === selectedSKU.id)
                        .map(m => m.warehouseId)
                    ));

                    if (warehousesForSKU.length === 0) {
                      return <p className="text-xs text-gray-600 italic">No stock movements recorded yet</p>;
                    }

                    return warehousesForSKU.map(w => (
                      <span key={w} className="px-3 py-1 bg-white border border-blue-200 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {w}
                      </span>
                    ));
                  })()}
                </div>
              </fieldset>

              {/* Documents */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm">Documents & Certificates</h3>
                  <button onClick={() => {
                    if (editingDocuments) {
                      setEditingDocuments(false);
                    } else {
                      setEditingDocuments(true);
                    }
                  }} className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${editingDocuments ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {editingDocuments ? 'Done' : 'Edit'}
                  </button>
                </div>
                {editingDocuments && (
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddDocument()} placeholder="Document name" className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm" />
                    <button onClick={handleAddDocument} className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-semibold">+ Add</button>
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Document Name</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedSKU.documents && selectedSKU.documents.map((doc: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">{doc.date}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">{doc.type}</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">{doc.name}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          {editingDocuments && (
                            <button onClick={() => handleRemoveDocument(i)} className="text-gray-400 hover:text-red-600 transition-colors"><X size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-between border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm">📋 Traceability Report</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 text-sm">📊 Stock Movements</button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2 text-sm">🔗 Compatible Products</button>
                </div>
                <button onClick={() => setSelectedSKU(null)} className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New SKU Comprehensive Form Modal */}
      {showNewSKUModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New SKU</h2>
              <button onClick={() => setShowNewSKUModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <form className="px-6 py-4 space-y-6">
              {/* SKU Identification */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                <legend className="text-sm font-bold text-gray-900 px-2">SKU Identification</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKU Code *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., GC-COL-001" value={newSKUForm.skuCode} onChange={(e) => setNewSKUForm({...newSKUForm, skuCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Internal Code *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., CO-345" value={newSKUForm.internalCode} onChange={(e) => setNewSKUForm({...newSKUForm, internalCode: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">EAN Barcode</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="1234567890123" value={newSKUForm.eanBarcode} onChange={(e) => setNewSKUForm({...newSKUForm, eanBarcode: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Warehouse Code</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., JA482" value={newSKUForm.warehouseCode} onChange={(e) => setNewSKUForm({...newSKUForm, warehouseCode: e.target.value})} />
                  </div>
                </div>
              </fieldset>

              {/* Product Information */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                <legend className="text-sm font-bold text-gray-900 px-2">Product Information</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKU Name *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., Colombian Supremo" value={newSKUForm.productName} onChange={(e) => setNewSKUForm({...newSKUForm, productName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Line *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., Green Coffee" value={newSKUForm.productLine} onChange={(e) => setNewSKUForm({...newSKUForm, productLine: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., Green Coffee" value={newSKUForm.category} onChange={(e) => setNewSKUForm({...newSKUForm, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Origin *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., Colombia" value={newSKUForm.origin} onChange={(e) => setNewSKUForm({...newSKUForm, origin: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Origin Batch</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., LOT-2024-001" value={newSKUForm.originBatch} onChange={(e) => setNewSKUForm({...newSKUForm, originBatch: e.target.value})} />
                  </div>
                </div>
              </fieldset>

              {/* Producer & Company */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                <legend className="text-sm font-bold text-gray-900 px-2">Producer & Company</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Producer *</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newSKUForm.producer} onChange={(e) => setNewSKUForm({...newSKUForm, producer: e.target.value})}>
                      <option value="">Select Producer</option>
                      {PRODUCERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Company *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Select Company" value={newSKUForm.company} onChange={(e) => setNewSKUForm({...newSKUForm, company: e.target.value})} />
                  </div>
                </div>
              </fieldset>

              {/* Packaging Details */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                <legend className="text-sm font-bold text-gray-900 px-2">Packaging Details</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pack Type *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., 60kg" value={newSKUForm.packType} onChange={(e) => setNewSKUForm({...newSKUForm, packType: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (kg) *</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="60" value={newSKUForm.weight} onChange={(e) => setNewSKUForm({...newSKUForm, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Size/Dimensions *</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., 60 x 80 x 40 cm" value={newSKUForm.size} onChange={(e) => setNewSKUForm({...newSKUForm, size: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pelletisation</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newSKUForm.pelletisation} onChange={(e) => setNewSKUForm({...newSKUForm, pelletisation: e.target.value})}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Storage Conditions */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
                <legend className="text-sm font-bold text-gray-900 px-2">Storage Conditions</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Temperature</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., 15°C / 25°C" value={newSKUForm.temperature} onChange={(e) => setNewSKUForm({...newSKUForm, temperature: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Humidity</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., 45% / 80%" value={newSKUForm.humidity} onChange={(e) => setNewSKUForm({...newSKUForm, humidity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Light</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g., No light" value={newSKUForm.light} onChange={(e) => setNewSKUForm({...newSKUForm, light: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rack</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={newSKUForm.rack} onChange={(e) => setNewSKUForm({...newSKUForm, rack: e.target.value})}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Warehouses - Auto-populated from Stock Movements */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                <legend className="text-sm font-bold text-gray-900 px-2">📍 Warehouses Using This SKU</legend>
                <div className="text-xs text-gray-600 mb-3">
                  ℹ️ Automatically populated from stock movements. Warehouses below have recorded transactions for this SKU.
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Get warehouses from stock movements for this SKU
                    const warehousesForSKU = Array.from(new Set(
                      stockMovements
                        .filter(m => m.skuId === newSKUForm.internalCode)
                        .map(m => m.warehouseId)
                    ));

                    if (warehousesForSKU.length === 0) {
                      return <p className="text-sm text-gray-600 italic">No stock movements recorded yet for this SKU</p>;
                    }

                    return warehousesForSKU.map(w => (
                      <div key={w} className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm text-gray-700 font-medium">{w}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          ({stockMovements.filter(m => m.skuId === newSKUForm.internalCode && m.warehouseId === w).length} movements)
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </fieldset>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                <button onClick={() => setShowNewSKUModal(false)} type="button" className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={() => { console.log('Creating SKU:', newSKUForm); setShowNewSKUModal(false); }} type="button" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Create SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
