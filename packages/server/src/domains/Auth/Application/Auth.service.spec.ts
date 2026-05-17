import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './Auth.service';

vi.mock('@server/domains/Users', async () => {
  const { User } = await import('@server/domains/Users/Domain/User.entity');
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
    const requestContext = new RequestContext(1, 'req-1', 10);

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
});
