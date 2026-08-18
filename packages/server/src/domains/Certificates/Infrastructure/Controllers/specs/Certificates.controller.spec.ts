import { describe, it, expect, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { RequestContext } from '@server/Application';
import { CertificatesController } from '../Certificates.controller';

vi.mock('@server/Infrastructure', async () => {
  const { initTRPC } = await import('@trpc/server');
  const t = initTRPC.create();
  return { router: t.router, protectedProcedure: t.procedure };
});

vi.mock('@server/Infrastructure/utils/JWT', () => ({
  generateToken: vi.fn(() => 'signed-token'),
  verifyToken: vi.fn(() => ({ id: 1, ownerId: 10 })),
}));

vi.mock('@server/Infrastructure/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { router } from '@server/Infrastructure';

const requestContext = new RequestContext(1, 'req-test', 10);

const buildCaller = (
  addCertificate = vi.fn(),
  updateCertificateStatus = vi.fn(),
) => {
  const service = {
    getCertificates: vi.fn(),
    getCertificateTypes: vi.fn(),
    addCertificate,
    getCertificatesByCompany: vi.fn(),
    getStatisticsByCertificates: vi.fn(),
    getMonthlyStatisticsByCertificates: vi.fn(),
    deleteCertificate: vi.fn(),
    updateCertificateStatus,
  } as never;
  const controller = new CertificatesController(service);
  const certificatesRouter = router({
    addCertificate: controller.addCertificate,
    updateCertificateStatus: controller.updateCertificateStatus,
  });

  return {
    addCertificate,
    updateCertificateStatus,
    caller: certificatesRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('CertificatesController', () => {
  it('validates input, delegates to service and returns the result', async () => {
    const serviceResponse = {
      id: 1,
      startDate: '10 de enero',
      endDate: '20 de enero',
      returnDate: '25 de enero',
      reason: 'Vacaciones',
      type: 'Anual',
      requiresRest: false,
    };
    const { caller, addCertificate } = buildCaller(
      vi.fn().mockResolvedValue(serviceResponse),
    );

    const result = await caller.addCertificate({
      startDate: '2026-01-10',
      endDate: '2026-01-20',
      returnDate: '2026-01-25',
      reason: 'Vacaciones',
      type: 2,
      requiresRest: false,
    });

    expect(addCertificate).toHaveBeenCalledWith({
      input: {
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        returnDate: '2026-01-25',
        reason: 'Vacaciones',
        type: 2,
        requiresRest: false,
      },
      requestContext,
    });
    expect(result).toMatchObject(serviceResponse);
  });

  it('rejects missing returnDate before calling the service', async () => {
    const { caller, addCertificate } = buildCaller();

    await expect(
      caller.addCertificate({
        startDate: '2026-01-10',
        endDate: '2026-01-20',
        reason: 'Test',
        type: 1,
      } as never),
    ).rejects.toBeInstanceOf(TRPCError);

    expect(addCertificate).not.toHaveBeenCalled();
  });

  it('defaults requiresRest to false when not provided', async () => {
    const serviceResponse = {
      id: 1,
      startDate: '10 de enero',
      endDate: '20 de enero',
      returnDate: '25 de enero',
      reason: 'Test',
      type: 'Anual',
      requiresRest: false,
    };
    const { caller, addCertificate } = buildCaller(
      vi.fn().mockResolvedValue(serviceResponse),
    );

    await caller.addCertificate({
      startDate: '2026-01-10',
      endDate: '2026-01-20',
      returnDate: '2026-01-25',
      reason: 'Test',
      type: 1,
    });

    expect(addCertificate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          requiresRest: false,
        }),
      }),
    );
  });

  it('rejects invalid status value before calling the service', async () => {
    const { caller, updateCertificateStatus } = buildCaller();

    await expect(
      caller.updateCertificateStatus({
        id: 1,
        status: 'invalid-status',
      } as never),
    ).rejects.toBeInstanceOf(TRPCError);

    expect(updateCertificateStatus).not.toHaveBeenCalled();
  });
});
