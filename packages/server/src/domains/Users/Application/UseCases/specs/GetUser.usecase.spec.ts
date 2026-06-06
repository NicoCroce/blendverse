import { describe, expect, it, vi } from 'vitest';
import { GetUser } from '../GetUser.usecase';
import { AppError, RequestContext } from '@server/Application';
import { User } from '../../../Domain/User.entity';

const requestContext = new RequestContext(1, 'req-1', 10);
const makeUser = () => User.create({ id: 1, mail: 'u@test.com', name: 'User' });

describe('GetUser usecase', () => {
  it('returns the user when found', async () => {
    const user = makeUser();
    const repository = { getUser: vi.fn().mockResolvedValue(user) };

    const useCase = new GetUser(repository as never);
    const result = await useCase.execute({ input: 1, requestContext });

    expect(result).toBe(user);
    expect(repository.getUser).toHaveBeenCalledWith({ id: 1, requestContext });
  });

  it('throws AppError with 404 when user is not found', async () => {
    const repository = { getUser: vi.fn().mockResolvedValue(null) };

    const useCase = new GetUser(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow(AppError);
  });

  it('throws error with message "User not found"', async () => {
    const repository = { getUser: vi.fn().mockResolvedValue(null) };

    const useCase = new GetUser(repository as never);

    await expect(
      useCase.execute({ input: 99, requestContext }),
    ).rejects.toThrow('User not found');
  });
});
