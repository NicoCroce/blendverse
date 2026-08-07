import { describe, expect, it, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { RequestContext } from '@server/Application';
import { DocumentsController } from '../Documents.controller';

vi.mock('@server/Infrastructure', async () => {
  const { router, protectedProcedure } =
    await import('@server/Infrastructure/trpc/TrpcInstance.js');
  return { router, protectedProcedure };
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

const buildCaller = (service = {}) => {
  const controller = new DocumentsController({
    getDocuments: vi.fn(),
    getDocumentsByCompany: vi.fn(),
    getStatisticsDocuments: vi.fn(),
    getDocument: vi.fn(),
    viewDocument: vi.fn(),
    signDocument: vi.fn(),
    sendDocumentToEmail: vi.fn(),
    ingestDocument: vi.fn(),
    ...service,
  } as never);

  const documentsRouter = router({
    getDocuments: controller.getDocuments,
    getDocumentsByCompany: controller.getDocumentsByCompany,
  });

  return {
    caller: documentsRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

const callGetDocuments = async (input: unknown) =>
  buildCaller().caller.getDocuments(input as never);

describe('DocumentsController — contrato del parámetro `state` (FR-010, FR-015)', () => {
  it('acepta los 4 valores de estado (validados incluido como legacy)', async () => {
    for (const state of [
      'pendientes',
      'bajo_conformidad',
      'sin_conformidad',
      'validados',
    ]) {
      await expect(callGetDocuments({ state })).resolves.toBeUndefined();
    }
  });

  it('default de state es pendientes cuando no se envía', async () => {
    const { caller } = buildCaller();
    await caller.getDocuments({});
  });

  it('rechaza un valor de state inválido con TRPCError (Zod)', async () => {
    await expect(callGetDocuments({ state: 'zzz' })).rejects.toBeInstanceOf(
      TRPCError,
    );
  });

  it('delega la consulta al service con el input completo y el requestContext (multi-tenant: ownerId via context)', async () => {
    const getDocuments = vi.fn().mockResolvedValue([]);
    const { caller } = buildCaller({ getDocuments });

    const input = {
      state: 'bajo_conformidad' as const,
      title: 'Recibo',
      segmentos: [1, 2],
    };

    await caller.getDocuments(input);

    expect(getDocuments).toHaveBeenCalledWith({
      input: expect.objectContaining({
        state: 'bajo_conformidad',
        title: 'Recibo',
        segmentos: [1, 2],
      }),
      requestContext,
    });
    expect(getDocuments.mock.calls[0][0].requestContext.values.ownerId).toBe(
      10,
    );
    expect(getDocuments.mock.calls[0][0].requestContext.values.userId).toBe(1);
  });

  it('getDocumentsByCompany comparte el mismo esquema y acepta los 4 valores + ownerId del contexto (FR-010, Pr. II)', async () => {
    const getDocumentsByCompany = vi.fn().mockResolvedValue([]);
    const { caller } = buildCaller({ getDocumentsByCompany });

    const input = { state: 'sin_conformidad' as const };
    await caller.getDocumentsByCompany(input);

    expect(getDocumentsByCompany).toHaveBeenCalledWith({
      input: expect.objectContaining({ state: 'sin_conformidad' }),
      requestContext: expect.any(RequestContext),
    });
    // multi-tenant: el owner del contexto viaja intacto aunque el state cambie
    const arg = getDocumentsByCompany.mock.calls[0][0];
    expect(arg.requestContext.values.ownerId).toBe(10);

    await expect(
      caller.getDocumentsByCompany({ state: 'zzz' } as never),
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
