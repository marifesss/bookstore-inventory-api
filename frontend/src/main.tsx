import { StrictMode } from 'react';
  import { createRoot } from 'react-dom/client';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

  import App from './App.tsx';
  import { ToastProvider } from './components/ui/Toast';   
  import './index.css';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < 1 && (error.status === 0 || error.status >= 500),
      },
    },
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>  {}
          <App />
        </ToastProvider>   {}
      </QueryClientProvider>
    </StrictMode>,
  );