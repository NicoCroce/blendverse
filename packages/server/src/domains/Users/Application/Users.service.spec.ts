import { RequestContext } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './Users.service';

vi.mock('@server/Application/Adapters/ExecuteUseCase', () => ({
  executeUseCase: vi.fn(),
}));

import { executeUseCase as executeUseCaseMock } from '@server/Application/Adapters/ExecuteUseCase';

describe('UsersService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  const buildService = () =>
    new UsersService(
      {} as never, // getUsers
      {} as never, // getUser
      {} as never, // registerUser
      {} as never, // deleteUser
      {} as never, // updateUser
      {} as never, // changePassword
      {} as never, // getSelectUser
      {} as never, // getEmailsByUsersId
    );

  it('delegates getUsers to executeUseCase', async () => {
    const response = { data: [], total: 0 };
    vi.mocked(executeUseCaseMock).mockResolvedValue(response as never);

    const service = buildService();
    const result = await service.getUsers({ requestContext });

    expect(executeUseCaseMock).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(response);
  });

  it('delegates getUser to executeUseCase', async () => {
    const user = { id: 1 };
    vi.mocked(executeUseCaseMock).mockResolvedValue(user as never);

    const service = buildService();
    const result = await service.getUser({ input: 1, requestContext });

    expect(executeUseCaseMock).toHaveBeenCalledWith(
      expect.objectContaining({ input: 1, requestContext }),
    );
    expect(result).toBe(user);
  });

  it('delegates registerUser with masked inputLog (no password)', async () => {
    const user = { id: 99 };
    vi.mocked(executeUseCaseMock).mockResolvedValue(user as never);

    const service = buildService();
    await service.registerUser({
      input: {
        mail: 'a@b.com',
        name: 'AB',
        password: 'secret',
        rePassword: 'secret',
        role: null,
        profile: null,
      },
      requestContext,
    });

    const call = vi.mocked(executeUseCaseMock).mock.calls[0][0];
    expect((call as { inputLog: unknown }).inputLog).toEqual({
      mail: 'a@b.com',
      name: 'AB',
    });
  });

  it('delegates deleteUser to executeUseCase', async () => {
    vi.mocked(executeUseCaseMock).mockResolvedValue(5 as never);

    const service = buildService();
    const result = await service.deleteUser({ input: 5, requestContext });

    expect(result).toBe(5);
  });

  it('delegates changePassword to executeUseCase', async () => {
    vi.mocked(executeUseCaseMock).mockResolvedValue(undefined as never);

    const service = buildService();
    await expect(
      service.changePassword({
        input: { password: 'old', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).resolves.toBeUndefined();
  });
});
