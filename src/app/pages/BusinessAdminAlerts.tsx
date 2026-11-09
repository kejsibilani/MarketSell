import { useEffect, useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

type AlertItem = {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
};

const initial: AlertItem[] = [
  { id: 'a1', title: 'Holiday Shipping', message: 'Expect shipping delays between Dec 24 - Jan 2.', active: true, createdAt: '2026-01-10' },
  { id: 'a2', title: 'New Fees', message: 'Updated marketplace fees from May 1.', active: false, createdAt: '2026-04-01' },
];

export default function BusinessAdminAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initial);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // placeholder: load persisted alerts (localStorage for now)
    try {
      const raw = localStorage.getItem('business_admin_alerts');
      if (raw) setAlerts(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('business_admin_alerts', JSON.stringify(alerts)); } catch (e) {}
  }, [alerts]);

  const add = () => {
    if (!title.trim() || !message.trim()) return;
    const it: AlertItem = { id: `a${Date.now()}`, title: title.trim(), message: message.trim(), active: true, createdAt: new Date().toISOString().slice(0,10) };
    setAlerts(prev => [it, ...prev]);
    setTitle(''); setMessage('');
  };

  const remove = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const toggle = (id: string) => setAlerts(prev => prev.map(a => a.id===id?{...a, active:!a.active}:a));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3A] flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Alerts</h1>
        <p className="text-sm text-gray-600">Create and manage system-wide alerts and promotions displayed in the dashboard top bar.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold mb-3">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 && <p className="text-sm text-gray-500">No alerts yet.</p>}
            {alerts.map(a => (
              <div key={a.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{a.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{a.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-2">Created {a.createdAt}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => toggle(a.id)} className={`px-3 py-1 rounded text-sm ${a.active ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{a.active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => remove(a.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold mb-3">Create Alert</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Message</label>
              <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="flex gap-3">
              <button onClick={add} className="bg-[#0B1F3A] text-white px-4 py-2 rounded flex items-center gap-2"><Plus className="w-4 h-4"/> Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
