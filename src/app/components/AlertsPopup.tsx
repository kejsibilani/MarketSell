import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

type AlertItem = {
  id: string;
  title: string;
  message: string;
  active: boolean;
  createdAt: string;
};

export default function AlertsPopup({ onClose }: { onClose?: () => void }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('business_admin_alerts');
      if (raw) {
        const parsed = JSON.parse(raw) as AlertItem[];
        setAlerts(parsed.filter(a => a.active));
      }
    } catch (e) {}
    try {
      const d = localStorage.getItem('dismissed_alerts');
      if (d) setDismissed(JSON.parse(d));
    } catch (e) {}
  }, []);

  const dismiss = (id: string) => {
    const next = { ...dismissed, [id]: true };
    setDismissed(next);
    try { localStorage.setItem('dismissed_alerts', JSON.stringify(next)); } catch (e) {}
  };

  if (!alerts || alerts.filter(a => !dismissed[a.id]).length === 0) {
    return (
      <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <strong>Alerts</strong>
          </div>
          <button onClick={() => onClose?.()} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>
        <div className="mt-3 text-sm text-gray-600">No active alerts</div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <strong>Alerts</strong>
        </div>
        <button onClick={() => onClose?.()} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
      </div>

      <div className="mt-3 space-y-3">
        {alerts.filter(a => !dismissed[a.id]).map(a => (
          <div key={a.id} className="p-3 border rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{a.title}</div>
                <div className="text-sm text-gray-600 mt-1">{a.message}</div>
                <div className="text-xs text-gray-400 mt-2">Created {a.createdAt}</div>
              </div>
              <div className="ml-3 flex flex-col items-end gap-2">
                <button onClick={() => dismiss(a.id)} className="text-sm px-2 py-1 bg-gray-100 rounded">Dismiss</button>
                <button className="text-green-600 p-1 rounded hover:bg-green-50"><Check className="w-4 h-4"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
