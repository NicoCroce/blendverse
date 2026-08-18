import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext, executeUseCase } from '@server/Application';
import { CompanyEmailSettingsService } from '../CompanyEmailSettings.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

const context = new RequestContext(7, 'service-request', 41);

describe('CompanyEmailSettingsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates get, update, publish, policy and audit through executeUseCase', async () => {
    const useCases = {
      get: { execute: vi.fn() },
      update: { execute: vi.fn() },
      publish: { execute: vi.fn() },
      policy: { execute: vi.fn() },
      audit: { execute: vi.fn() },
    };
    vi.mocked(executeUseCase)
      .mockResolvedValueOnce({ ownerId: 41 })
      .mockResolvedValueOnce({ ownerId: 41, version: 2 })
      .mockResolvedValueOnce({ ownerId: 41, version: 3 })
      .mockResolvedValueOnce({ code: 'admin_daily_report', enabled: false })
      .mockResolvedValueOnce({
        data: [],
        meta: { page: 1, limit: 50, totalItems: 0, totalPages: 0 },
      });
    const service = new CompanyEmailSettingsService(
      useCases.get as never,
      useCases.update as never,
      useCases.publish as never,
      useCases.policy as never,
      useCases.audit as never,
    );
    const input = { expectedVersion: 1 };

    await service.get({ requestContext: context });
    await service.update({ input: input as never, requestContext: context });
    await service.publishTerms({
      input: input as never,
      requestContext: context,
    });
    await service.resolveDelivery({
      input: { code: 'admin_daily_report' },
      requestContext: context,
    });
    await service.getAudit({ requestContext: context });

    const calls = vi.mocked(executeUseCase).mock.calls.map(([args]) => args);
    expect(calls[0]).toEqual({
      useCase: useCases.get,
      requestContext: context,
    });
    expect(calls[1]).toEqual({
      useCase: useCases.update,
      input,
      requestContext: context,
    });
    expect(calls[2]).toEqual({
      useCase: useCases.publish,
      input,
      requestContext: context,
    });
    expect(calls[3]).toEqual({
      useCase: useCases.policy,
      input: { code: 'admin_daily_report' },
      requestContext: context,
    });
    expect(calls[4]).toEqual({
      useCase: useCases.audit,
      input: undefined,
      requestContext: context,
    });
  });
});
