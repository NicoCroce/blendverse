import { describe, expect, it, vi } from 'vitest';
import { useGetCompanyEmailSettings } from '../useGetCompanyEmailSettings';

const { useQuery } = vi.hoisted(() => ({ useQuery: vi.fn() }));
vi.mock('../../CompanyEmailSettings.service', () => ({
  CompanyEmailSettingsService: { get: { useQuery } },
}));

describe('useGetCompanyEmailSettings', () => {
  it('calls the inferred get endpoint with the expected refresh policy', () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    const result = useGetCompanyEmailSettings();

    expect(result.isLoading).toBe(true);
    expect(useQuery).toHaveBeenCalledWith(undefined, {
      staleTime: 1000,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });
  });
});
