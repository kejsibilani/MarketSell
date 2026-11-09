import { useState } from 'react';
import { X, Settings, Bell, Eye, Lock, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings?: any;
}

export function SettingsModal({ isOpen, onClose, onSave, currentSettings = {} }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    notifications: currentSettings.notifications ?? true,
    emailAlerts: currentSettings.emailAlerts ?? true,
    darkMode: currentSettings.darkMode ?? false,
    itemsPerPage: currentSettings.itemsPerPage ?? '25',
    autoSave: currentSettings.autoSave ?? true,
    twoFactor: currentSettings.twoFactor ?? false,
    dataRetention: currentSettings.dataRetention ?? '90',
    timezone: currentSettings.timezone ?? 'UTC',
    theme: currentSettings.theme ?? 'light',
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setSettings({...settings, [field]: value});
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20}/>
            Settings & Preferences
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Notifications Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell size={18}/>
              Notifications
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Enable notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Email alerts</span>
              </label>
            </div>
          </div>

          {/* Display Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={18}/>
              Display
            </h3>
            <div className="space-y-3 pl-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Items Per Page</label>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="CST">CST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock size={18}/>
              Security
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => handleChange('twoFactor', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Auto-save drafts</span>
              </label>
            </div>
          </div>

          {/* Data Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database size={18}/>
              Data
            </h3>
            <div className="pl-6">
              <label className="block text-sm text-gray-700 mb-2">Data Retention (days)</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
