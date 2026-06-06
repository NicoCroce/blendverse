import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { PermissionsController } from '../Permissions.controller';

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
  getPermissions = vi.fn().mockResolvedValue([]),
  getRoles = vi.fn().mockResolvedValue([]),
  getPermissionsByUser = vi.fn().mockResolvedValue([]),
  getRoleByUser = vi.fn().mockResolvedValue('Full Admin'),
) => {
  const service = {
    getPermissions,
    getRoles,
    getPermissionsByUser,
    getRoleByUser,
  } as never;

  const controller = new PermissionsController(service);

  const permissionsRouter = router({
    getPermissions: controller.getPermissions(),
    getRoles: controller.getRoles(),
    getPermissionByUser: controller.getPermissionByUser(),
    getRoleByUser: controller.getRoleByUser(),
  });

  return {
    service,
    caller: permissionsRouter.createCaller({
      requestContext,
      cookies: { auth_token: 'mock-token' },
      res: {},
    } as never),
  };
};

describe('PermissionsController', () => {
  it('calls getPermissions service without input', async () => {
    const perms = [{ name: 'x' }];
    const { caller, service } = buildCaller(vi.fn().mockResolvedValue(perms));

    const result = await caller.getPermissions();

    expect(
      (service as { getPermissions: ReturnType<typeof vi.fn> }).getPermissions,
    ).toHaveBeenCalledWith(expect.objectContaining({ requestContext }));
    expect(result).toBe(perms);
  });

  it('calls getRoles service without input', async () => {
    const roles = [{ name: 'Admin' }];
    const { caller } = buildCaller(vi.fn(), vi.fn().mockResolvedValue(roles));

    const result = await caller.getRoles();

    expect(result).toBe(roles);
  });

  it('calls getPermissionsByUser service', async () => {
    const userPerms = ['users:read'];
    const { caller, service } = buildCaller(
      vi.fn(),
      vi.fn(),
      vi.fn().mockResolvedValue(userPerms),
    );

    const result = await caller.getPermissionByUser();

    expect(
      (service as { getPermissionsByUser: ReturnType<typeof vi.fn> })
        .getPermissionsByUser,
    ).toHaveBeenCalledWith(expect.objectContaining({ requestContext }));
    expect(result).toBe(userPerms);
  });

  it('calls getRoleByUser service with a valid userId', async () => {
    const { caller, service } = buildCaller(
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn().mockResolvedValue('Viewer'),
    );

    const result = await caller.getRoleByUser(7);

    expect(
      (service as { getRoleByUser: ReturnType<typeof vi.fn> }).getRoleByUser,
    ).toHaveBeenCalledWith({
      input: 7,
      requestContext,
    });
    expect(result).toBe('Viewer');
  });
});
