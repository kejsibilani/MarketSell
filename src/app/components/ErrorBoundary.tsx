import { useRouteError, Link } from 'react-router';
import { colors } from '../styles/designSystem';

export default function ErrorBoundary() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-6">
          {error?.statusText || error?.message || 'Something went wrong'}
        </p>
        <Link
          to="/"
          className="inline-block text-white px-6 py-3 rounded-lg font-medium"
          style={{ backgroundColor: colors.primary, cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
