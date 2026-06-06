import { describe, expect, it, vi } from 'vitest';
import { DeleteUser } from '../DeleteUser.usecase';
import { AppError, RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('DeleteUser usecase', () => {
  it('returns the deleted user id when repository succeeds', async () => {
    const repository = { deleteUser: vi.fn().mockResolvedValue(5) };

    const useCase = new DeleteUser(repository as never);
    const result = await useCase.execute({ input: 5, requestContext });

    expect(result).toBe(5);
    expect(repository.deleteUser).toHaveBeenCalledWith({
      id: 5,
      requestContext,
    });
  });

  it('throws AppError when repository returns falsy', async () => {
    const repository = { deleteUser: vi.fn().mockResolvedValue(0) };

    const useCase = new DeleteUser(repository as never);

    await expect(useCase.execute({ input: 5, requestContext })).rejects.toThrow(
      AppError,
    );
  });

  it('throws error with expected message when delete fails', async () => {
    const repository = { deleteUser: vi.fn().mockResolvedValue(null) };

    const useCase = new DeleteUser(repository as never);

    await expect(useCase.execute({ input: 5, requestContext })).rejects.toThrow(
      "User can't be deleted",
    );
  });
});
