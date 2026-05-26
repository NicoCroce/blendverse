import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UpdateUser } from './UpdateUser.usecase';
import { AppError, RequestContext } from '@server/Application';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

vi.mock('@server/domains/Permissions', () => ({
  AssociateUserToRole: class AssociateUserToRole {},
}));
vi.mock('@server/domains/Userprofiles', () => ({
  AssociateUserToProfile: class AssociateUserToProfile {},
}));

import { executeUseCase } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

const validInput = {
  id: 1,
  mail: 'u@test.com',
  name: 'User Name',
  role: 'Admin',
  profile: '3',
};

describe('UpdateUser usecase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws AppError when repository returns falsy', async () => {
    const repository = { updateUser: vi.fn().mockResolvedValue(0) };

    const useCase = new UpdateUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({ input: validInput, requestContext }),
    ).rejects.toThrow(AppError);
  });

  it('throws error with expected message when update fails', async () => {
    const repository = { updateUser: vi.fn().mockResolvedValue(null) };

    const useCase = new UpdateUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({ input: validInput, requestContext }),
    ).rejects.toThrow("The user can't be updated");
  });

  it('calls updateUser on the repository with correct user', async () => {
    const repository = { updateUser: vi.fn().mockResolvedValue(1) };
    vi.mocked(executeUseCase).mockResolvedValue(undefined as never);

    const useCase = new UpdateUser(
      repository as never,
      {} as never,
      {} as never,
    );

    const result = await useCase.execute({ input: validInput, requestContext });

    expect(repository.updateUser).toHaveBeenCalledOnce();
    expect(repository.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(1);
  });

  it('throws AppError when AssociateUserToRole fails', async () => {
    const repository = { updateUser: vi.fn().mockResolvedValue(1) };
    vi.mocked(executeUseCase).mockRejectedValueOnce(new Error('Role error'));

    const useCase = new UpdateUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({ input: validInput, requestContext }),
    ).rejects.toThrow("Can't assign the rol");
  });
});
