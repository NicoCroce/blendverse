import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { REPORT_SECTION_CODES } from '../../CompanyEmailSettings.entity';
import type { TCompanyEmailSettings } from '../../CompanyEmailSettings.entity';
import { useCompanyEmailSettingsPage } from '../useCompanyEmailSettingsPage';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn(),
  updateUseMutation: vi.fn(),
  publishUseMutation: vi.fn(),
  updateMutateAsync: vi.fn(),
  publishMutateAsync: vi.fn(),
}));

vi.mock('../useGetCompanyEmailSettings', () => ({
  useGetCompanyEmailSettings: mocks.query,
}));
vi.mock('../useCompanyEmailSettingsCache', () => ({
  useCompanyEmailSettingsCache: () => ({
    invalidate: mocks.invalidate,
    getData: vi.fn(),
  }),
}));
vi.mock('../../CompanyEmailSettings.service', () => ({
  _companyEmailSettingsService: {},
  CompanyEmailSettingsService: {
    update: { useMutation: mocks.updateUseMutation },
    publishTerms: { useMutation: mocks.publishUseMutation },
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const snapshot: TCompanyEmailSettings = {
  id: 41,
  ownerId: 41,
  version: 4,
  welcomeMessage: '<p>Welcome</p>',
  deliveries: [
    {
      code: 'admin_license_created',
      audience: 'admin',
      trigger: 'license_created',
      enabled: true,
    },
    {
      code: 'employee_license_status_changed',
      audience: 'employee',
      trigger: 'license_status_changed',
      enabled: true,
    },
    {
      code: 'employee_document_signed',
      audience: 'employee',
      trigger: 'document_signed',
      enabled: true,
    },
    {
      code: 'admin_document_signed',
      audience: 'admin',
      trigger: 'document_signed',
      enabled: true,
    },
    {
      code: 'employee_terms_reminder',
      audience: 'employee',
      trigger: 'terms_reminder',
      enabled: true,
    },
    {
      code: 'admin_daily_report',
      audience: 'admin',
      trigger: 'daily_report',
      enabled: true,
    },
    {
      code: 'employee_daily_reminder',
      audience: 'employee',
      trigger: 'daily_reminder',
      enabled: true,
    },
    {
      code: 'employee_document_assigned',
      audience: 'employee',
      trigger: 'document_assigned',
      enabled: true,
    },
    {
      code: 'requester_document_manual',
      audience: 'requester',
      trigger: 'document_manual',
      enabled: true,
    },
  ],
  recipients: [
    {
      email: 'ops@acme.com',
      normalizedEmail: 'ops@acme.com',
      source: 'manual',
    },
  ],
  reportSections: REPORT_SECTION_CODES.map((code) => ({ code, enabled: true })),
  currentTerms: {
    id: 12,
    version: 2,
    publishedAt: '2026-08-17T09:00:00.000Z',
    publishedBy: 7,
    content: '<p>Legal</p>',
    contentHash: 'hash',
  },
  diagnostics: [],
  updatedAt: '2026-08-17T09:00:00.000Z',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('useCompanyEmailSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockReturnValue({
      data: snapshot,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: mocks.refetch,
    });
    mocks.updateMutateAsync.mockResolvedValue({ ...snapshot, version: 5 });
    mocks.publishMutateAsync.mockResolvedValue({
      ...snapshot,
      version: 6,
      currentTerms: { ...snapshot.currentTerms!, version: 3 },
    });
    mocks.updateUseMutation.mockReturnValue({
      mutateAsync: mocks.updateMutateAsync,
      isPending: false,
      error: undefined,
    });
    mocks.publishUseMutation.mockReturnValue({
      mutateAsync: mocks.publishMutateAsync,
      isPending: false,
      error: undefined,
    });
    mocks.refetch.mockResolvedValue({ data: snapshot });
  });

  it('hydrates the snapshot, sends expectedVersion, and invalidates after an atomic save', async () => {
    const { result } = renderHook(() => useCompanyEmailSettingsPage(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.currentVersion).toBe(4));

    act(() => result.current.toggleDelivery('admin_license_created', false));
    await act(async () => result.current.submit());

    await waitFor(() =>
      expect(mocks.updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedVersion: 4,
          welcomeMessage: '<p>Welcome</p>',
        }),
      ),
    );
    expect(mocks.invalidate).toHaveBeenCalledOnce();
    expect(result.current.savedFeedback?.version).toBe(5);
  });

  it('does not submit duplicate recipients and exposes contextual validation', async () => {
    const { result } = renderHook(() => useCompanyEmailSettingsPage(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.currentVersion).toBe(4));

    act(() => result.current.setRecipientDraft(' OPS@ACME.COM '));
    await waitFor(() =>
      expect(result.current.recipientDraft).toBe(' OPS@ACME.COM '),
    );
    act(() => result.current.handleAddRecipient());
    expect(result.current.recipientError).toBe(
      'Ese destinatario ya está en la lista.',
    );
    expect(result.current.recipients).toHaveLength(1);
  });

  it('marks stale optimistic saves as conflict and offers reload without invalidating partial data', async () => {
    mocks.updateMutateAsync.mockRejectedValueOnce(
      Object.assign(new Error('stale'), {
        data: { code: 'STALE_CONFIGURATION' },
      }),
    );
    const { result } = renderHook(() => useCompanyEmailSettingsPage(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.currentVersion).toBe(4));

    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.conflict).toBe(true));
    expect(mocks.invalidate).not.toHaveBeenCalled();
    await act(async () => result.current.reloadCurrent());
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(result.current.conflict).toBe(false);
  });

  it('publishes terms through a separate confirmed mutation with the current version', async () => {
    const { result } = renderHook(() => useCompanyEmailSettingsPage(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.currentVersion).toBe(4));
    act(() =>
      result.current.form.setValue(
        'termsContent',
        '<p>Next legal version</p>',
        { shouldDirty: true },
      ),
    );
    act(() => result.current.requestPublishTerms());
    expect(result.current.publishConfirmation).toBe(true);

    await act(async () => result.current.confirmPublishTerms());
    await waitFor(() =>
      expect(mocks.publishMutateAsync).toHaveBeenCalledWith({
        expectedVersion: 4,
        content: '<p>Next legal version</p>',
        confirmNewAcceptanceRequirement: true,
      }),
    );
    expect(mocks.updateMutateAsync).not.toHaveBeenCalled();
    expect(mocks.invalidate).toHaveBeenCalledOnce();
  });

  it('exposes pending locks for save and publication controls', async () => {
    mocks.updateUseMutation.mockReturnValue({
      mutateAsync: mocks.updateMutateAsync,
      isPending: true,
      error: undefined,
    });
    mocks.publishUseMutation.mockReturnValue({
      mutateAsync: mocks.publishMutateAsync,
      isPending: true,
      error: undefined,
    });
    const { result } = renderHook(() => useCompanyEmailSettingsPage(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.currentVersion).toBe(4));

    expect(result.current.isSaving).toBe(true);
    expect(result.current.isPublishing).toBe(true);
  });
});
