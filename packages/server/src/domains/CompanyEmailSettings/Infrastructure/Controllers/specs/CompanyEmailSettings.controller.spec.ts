import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { initTRPC } from '@trpc/server';
import { EMAIL_CATALOG_CODES, REPORT_SECTION_CODES } from '../../../Domain';
import { CompanyEmailSettingsController } from '../CompanyEmailSettings.controller';

vi.mock('@server/Infrastructure/trpc', async () => {
  const { initTRPC: createTRPC } = await import('@trpc/server');
  const t = createTRPC
    .context<{ requestContext: RequestContext; res: unknown }>()
    .create();
  return { protectedProcedure: t.procedure };
});

const testTRPC = initTRPC
  .context<{ requestContext: RequestContext; res: unknown }>()
  .create();
const router = testTRPC.router;

const context = new RequestContext(7, 'controller-request', 41);

const buildCaller = (service: Record<string, ReturnType<typeof vi.fn>>) => {
  const controller = new CompanyEmailSettingsController(service as never);
  const settingsRouter = router({
    get: controller.get,
    update: controller.update,
    publishTerms: controller.publishTerms,
    getAudit: controller.getAudit,
  });
  return settingsRouter.createCaller({
    requestContext: context,
    cookies: { auth_token: 'test-token' },
    res: {},
  } as never);
};

describe('CompanyEmailSettingsController', () => {
  it('validates update input and delegates with the authenticated RequestContext', async () => {
    const update = vi.fn().mockResolvedValue({ ownerId: 41, version: 2 });
    const caller = buildCaller({
      get: vi.fn(),
      update,
      publishTerms: vi.fn(),
      getAudit: vi.fn(),
    });
    const delivery = EMAIL_CATALOG_CODES.map((code) => ({
      code,
      enabled: true,
    }));
    const reportSections = REPORT_SECTION_CODES.map((code) => ({
      code,
      enabled: true,
    }));

    const result = await caller.update({
      expectedVersion: 1,
      delivery,
      adminRecipients: [{ email: 'admin@test.com' }],
      reportSections,
      welcomeMessage: 'Hola',
    });

    expect(result).toEqual({ ownerId: 41, version: 2 });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ expectedVersion: 1 }),
        requestContext: context,
      }),
    );
  });

  it('rejects malformed Zod input before invoking the service', async () => {
    const update = vi.fn();
    const caller = buildCaller({
      get: vi.fn(),
      update,
      publishTerms: vi.fn(),
      getAudit: vi.fn(),
    });

    await expect(
      caller.update({
        expectedVersion: 0,
        delivery: [],
        adminRecipients: [],
        reportSections: [],
        welcomeMessage: null,
      }),
    ).rejects.toBeInstanceOf(TRPCError);
    expect(update).not.toHaveBeenCalled();
  });

  it('keeps publishTerms as a separate confirmed operation', async () => {
    const publishTerms = vi.fn().mockResolvedValue({ ownerId: 41, version: 3 });
    const caller = buildCaller({
      get: vi.fn(),
      update: vi.fn(),
      publishTerms,
      getAudit: vi.fn(),
    });

    await caller.publishTerms({
      expectedVersion: 2,
      content: '<p>Legal</p>',
      confirmNewAcceptanceRequirement: true,
    });
    expect(publishTerms).toHaveBeenCalledWith({
      input: {
        expectedVersion: 2,
        content: '<p>Legal</p>',
        confirmNewAcceptanceRequirement: true,
      },
      requestContext: context,
    });
  });
});
