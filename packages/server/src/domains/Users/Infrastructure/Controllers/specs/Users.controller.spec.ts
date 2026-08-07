import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { UsersController } from '../Users.controller';

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

vi.mock('@server/utils', () => ({
  paginationZodParams: {},
}));

import { router } from '@server/Infrastructure';

const requestContext = new RequestContext(1, 'req-1', 10);

const buildCaller = (
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) => {
  const service = {
    getUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    getUser: vi.fn().mockResolvedValue({}),
    registerUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue(1),
    updateUser: vi.fn().mockResolvedValue(1),
    changePassword: vi.fn().mockResolvedValue(undefined),
    getSelectUser: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as never;

  const controller = new UsersController(service);

  const usersRouter = router({
    changePassword: controller.changePassword(),
  });

  return {
    service,
    caller: usersRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('UsersController', () => {
  it('changes password with valid input', async () => {
    const { caller, service } = buildCaller({
      changePassword: vi.fn().mockResolvedValue(undefined),
    });

    await caller.changePassword({
      password: 'old',
      newPassword: 'new',
      rePassword: 'new',
    });

    expect(
      (service as { changePassword: ReturnType<typeof vi.fn> }).changePassword,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ password: 'old' }),
        requestContext,
      }),
    );
  });
});
