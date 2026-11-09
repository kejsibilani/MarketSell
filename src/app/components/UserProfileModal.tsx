import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Building2, Award, Clock, Edit2, Save } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    department?: string;
    location?: string;
    avatar?: string;
    joinDate?: string;
    status: 'active' | 'inactive' | 'suspended';
    permissions?: string[];
  };
  onSave?: (data: any) => void;
}

export function UserProfileModal({ isOpen, onClose, userData, onSave }: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData || {
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: '',
    joinDate: '',
    status: 'active' as const,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.(formData);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User size={20}/>
            Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <User size={40} className="text-blue-600"/>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(formData.status)}`}>
              {getStatusLabel(formData.status)}
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                {/* Editable Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                  <User size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Name</p>
                    <p className="text-sm font-medium text-gray-900">{formData.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                  <Mail size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm font-medium text-gray-900">{formData.email}</p>
                  </div>
                </div>

                {formData.phone && (
                  <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                    <Phone size={18} className="text-gray-400 mt-1"/>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{formData.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                  <Award size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Role</p>
                    <p className="text-sm font-medium text-gray-900">{formData.role}</p>
                  </div>
                </div>

                {formData.department && (
                  <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                    <Building2 size={18} className="text-gray-400 mt-1"/>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Department</p>
                      <p className="text-sm font-medium text-gray-900">{formData.department}</p>
                    </div>
                  </div>
                )}

                {formData.location && (
                  <div className="flex items-start gap-2 pb-3 border-b border-gray-200">
                    <MapPin size={18} className="text-gray-400 mt-1"/>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm font-medium text-gray-900">{formData.location}</p>
                    </div>
                  </div>
                )}

                {formData.joinDate && (
                  <div className="flex items-start gap-2">
                    <Clock size={18} className="text-gray-400 mt-1"/>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Joined</p>
                      <p className="text-sm font-medium text-gray-900">{formData.joinDate}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Close
          </button>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Save size={18}/>
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Edit2 size={18}/>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
