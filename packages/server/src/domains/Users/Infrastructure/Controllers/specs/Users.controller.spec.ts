import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { UsersController } from '../Users.controller';

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
    getAll: controller.getUsers(),
    get: controller.getUser(),
    create: controller.registerUser(),
    delete: controller.deleteUser(),
    update: controller.updateUser(),
    changePassword: controller.changePassword(),
    getSelect: controller.getSelectUser(),
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
  it('calls getUsers service', async () => {
    const { caller, service } = buildCaller();
    await caller.getAll(undefined);
    expect(
      (service as { getUsers: ReturnType<typeof vi.fn> }).getUsers,
    ).toHaveBeenCalledWith(expect.objectContaining({ requestContext }));
  });

  it('calls getUser service with a valid id', async () => {
    const user = { id: 1, mail: 'u@t.com' };
    const { caller, service } = buildCaller({
      getUser: vi.fn().mockResolvedValue(user),
    });

    const result = await caller.get(1);

    expect(
      (service as { getUser: ReturnType<typeof vi.fn> }).getUser,
    ).toHaveBeenCalledWith({
      input: 1,
      requestContext,
    });
    expect(result).toBe(user);
  });

  it('registers a new user', async () => {
    const newUser = { id: 5, mail: 'new@test.com' };
    const { caller, service } = buildCaller({
      registerUser: vi.fn().mockResolvedValue(newUser),
    });

    const result = await caller.create({
      name: 'New',
      mail: 'new@test.com',
      password: 'pass',
      rePassword: 'pass',
      role: null,
      profile: null,
    });

    expect(
      (service as { registerUser: ReturnType<typeof vi.fn> }).registerUser,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ mail: 'new@test.com' }),
        requestContext,
      }),
    );
    expect(result).toBe(newUser);
  });

  it('deletes a user with valid id', async () => {
    const { caller, service } = buildCaller({
      deleteUser: vi.fn().mockResolvedValue(3),
    });

    const result = await caller.delete(3);

    expect(
      (service as { deleteUser: ReturnType<typeof vi.fn> }).deleteUser,
    ).toHaveBeenCalledWith({
      input: 3,
      requestContext,
    });
    expect(result).toBe(3);
  });

  it('updates a user with valid input', async () => {
    const { caller, service } = buildCaller({
      updateUser: vi.fn().mockResolvedValue(1),
    });

    const result = await caller.update({
      id: 1,
      name: 'Updated',
      mail: 'u@t.com',
      role: null,
      profile: null,
    });

    expect(
      (service as { updateUser: ReturnType<typeof vi.fn> }).updateUser,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ id: 1, name: 'Updated' }),
        requestContext,
      }),
    );
    expect(result).toBe(1);
  });

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
