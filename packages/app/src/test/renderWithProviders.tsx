import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: 0, gcTime: 0, staleTime: 0 },
      mutations: { retry: 0 },
    },
  });

interface RenderOptions {
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: React.ReactElement,
  { initialEntries = ['/'] }: RenderOptions = {},
): RenderResult & { queryClient: QueryClient } => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return Object.assign(render(ui, { wrapper: Wrapper }), { queryClient });
};
