import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { OwnersyssController } from './Ownersyss.controller';

vi.mock('@server/Infrastructure', async () => {
  const { router, protectedProcedure } =
    await import('@server/Infrastructure/trpc/TrpcInstance.js');
  return { router, protectedProcedure };
});

vi.mock('@server/utils/JWT', () => ({
  generateToken: vi.fn(() => 'signed-token'),
  verifyToken: vi.fn(() => ({ id: 1, ownerId: 10 })),
}));

vi.mock('@server/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { router } from '@server/Infrastructure';

const requestContext = new RequestContext(1, 'req-1', 10);

const buildCaller = (
  getOwnersys = vi.fn(),
  updateTheme = vi.fn(),
  getOwnerTheme = vi.fn(),
) => {
  const service = { getOwnersys, updateTheme, getOwnerTheme } as never;
  const controller = new OwnersyssController(service);

  const ownersyssRouter = router({
    getOwnersys: controller.getOwnersys(),
    updateTheme: controller.updateTheme(),
    getOwnerTheme: controller.getOwnerTheme(),
  });

  return {
    getOwnersys,
    updateTheme,
    getOwnerTheme,
    caller: ownersyssRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('OwnersyssController', () => {
  it('calls getOwnersys service with valid id', async () => {
    const owner = { id: 1, denominacion: 'Acme' };
    const { caller, getOwnersys } = buildCaller(
      vi.fn().mockResolvedValue(owner),
    );

    const result = await caller.getOwnersys(1);

    expect(getOwnersys).toHaveBeenCalledWith({ input: 1, requestContext });
    expect(result).toBe(owner);
  });

  it('rejects getOwnersys when ID is less than 1', async () => {
    const { caller } = buildCaller();
    await expect(caller.getOwnersys(0)).rejects.toThrow();
  });

  it('calls updateTheme service with valid theme id', async () => {
    const { caller, updateTheme } = buildCaller(
      vi.fn(),
      vi.fn().mockResolvedValue(2),
    );

    const result = await caller.updateTheme(2);

    expect(updateTheme).toHaveBeenCalledWith({ input: 2, requestContext });
    expect(result).toBe(2);
  });

  it('calls getOwnerTheme without input', async () => {
    const { caller, getOwnerTheme } = buildCaller(
      vi.fn(),
      vi.fn(),
      vi.fn().mockResolvedValue(3),
    );

    const result = await caller.getOwnerTheme();

    expect(getOwnerTheme).toHaveBeenCalledWith({ requestContext });
    expect(result).toBe(3);
  });
});
