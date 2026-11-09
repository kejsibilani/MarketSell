import { useEffect, useState } from 'react';
import type { SyncErrorDetail } from '../../lib/backend/sync';

/** Shows a dismissible notice when a change could not be saved to the server. */
export function SyncErrorBanner() {
  const [error, setError] = useState<SyncErrorDetail | null>(null);

  useEffect(() => {
    const onError = (e: Event) => setError((e as CustomEvent<SyncErrorDetail>).detail);
    window.addEventListener('marketsell:sync-error', onError);
    return () => window.removeEventListener('marketsell:sync-error', onError);
  }, []);

  if (!error) return null;
  return (
    <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg border border-red-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-semibold text-red-700">Changes not saved to the server</p>
      <p className="mt-1 text-xs text-gray-600 break-words">{error.message}</p>
      <button onClick={() => setError(null)} className="mt-3 text-xs font-medium text-gray-700 hover:underline">
        Dismiss
      </button>
    </div>
  );
}
