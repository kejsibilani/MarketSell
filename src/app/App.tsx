import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SyncErrorBanner } from './components/SyncErrorBanner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <SyncErrorBanner />
    </>
  );
}
