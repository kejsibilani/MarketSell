import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityType: 'company' | 'stock' | 'producer' | 'restocking' | 'shipment' | 'sku' | 'user';
  onSubmit: (data: any) => void;
}

export function NewRecordModal({ isOpen, onClose, title, entityType, onSubmit }: NewRecordModalProps) {
  const [formData, setFormData] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({});
    onClose();
  };

  if (!isOpen) return null;

  const renderFields = () => {
    switch (entityType) {
      case 'company':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" placeholder="Enter company name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <option value="">Select type</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Address</label>
              <input type="text" placeholder="Enter address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
              <input type="text" placeholder="Enter tax ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
            </div>
          </>
        );
      
      case 'producer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producer Name</label>
              <input type="text" placeholder="Enter producer name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input type="text" placeholder="Enter country" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, country: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" placeholder="Enter contact email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
            </div>
          </>
        );

      case 'stock':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" placeholder="Enter product name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, warehouse: e.target.value})}>
                  <option value="">Select warehouse</option>
                  <option value="Rotterdam WH">Rotterdam WH</option>
                  <option value="Madrid WH">Madrid WH</option>
                  <option value="Santos WH">Santos WH</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="In Stock">In Stock</option>
                <option value="Reserved">Reserved</option>
                <option value="Shipped">Shipped</option>
              </select>
            </div>
          </>
        );

      case 'sku':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" placeholder="e.g., Colombian Supremo — 60 kg bag" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, productName: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                <input type="text" placeholder="e.g., GC-COL-001-60KG" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" onChange={(e) => setFormData({...formData, skuName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode/EAN</label>
                <input type="text" placeholder="Enter barcode" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, productCategory: e.target.value})}>
                  <option value="">Select category</option>
                  <option value="Green Coffee">Green Coffee</option>
                  <option value="Roasted Coffee">Roasted Coffee</option>
                  <option value="Cacao">Cacao</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input type="text" placeholder="e.g., Colombia" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, origin: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, weight: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pack Type</label>
                <input type="text" placeholder="e.g., 60 kg bag" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, pack: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, producerName: e.target.value})}>
                <option value="">Select producer</option>
                <option value="Cooperativa Los Altos">Cooperativa Los Altos</option>
                <option value="Coffee Farms Colombia">Coffee Farms Colombia</option>
              </select>
            </div>
          </>
        );

      case 'restocking':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input type="text" placeholder="Enter product name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, product: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                <input type="text" placeholder="Seller name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, seller: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, warehouse: e.target.value})}>
                <option value="">Select warehouse</option>
                <option value="Rotterdam WH">Rotterdam WH</option>
                <option value="Madrid WH">Madrid WH</option>
              </select>
            </div>
          </>
        );

      case 'shipment':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input type="text" placeholder="Enter order ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, orderId: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <input type="text" placeholder="e.g., Costas Ocean" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, carrier: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" placeholder="Enter tracking number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, tracking: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input type="text" placeholder="Enter destination" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, destination: e.target.value})} />
            </div>
          </>
        );

      case 'user':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" placeholder="Enter full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="Enter email address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Group</label>
                <input type="text" placeholder="e.g., MarketSell" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, sellerGroup: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Group</label>
                <input type="text" placeholder="e.g., Wholesale" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, buyerGroup: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Group</label>
              <input type="text" placeholder="e.g., None" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, agentGroup: e.target.value})} />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {renderFields()}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
              <Plus size={18}/> Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
