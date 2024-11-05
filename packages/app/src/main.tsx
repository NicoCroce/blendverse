import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './index.css';
import { Layout } from './Aplication/Components/Layout/AppLayout/Layout';
import { registerEventViewport } from './Aplication/Helpers';
import { TrpcApi, trpcClientApi } from './Infrastructure/Services/clientApi';
import { persistOptions } from './Aplication/Helpers/persister';
import { registerSW } from 'virtual:pwa-register';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: Infinity,
      retry: 0,
    },
  },
});

// add this to prompt for a refresh
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

registerEventViewport(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TrpcApi.Provider client={trpcClientApi} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </TrpcApi.Provider>
  </React.StrictMode>,
);
