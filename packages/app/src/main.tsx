import React from 'react';
import { RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './index.css';

import { Router } from './Infrastructure';
import {
  UsersServices,
  UsersServicesClient,
} from './Domains/Users/Services/UserServices';

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
    <UsersServices.Provider
      client={UsersServicesClient}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={Router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </UsersServices.Provider>
  </React.StrictMode>,
);
