import React from 'react';
import { RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Router } from './Infrastructure';
import { TrpcApi, trpcClientApi } from './clientApi';

import './index.css';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: Infinity,
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TrpcApi.Provider client={trpcClientApi} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={Router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </TrpcApi.Provider>
  </React.StrictMode>,
);
