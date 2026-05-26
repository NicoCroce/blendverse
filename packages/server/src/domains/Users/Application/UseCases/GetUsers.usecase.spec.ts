import { describe, expect, it, vi } from 'vitest';
import { GetUsers } from './GetUsers.usecase';
import { RequestContext } from '@server/Application';
import { User } from '../../Domain/User.entity';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetUsers usecase', () => {
  it('calls getUsers on the repository and returns the result', async () => {
    const paginatedResponse = {
      data: [User.create({ id: 1, mail: 'u@t.com', name: 'User' })],
      total: 1,
    };
    const repository = {
      getUsers: vi.fn().mockResolvedValue(paginatedResponse),
    };

    const useCase = new GetUsers(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(paginatedResponse);
    expect(repository.getUsers).toHaveBeenCalledWith({
      filters: undefined,
      requestContext,
    });
  });

  it('forwards optional filter input to the repository', async () => {
    const repository = {
      getUsers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    };

    const useCase = new GetUsers(repository as never);
    await useCase.execute({ input: { name: 'Alice' }, requestContext });

    expect(repository.getUsers).toHaveBeenCalledWith({
      filters: { name: 'Alice' },
      requestContext,
    });
  });
});
