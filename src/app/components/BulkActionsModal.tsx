import { useState } from 'react';
import { X, CheckSquare, Trash2, Download, Send } from 'lucide-react';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onAction: (action: string, data: any) => void;
}

export function BulkActionsModal({ isOpen, onClose, selectedCount, onAction }: BulkActionsModalProps) {
  const [action, setAction] = useState('');
  const [data, setData] = useState<any>({});

  if (!isOpen || selectedCount === 0) return null;

  const handleApply = () => {
    if (action) {
      onAction(action, data);
      setAction('');
      setData({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bulk Actions</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedCount} items selected</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select an action</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="status">Change Status</option>
              <option value="assign">Assign To</option>
              <option value="export">Export</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {action === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                onChange={(e) => setData({...data, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {action === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
              <input
                type="text"
                placeholder="Enter user or team name"
                onChange={(e) => setData({...data, assignTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {action === 'delete' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ This action cannot be undone. {selectedCount} items will be permanently deleted.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!action}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <CheckSquare size={18}/>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
