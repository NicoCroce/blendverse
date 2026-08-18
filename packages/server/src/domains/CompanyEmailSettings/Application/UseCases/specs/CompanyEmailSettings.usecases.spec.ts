import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RequestContext } from '@server/Application';
import {
  EMAIL_CATALOG_CODES,
  EMAIL_CATALOG_METADATA,
  REPORT_SECTION_CODES,
  type CompanyEmailSettingsSnapshot,
  type ICompanyEmailSettingsRepository,
  type CompanyEmailSettingsAuditRepository,
  type DeliveryPolicy,
} from '../../../Domain';
import { EnsureCompanyEmailSettings } from '../EnsureCompanyEmailSettings.usecase';
import { GetCompanyEmailSettings } from '../GetCompanyEmailSettings.usecase';
import { GetCompanyEmailSettingsAudit } from '../GetCompanyEmailSettingsAudit.usecase';
import { GetCurrentTermsVersion } from '../GetCurrentTermsVersion.usecase';
import { PublishTermsVersion } from '../PublishTermsVersion.usecase';
import { ResolveEmailDeliveryPolicy } from '../ResolveEmailDeliveryPolicy.usecase';
import { UpdateCompanyEmailSettings } from '../UpdateCompanyEmailSettings.usecase';

const ownerA = new RequestContext(17, 'request-a', 41);
const ownerB = new RequestContext(18, 'request-b', 42);

const snapshot = (
  ownerId: number,
  version = 1,
): CompanyEmailSettingsSnapshot => ({
  id: ownerId,
  ownerId,
  version,
  welcomeMessage: '<p>Hola</p>',
  deliveries: EMAIL_CATALOG_CODES.map((code) => ({
    code,
    audience: EMAIL_CATALOG_METADATA[code].audience,
    trigger: EMAIL_CATALOG_METADATA[code].trigger,
    enabled: true,
  })),
  recipients: [
    {
      email: `admin${ownerId}@test.com`,
      normalizedEmail: `admin${ownerId}@test.com`,
      source: 'manual',
    },
  ],
  reportSections: REPORT_SECTION_CODES.map((code) => ({ code, enabled: true })),
  currentTerms: {
    id: ownerId,
    version: 1,
    publishedAt: new Date('2026-08-17T09:00:00.000Z'),
    publishedBy: null,
    content: '<p>Legal inicial</p>',
    contentHash: 'initial-hash',
  },
  diagnostics: [],
  updatedAt: new Date('2026-08-17T09:00:00.000Z'),
});

const buildRepository = (): ICompanyEmailSettingsRepository => ({
  get: vi.fn(),
  ensure: vi.fn(),
  update: vi.fn(),
  publishTerms: vi.fn(),
  resolvePolicy: vi.fn(),
});

const buildAudit = (): CompanyEmailSettingsAuditRepository => ({
  record: vi.fn().mockResolvedValue(undefined),
  list: vi.fn(),
});

const adminPermissions = {
  execute: vi.fn().mockResolvedValue(['dashboard-access']),
};
const noPermissions = { execute: vi.fn().mockResolvedValue([]) };

const validDraft = {
  expectedVersion: 1,
  delivery: EMAIL_CATALOG_CODES.map((code) => ({ code, enabled: true })),
  adminRecipients: [{ email: ' Admin@Test.com ' }],
  reportSections: REPORT_SECTION_CODES.map((code) => ({ code, enabled: true })),
  welcomeMessage: '<p>Bienvenido</p>',
};

