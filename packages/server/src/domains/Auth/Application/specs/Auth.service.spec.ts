import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../Auth.service';

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

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

vi.mock('@server/utils', () => ({
  verifyToken: verifyTokenMock,
}));

import { User } from '@server/domains/Users';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );

  return {
    ...actual,
    executeUseCase: vi.fn(),
  };
});

describe('AuthService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates login execution and only logs the user mail', async () => {
    const loginUseCase = { execute: vi.fn() };
    const expectedResponse = {
      token: 'signed-token',
      user: User.create({
        id: 1,
        mail: 'john@example.com',
        name: 'John',
        ownerId: 10,
      }),
      theme: 2,
    };

    vi.mocked(executeUseCase).mockResolvedValue(expectedResponse);

    const authService = new AuthService(
      loginUseCase as never,
      {} as never,
      {} as never,
    );

    const response = await authService.login({
      input: {
        mail: 'john@example.com',
        password: '12345678',
      },
      requestContext,
    });

    expect(response).toBe(expectedResponse);
    expect(executeUseCase).toHaveBeenCalledWith({
      useCase: loginUseCase,
      input: {
        mail: 'john@example.com',
        password: '12345678',
      },
      requestContext,
      inputLog: {
        mail: 'john@example.com',
      },
    });
  });

  it('delegates restorePassword to executeUseCase', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(undefined as never);

    const authService = new AuthService({} as never, {} as never, {} as never);
    await authService.restorePassword({
      input: 'user@test.com',
      requestContext,
    });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ input: 'user@test.com', requestContext }),
    );
  });

  it('throws AppError when renewPasswordAuth is called without a token', async () => {
    const authService = new AuthService({} as never, {} as never, {} as never);

    await expect(
      authService.renewPasswordAuth({
        input: { token: '', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).rejects.toThrow('Token not provided');
  });

  it('throws AppError when token verification fails in renewPasswordAuth', async () => {
    verifyTokenMock.mockRejectedValueOnce(new Error('bad token'));
    const authService = new AuthService(
      {} as never,
      {} as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      authService.renewPasswordAuth({
        input: { token: 'bad-token', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).rejects.toThrow('Token error');
  });
});
