import React, { useState, useEffect } from 'react';
import { Plus, X, Minus } from 'lucide-react';
import { TransformationType, TransformationOrder, TransformItem } from '../types/transformation';
import { products } from '../data/mockData';

interface TransformationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformationType: TransformationType;
  onSave: (order: Partial<TransformationOrder>) => void;
  editingOrder?: TransformationOrder;
}

export function TransformationFormModal({
  isOpen,
  onClose,
  transformationType,
  onSave,
  editingOrder,
}: TransformationFormModalProps) {
  const [inputItems, setInputItems] = useState<TransformItem[]>([
    { sku: '', productName: '', units: 1, kg: 0 },
  ]);
  const [outputItems, setOutputItems] = useState<TransformItem[]>([
    { sku: '', productName: '', units: 1, kg: 0 },
  ]);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('0');
  const [status, setStatus] = useState<'pending' | 'working' | 'completed'>('pending');

  // Get the label for the transformation type
  const getTransformationLabel = (type: TransformationType): string => {
    const labels: Record<TransformationType, string> = {
      [TransformationType.ROASTING]: 'Roasting',
      [TransformationType.PACKAGING]: 'Packaging',
      [TransformationType.REPACKAGING]: 'Repackaging',
      [TransformationType.BRAND_PACKAGING]: 'Brand Packaging',
      [TransformationType.BAG_OPENING]: 'Quality Analysis',
    };
    return labels[type] || 'Transformation';
  };

  useEffect(() => {
    if (editingOrder) {
      setInputItems(editingOrder.fromItems);
      setOutputItems(editingOrder.toItems);
      setDescription(editingOrder.description || '');
      setCost(editingOrder.cost.toString());
      setStatus(editingOrder.status);
    } else {
      setInputItems([{ sku: '', productName: '', units: 1, kg: 0 }]);
      setOutputItems([{ sku: '', productName: '', units: 1, kg: 0 }]);
      setDescription('');
      setCost('0');
      setStatus('pending');
    }
  }, [editingOrder, isOpen]);

  if (!isOpen) return null;

  const handleAddInputItem = () => {
    setInputItems([...inputItems, { sku: '', productName: '', units: 1, kg: 0 }]);
  };

  const handleRemoveInputItem = (index: number) => {
    if (inputItems.length > 1) {
      setInputItems(inputItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateInputItem = (
    index: number,
    field: keyof TransformItem,
    value: any
  ) => {
    const updated = [...inputItems];
    if (field === 'units' || field === 'kg') {
      updated[index][field] = Math.max(0, Number(value));
    } else {
      updated[index][field] = value;
    }
    setInputItems(updated);
  };

  const handleAddOutputItem = () => {
    setOutputItems([...outputItems, { sku: '', productName: '', units: 1, kg: 0 }]);
  };

  const handleRemoveOutputItem = (index: number) => {
    if (outputItems.length > 1) {
      setOutputItems(outputItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateOutputItem = (
    index: number,
    field: keyof TransformItem,
    value: any
  ) => {
    const updated = [...outputItems];
    if (field === 'units' || field === 'kg') {
      updated[index][field] = Math.max(0, Number(value));
    } else {
      updated[index][field] = value;
    }
    setOutputItems(updated);
  };

  const handleSave = () => {
    if (!inputItems.every(i => i.sku && i.units > 0)) {
      alert('Please fill all input fields');
      return;
    }
    if (!outputItems.every(o => o.sku && o.units > 0)) {
      alert('Please fill all output fields');
      return;
    }

    onSave({
      fromItems: inputItems,
      toItems: outputItems,
      description,
      cost: Number(cost),
      status,
      type: transformationType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {editingOrder ? `Edit ${getTransformationLabel(transformationType)}` : `New ${getTransformationLabel(transformationType)}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this transformation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>

          {/* Input Items */}
          <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Input Items (What Goes In)</h3>
              <button
                onClick={handleAddInputItem}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-200 text-green-800 rounded hover:bg-green-300 font-medium"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {inputItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end bg-white p-3 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                    <input
                      type="text"
                      value={item.sku}
                      onChange={(e) => handleUpdateInputItem(index, 'sku', e.target.value)}
                      placeholder="e.g., GC-COL-001-60KG"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleUpdateInputItem(index, 'productName', e.target.value)}
                      placeholder="e.g., Colombian Green Beans"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Units</label>
                    <input
                      type="number"
                      value={item.units}
                      onChange={(e) => handleUpdateInputItem(index, 'units', e.target.value)}
                      min="0"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-600 mb-1">kg</label>
                    <input
                      type="number"
                      value={item.kg}
                      onChange={(e) => handleUpdateInputItem(index, 'kg', e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {inputItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveInputItem(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Remove item"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Output Items */}
          <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Output Items (What Comes Out)</h3>
              <button
                onClick={handleAddOutputItem}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-200 text-blue-800 rounded hover:bg-blue-300 font-medium"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {outputItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end bg-white p-3 rounded-lg border border-blue-200"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                    <input
                      type="text"
                      value={item.sku}
                      onChange={(e) => handleUpdateOutputItem(index, 'sku', e.target.value)}
                      placeholder="e.g., RC-COL-001-1KG"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleUpdateOutputItem(index, 'productName', e.target.value)}
                      placeholder="e.g., Colombian Roasted Beans"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Units</label>
                    <input
                      type="number"
                      value={item.units}
                      onChange={(e) => handleUpdateOutputItem(index, 'units', e.target.value)}
                      min="0"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-xs font-medium text-gray-600 mb-1">kg</label>
                    <input
                      type="number"
                      value={item.kg}
                      onChange={(e) => handleUpdateOutputItem(index, 'kg', e.target.value)}
                      min="0"
                      step="0.1"
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {outputItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveOutputItem(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Remove item"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cost & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cost (€)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'working' | 'completed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="working">Working</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            {editingOrder ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
