import { TRPCError } from '@trpc/server';
import { RequestContext } from '@server/Application';
import { describe, expect, it, vi } from 'vitest';
import { AuthController } from '../Auth.controller';

vi.mock('@server/Infrastructure', async () => {
  const { router, procedure, protectedProcedure } =
    await import('@server/Infrastructure/trpc/TrpcInstance.js');
  return { router, procedure, protectedProcedure };
});
vi.mock('@server/domains/Users', async () => {
  const { User } = await import('@server/domains/Users/Domain/User.entity.js');
  return {
    User,
    ValidateUserPassword: class ValidateUserPassword {},
    RenewPassword: class RenewPassword {},
  };
});
vi.mock('@server/domains/Permissions', () => ({
  GetRoleByUser: class GetRoleByUser {},
}));
vi.mock('@server/domains/Ownersyss', () => ({
  GetOwnersys: class GetOwnersys {},
}));

import { router } from '@server/Infrastructure';
import { User } from '@server/domains/Users';

const requestContext = new RequestContext(1, 'req-1', 10);

const buildCaller = (login = vi.fn()) => {
  const response = {
    cookie: vi.fn(),
  };
  const controller = new AuthController({
    login,
  } as never);
  const authRouter = router({
    login: controller.login(),
  });

  return {
    login,
    response,
    caller: authRouter.createCaller({
      requestContext,
      res: response,
    } as never),
  };
};

describe('AuthController', () => {
  it('validates input, delegates login and sets the auth cookie', async () => {
    const loginResponse = {
      token: 'signed-token',
      user: User.create({
        id: 1,
        mail: 'john@example.com',
        name: 'John',
        ownerId: 10,
        rol: 'Full Admin',
      }),
      theme: 3,
    };
    const { caller, response, login } = buildCaller(
      vi.fn().mockResolvedValue(loginResponse),
    );

    const result = await caller.login({
      mail: 'john@example.com',
      password: '12345678',
    });

    expect(login).toHaveBeenCalledWith({
      input: {
        mail: 'john@example.com',
        password: '12345678',
      },
      requestContext,
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'auth_token',
      'signed-token',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }),
    );
    expect(result).toEqual({
      id: 1,
      mail: 'john@example.com',
      name: 'John',
      renewPassword: false,
      userImage: undefined,
      ownerId: 10,
      companyLogo: undefined,
      companyName: undefined,
      rol: 'Full Admin',
      theme: 3,
    });
  });

  it('rejects invalid login input before calling the service', async () => {
    const { caller, login } = buildCaller();

    await expect(
      caller.login({
        mail: 123 as never,
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(TRPCError);
    expect(login).not.toHaveBeenCalled();
  });
});
