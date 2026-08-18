import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCompanyEmailSettingsCache } from '../useCompanyEmailSettingsCache';

const invalidateQueries = vi.fn().mockResolvedValue(undefined);
const getQueryData = vi.fn().mockReturnValue({ version: 4 });
vi.mock('@trpc/react-query', () => ({
  getQueryKey: () => ['companyEmailSettings', 'get'],
}));
vi.mock('../../CompanyEmailSettings.service', () => ({
  CompanyEmailSettingsService: { get: {} },
}));

describe('useCompanyEmailSettingsCache', () => {
  it('reads and invalidates only the company email settings get cache key', async () => {
    const queryClient = new QueryClient();
    queryClient.getQueryData = getQueryData;
    queryClient.invalidateQueries = invalidateQueries;
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result } = renderHook(() => useCompanyEmailSettingsCache(), {
      wrapper,
    });

    expect(result.current.getData()).toEqual({ version: 4 });
    await result.current.invalidate();
    expect(getQueryData).toHaveBeenCalledWith(['companyEmailSettings', 'get']);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['companyEmailSettings', 'get'],
    });
  });
});
