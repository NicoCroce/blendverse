import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { ThemesController } from '../Themes.controller';

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

const buildCaller = (getAllThemes = vi.fn(), getTheme = vi.fn()) => {
  const service = { getAllThemes, getTheme } as never;
  const controller = new ThemesController(service);

  const themesRouter = router({
    getAll: controller.getAllThemes(),
    get: controller.getTheme(),
  });

  return {
    getAllThemes,
    getTheme,
    caller: themesRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('ThemesController', () => {
  it('calls getAllThemes service with optional filter', async () => {
    const themes = [{ id: 1, nombre: 'Dark' }];
    const { caller, getAllThemes } = buildCaller(
      vi.fn().mockResolvedValue(themes),
    );

    const result = await caller.getAll({ nombre: 'Dark' });

    expect(getAllThemes).toHaveBeenCalledWith({
      input: { nombre: 'Dark' },
      requestContext,
    });
    expect(result).toBe(themes);
  });

  it('calls getAllThemes with undefined input when no filter given', async () => {
    const { caller, getAllThemes } = buildCaller(vi.fn().mockResolvedValue([]));

    await caller.getAll(undefined);

    expect(getAllThemes).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
  });

  it('calls getTheme service with the provided id', async () => {
    const theme = { id: 3, nombre: 'Light' };
    const { caller, getTheme } = buildCaller(
      vi.fn(),
      vi.fn().mockResolvedValue(theme),
    );

    const result = await caller.get(3);

    expect(getTheme).toHaveBeenCalledWith({ input: 3, requestContext });
    expect(result).toBe(theme);
  });

  it('rejects getTheme when ID is less than 1', async () => {
    const { caller } = buildCaller(vi.fn(), vi.fn());

    await expect(caller.get(0)).rejects.toThrow();
  });
});
