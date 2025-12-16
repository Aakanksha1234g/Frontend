import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { Buffer } from 'buffer';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from '@api/queryClient';
import routes from '@routes/routes';
import {
  createBrowserRouter,
  RouterProvider,
  useHref,
  useNavigate,
} from 'react-router';
import NetworkWrapper from '@shared/components/Network';
import { UserProvider } from '@shared/context/user-context.jsx';
import { ToastProvider } from '@shared/Toast/ToastContext.jsx';
import { showToast } from '@shared/utils/toast-service';
import { HeroUIProvider } from '@heroui/system';
import TemplatesProvider from "@products/pitch-craft/contexts/TemplatesContext";

window.Buffer = Buffer;

// Handle online/offline events
window.addEventListener('offline', () => {
  showToast(
    'Network error: Please check your internet connection.',
    'error',
    5000
  );
});

window.addEventListener('online', () => {
  showToast('Back online!', 'success', 3000);
});

// Create router instance
const router = createBrowserRouter(routes);

// Wrap HeroUIProvider so we can safely use hooks
function HeroUIWrapper({ children }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
    </HeroUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <UserProvider>
        <TemplatesProvider>
          <NetworkWrapper>
            <RouterProvider router={router}>
              <HeroUIWrapper />
            </RouterProvider>
          </NetworkWrapper>
          <ReactQueryDevtools initialIsOpen={false} />
        </TemplatesProvider>
      </UserProvider>
    </ToastProvider>
  </QueryClientProvider>
);
