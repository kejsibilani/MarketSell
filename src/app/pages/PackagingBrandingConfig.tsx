import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Upload, Edit2, Save, X } from 'lucide-react';

interface BrandingConfig {
  id: string;
  name: string;
  logo?: {
    url: string;
    uploadedDate: string;
  };
  colors?: {
    primary: string;
    secondary: string;
  };
  tagline?: string;
  packageDesign?: string;
  createdDate: string;
  isActive: boolean;
}

export default function PackagingBrandingConfig() {
  const [brandingConfigs, setBrandingConfigs] = useState<BrandingConfig[]>([
    {
      id: 'BRAND-001',
      name: 'Standard Branding',
      tagline: 'Premium Colombian Coffee',
      colors: { primary: '#8B4513', secondary: '#F5DEB3' },
      createdDate: '15.04.26',
      isActive: true,
      logo: { url: '/logos/standard.png', uploadedDate: '15.04.26' },
    },
    {
      id: 'BRAND-002',
      name: 'Organic Collection',
      tagline: '100% Organic, Ethically Sourced',
      colors: { primary: '#228B22', secondary: '#F0FFF0' },
      createdDate: '22.05.26',
      isActive: false,
      logo: { url: '/logos/organic.png', uploadedDate: '22.05.26' },
    },
  ]);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BrandingConfig>>({});

  const handleEdit = (config: BrandingConfig) => {
    setIsEditing(config.id);
    setEditFormData(config);
  };

  const handleSave = (id: string) => {
    setBrandingConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, ...editFormData } : c))
    );
    setIsEditing(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditFormData({});
  };

  const handleActivate = (id: string) => {
    setBrandingConfigs(prev =>
      prev.map(c => ({
        ...c,
        isActive: c.id === id ? true : false,
      }))
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this branding configuration?')) {
      setBrandingConfigs(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
      <div className="space-y-6">
        <PageHeader
          title="Packaging & Branding"
          description="Configure custom branding and logos for your packaging"
          onAddNew={() => {
            console.log('Create new branding config');
            // TODO: Open modal or navigate to create new branding
          }}
          addNewLabel="New Branding Config"
        />

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">What is Packaging & Branding?</h3>
          <p className="text-sm text-blue-800 mb-3">
            Configure custom logos, colors, and designs for your product packaging. These settings will be applied to 
            physical bags and labels when your coffee goes through brand packaging transformations.
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Upload your company logo</li>
            <li>Define your brand colors</li>
            <li>Create multiple branding profiles</li>
            <li>Activate the branding to use in transformations</li>
          </ul>
        </div>

        {/* Branding Configs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {brandingConfigs.map(config => (
            <div
              key={config.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{config.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{config.tagline}</p>
                  </div>
                  {config.isActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {isEditing === config.id ? (
                  // Edit Mode
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={editFormData.tagline || ''}
                        onChange={e => setEditFormData({ ...editFormData, tagline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                        <input
                          type="color"
                          value={editFormData.colors?.primary || '#000000'}
                          onChange={e =>
                            setEditFormData({
                              ...editFormData,
                              colors: {
                                primary: e.target.value,
                                secondary: editFormData.colors?.secondary || '#000000',
                              },
                            })
                          }
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                        <input
                          type="color"
                          value={editFormData.colors?.secondary || '#000000'}
                          onChange={e =>
                            setEditFormData({
                              ...editFormData,
                              colors: {
                                primary: editFormData.colors?.primary || '#000000',
                                secondary: e.target.value,
                              },
                            })
                          }
                          className="w-full h-10 rounded border border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSave(config.id)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <>
                    {/* Logo */}
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      {config.logo ? (
                        <div>
                          <div className="w-20 h-20 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600">Logo uploaded {config.logo.uploadedDate}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No logo uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Colors */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Colors</p>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: config.colors?.primary || '#000' }}
                          />
                          <span className="text-xs text-gray-600">Primary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: config.colors?.secondary || '#000' }}
                          />
                          <span className="text-xs text-gray-600">Secondary</span>
                        </div>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-gray-500">Created: {config.createdDate}</div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {!config.isActive && (
                        <button
                          onClick={() => handleActivate(config.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(config)}
                        className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Future Enhancements */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-purple-900 mb-2">Future Enhancements</h3>
          <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
            <li>Upload and preview logo images</li>
            <li>Design custom label templates</li>
            <li>Preview packaging designs before transformation</li>
            <li>Integrate with printing providers</li>
            <li>Track packaging costs per unit</li>
          </ul>
        </div>
      </div>
  );
}
