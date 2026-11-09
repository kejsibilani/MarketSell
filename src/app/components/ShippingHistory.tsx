import React from 'react';

export interface ShippingEvent { date: string; carrier?: string; trackingRef?: string; event?: string; location?: string; internalShipmentId?: string }

export default function ShippingHistory({ events, parentInternalId }: { events: ShippingEvent[]; parentInternalId?: string }) {
  if (!events || events.length === 0) {
    return <p className="px-4 py-3 text-sm text-gray-400">No shipping events recorded yet.</p>;
  }

  return (
    <table className="w-full border-t border-gray-100">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Carrier</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tracking</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Event</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Internal #</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {events.map((s, i) => (
          <tr key={i}>
            <td className="px-4 py-2 text-sm text-gray-600">{s.date}</td>
            <td className="px-4 py-2 text-sm font-medium text-gray-800">{s.carrier ?? '-'}</td>
            <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{s.trackingRef ?? '-'}</code></td>
            <td className="px-4 py-2 text-sm text-gray-900">{s.event ?? '-'}</td>
            <td className="px-4 py-2 text-sm text-gray-600">{s.location ?? '-'}</td>
            <td className="px-4 py-2 text-sm text-gray-600 font-mono">{s.internalShipmentId ?? parentInternalId ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
