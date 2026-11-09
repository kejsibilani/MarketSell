import React from 'react';

export default function QuickActions<T extends string | number>(props: {
  items: { id: T; title: string; subtitle?: string; value?: string | number; active?: boolean; onClick?: () => void }[]
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {props.items.map(it => (
        <button
          key={String(it.id)}
          onClick={it.onClick}
          className={`p-4 rounded-lg border transition-shadow transition-transform ${it.active ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]' : 'border-gray-200 bg-white hover:shadow-sm hover:-translate-y-0.5'}`}
        >
          <div className="text-sm text-gray-600">{it.title}</div>
          <div className={`text-2xl font-bold ${it.active ? 'text-blue-700' : 'text-gray-900'}`}>{it.value ?? '-'}</div>
          {it.subtitle && <div className="text-xs text-gray-500 mt-1">{it.subtitle}</div>}
        </button>
      ))}
    </div>
  );
}