describe('CompanyEmailSettings application use cases', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ensures lazy provisioning with the exact RequestContext owner and isolates A from B', async () => {
    const repository = buildRepository();
    const snapshots = new Map([
      [41, snapshot(41)],
      [42, snapshot(42)],
    ]);
    vi.mocked(repository.ensure).mockImplementation(
      async (context) =>
        snapshots.get(context.values.ownerId) as CompanyEmailSettingsSnapshot,
    );

    const useCase = new EnsureCompanyEmailSettings(repository);
    const resultA = await useCase.execute({ requestContext: ownerA });
    const resultB = await useCase.execute({ requestContext: ownerB });

    expect(repository.ensure).toHaveBeenNthCalledWith(1, ownerA);
    expect(repository.ensure).toHaveBeenNthCalledWith(2, ownerB);
    expect(resultA.ownerId).toBe(41);
    expect(resultA.recipients[0].email).toBe('admin41@test.com');
    expect(resultB.ownerId).toBe(42);
    expect(resultB.recipients[0].email).toBe('admin42@test.com');
  });

  it('gets a complete snapshot only after dashboard authorization and records denied access', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    vi.mocked(repository.ensure).mockResolvedValue(snapshot(41, 3));
    const useCase = new GetCompanyEmailSettings(
      repository,
      audit,
      adminPermissions as never,
    );

    const result = await useCase.execute({ requestContext: ownerA });
    expect(result.ownerId).toBe(41);
    expect(result.version).toBe(3);
    expect(Array.isArray(result.deliveries)).toBe(true);
    expect(Array.isArray(result.reportSections)).toBe(true);
    expect(result.deliveries).toHaveLength(9);
    expect(result.reportSections).toHaveLength(7);
    expect(result.currentTerms?.version).toBe(1);
    expect(repository.ensure).toHaveBeenCalledWith(ownerA);

    const denied = new GetCompanyEmailSettings(
      repository,
      audit,
      noPermissions as never,
    );
    await expect(
      denied.execute({ requestContext: ownerB }),
    ).rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'access_rejected',
        outcome: 'rejected',
        reasonCode: 'FORBIDDEN',
      }),
      ownerB,
    );
    expect(repository.ensure).toHaveBeenCalledTimes(1);
  });

  it('validates the full draft, normalizes recipients, propagates ownerId, and never publishes terms', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    vi.mocked(repository.update).mockResolvedValue(snapshot(41, 2));
    const useCase = new UpdateCompanyEmailSettings(
      repository,
      audit,
      adminPermissions as never,
    );

    await useCase.execute({ input: validDraft, requestContext: ownerA });

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        requestContext: ownerA,
        expectedVersion: 1,
        draft: expect.objectContaining({
          adminRecipients: [{ email: 'Admin@Test.com' }],
          welcomeMessage: '<p>Bienvenido</p>',
        }),
      }),
    );
    expect(repository.publishTerms).not.toHaveBeenCalled();
  });

  it('rejects duplicate recipients, active admin routes without recipients, and empty active reports', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    const useCase = new UpdateCompanyEmailSettings(
      repository,
      audit,
      adminPermissions as never,
    );

    await expect(
      useCase.execute({
        input: {
          ...validDraft,
          adminRecipients: [{ email: 'A@test.com' }, { email: ' a@TEST.com ' }],
        },
        requestContext: ownerA,
      }),
    ).rejects.toMatchObject({ errorCode: 'VALIDATION_ERROR' });
    await expect(
      useCase.execute({
        input: { ...validDraft, adminRecipients: [] },
        requestContext: ownerA,
      }),
    ).rejects.toThrow('destinatario administrativo');
    await expect(
      useCase.execute({
        input: {
          ...validDraft,
          delivery: validDraft.delivery.map((item) =>
            item.code === 'admin_daily_report' ? item : item,
          ),
          reportSections: REPORT_SECTION_CODES.map((code) => ({
            code,
            enabled: false,
          })),
        },
        requestContext: ownerA,
      }),
    ).rejects.toThrow('sección del reporte');
    expect(repository.update).not.toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalledTimes(3);
  });

  it('records rejected stale updates and leaves persistence to the repository transaction', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    vi.mocked(repository.update).mockRejectedValue(
      Object.assign(new Error('stale'), { errorCode: 'STALE_CONFIGURATION' }),
    );
    const useCase = new UpdateCompanyEmailSettings(
      repository,
      audit,
      adminPermissions as never,
    );

    await expect(
      useCase.execute({ input: validDraft, requestContext: ownerA }),
    ).rejects.toMatchObject({ errorCode: 'STALE_CONFIGURATION' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'settings_updated',
        outcome: 'rejected',
        reasonCode: 'PERSISTENCE_ERROR',
      }),
      ownerA,
    );
  });

  it('publishes sanitized terms separately with confirmation and immutable version boundaries', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    vi.mocked(repository.publishTerms).mockResolvedValue(snapshot(41, 2));
    const useCase = new PublishTermsVersion(
      repository,
      audit,
      adminPermissions as never,
    );

    await useCase.execute({
      input: {
        expectedVersion: 1,
        content: '<p>Nuevo</p><script>alert(1)</script>',
        confirmNewAcceptanceRequirement: true,
      },
      requestContext: ownerA,
    });
    const call = vi.mocked(repository.publishTerms).mock.calls[0][0];
    expect(call.requestContext).toBe(ownerA);
    expect(call.sanitizedContent).toBe('<p>Nuevo</p>');
    expect(call.expectedVersion).toBe(1);

    await expect(
      useCase.execute({
        input: {
          expectedVersion: 2,
          content: '<p>Otro</p>',
          confirmNewAcceptanceRequirement: false,
        } as never,
        requestContext: ownerA,
      }),
    ).rejects.toMatchObject({ errorCode: 'VALIDATION_ERROR' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'terms_published',
        outcome: 'rejected',
      }),
      ownerA,
    );
  });

  it('propagates duplicate and stale terms errors without mutating the prior acceptance history', async () => {
    const repository = buildRepository();
    const audit = buildAudit();
    vi.mocked(repository.publishTerms)
      .mockRejectedValueOnce(
        Object.assign(new Error('duplicate'), {
          errorCode: 'DUPLICATE_TERMS_CONTENT',
        }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error('stale'), { errorCode: 'STALE_CONFIGURATION' }),
      );
    const useCase = new PublishTermsVersion(
      repository,
      audit,
      adminPermissions as never,
    );

    for (const expectedVersion of [1, 2]) {
      await expect(
        useCase.execute({
          input: {
            expectedVersion,
            content: '<p>Legal</p>',
            confirmNewAcceptanceRequirement: true,
          },
          requestContext: ownerA,
        }),
      ).rejects.toBeDefined();
    }
    expect(repository.publishTerms).toHaveBeenCalledTimes(2);
    expect(audit.record).toHaveBeenCalledTimes(2);
  });

  it('resolves policy per code and per tenant, including selected sections and admin recipients', async () => {
    const repository = buildRepository();
    const policyA: DeliveryPolicy = {
      code: 'admin_daily_report',
      enabled: true,
      recipients: ['a@test.com'],
      selectedSections: ['statistical_summary', 'pending_licenses'],
      welcomeMessage: 'Hola A',
      diagnostics: [],
    };
    const policyB: DeliveryPolicy = {
      ...policyA,
      code: 'employee_daily_reminder',
      recipients: [],
      welcomeMessage: 'Hola B',
    };
    vi.mocked(repository.resolvePolicy).mockImplementation(
      async ({ requestContext, code }) =>
        requestContext.values.ownerId === 41
          ? { ...policyA, code }
          : { ...policyB, code },
    );
    const useCase = new ResolveEmailDeliveryPolicy(repository);

    const resultA = await useCase.execute({
      input: { code: 'admin_daily_report' },
      requestContext: ownerA,
    });
    const resultB = await useCase.execute({
      input: { code: 'employee_daily_reminder' },
      requestContext: ownerB,
    });
    expect(resultA).toMatchObject({
      recipients: ['a@test.com'],
      selectedSections: ['statistical_summary', 'pending_licenses'],
    });
    expect(resultB).toMatchObject({ recipients: [], welcomeMessage: 'Hola B' });
    expect(repository.resolvePolicy).toHaveBeenNthCalledWith(1, {
      requestContext: ownerA,
      code: 'admin_daily_report',
    });
    expect(repository.resolvePolicy).toHaveBeenNthCalledWith(2, {
      requestContext: ownerB,
      code: 'employee_daily_reminder',
    });
  });

  it('queries audit with tenant scope and defaults while denying unauthorized users', async () => {
    const repository = buildAudit();
    vi.mocked(repository.list).mockResolvedValue({
      data: [],
      meta: { page: 2, limit: 10, totalItems: 0, totalPages: 0 },
    });
    const useCase = new GetCompanyEmailSettingsAudit(
      repository,
      adminPermissions as never,
    );
    const result = await useCase.execute({
      input: { page: 2, limit: 10, outcome: 'accepted' },
      requestContext: ownerA,
    });

    expect(result.meta).toMatchObject({ page: 2, limit: 10 });
    expect(repository.list).toHaveBeenCalledWith({
      requestContext: ownerA,
      page: 2,
      limit: 10,
      outcome: 'accepted',
    });

    const denied = new GetCompanyEmailSettingsAudit(
      repository,
      noPermissions as never,
    );
    await expect(
      denied.execute({ requestContext: ownerB }),
    ).rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
    expect(repository.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'access_rejected',
        outcome: 'rejected',
        reasonCode: 'FORBIDDEN',
      }),
      ownerB,
    );
  });

  it('returns the current terms from lazy provisioning for Disclaimer consumers', async () => {
    const repository = buildRepository();
    vi.mocked(repository.ensure).mockResolvedValue(snapshot(41));
    const useCase = new GetCurrentTermsVersion(repository);
    const result = await useCase.execute({ requestContext: ownerA });

    expect(result?.content).toBe('<p>Legal inicial</p>');
    expect(repository.ensure).toHaveBeenCalledWith(ownerA);
  });
});
