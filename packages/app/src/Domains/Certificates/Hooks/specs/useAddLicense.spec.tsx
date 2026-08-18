import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddLicense } from '../useAddLicense';

const { mutateMock, useMutationMock } = vi.hoisted(() => {
  const mutateMock = vi.fn();
  const useMutationMock = vi.fn().mockReturnValue({
    mutate: mutateMock,
    isPending: false,
    isError: false,
  });
  return { mutateMock, useMutationMock };
});

vi.mock('../../Certificates.service', () => ({
  CertificatesService: {
    addCertificate: {
      useMutation: useMutationMock,
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@app/Infrastructure/Services/AxiosApi', () => ({
  default: {
    uploadFile: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('useAddLicense hook', () => {
  beforeEach(() => {
    mutateMock.mockClear();
    useMutationMock.mockClear();
    useMutationMock.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
    });
    mutateMock.mockImplementation(
      (_data: unknown, opts: { onSuccess: (d: unknown) => void }) => {
        opts.onSuccess({ id: 1 });
      },
    );
  });

  it('includes returnDate and requiresRest in the mutation payload', async () => {
    const { result } = renderHook(() => useAddLicense(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAddLicence({
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        returnDate: '2026-01-25',
        reason: 'Vacaciones',
        type: '2',
        requiresRest: true,
      } as never);
    });

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        returnDate: '2026-01-25',
        requiresRest: true,
        type: 2,
      }),
      expect.any(Object),
    );
  });

  it('defaults requiresRest to false when not provided', async () => {
    const { result } = renderHook(() => useAddLicense(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAddLicence({
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        returnDate: '2026-01-25',
        reason: 'Test',
        type: '1',
      } as never);
    });

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 1,
      }),
      expect.any(Object),
    );
  });
});
