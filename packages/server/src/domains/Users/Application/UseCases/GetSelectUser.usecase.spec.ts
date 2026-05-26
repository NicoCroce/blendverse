import { describe, expect, it, vi } from 'vitest';
import { GetSelectUser } from './GetSelectUser.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetSelectUser usecase', () => {
  it('calls getSelectUser on the repository and returns the result', async () => {
    const selectResult = [{ id: 1, nombre: 'Alice' }];
    const repository = {
      getSelectUser: vi.fn().mockResolvedValue(selectResult),
    };

    const useCase = new GetSelectUser(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(selectResult);
    expect(repository.getSelectUser).toHaveBeenCalledWith({
      filters: undefined,
      requestContext,
    });
  });

  it('forwards optional filter input to the repository', async () => {
    const repository = { getSelectUser: vi.fn().mockResolvedValue([]) };

    const useCase = new GetSelectUser(repository as never);
    await useCase.execute({ input: { nombre: 'Bob' }, requestContext });

    expect(repository.getSelectUser).toHaveBeenCalledWith({
      filters: { nombre: 'Bob' },
      requestContext,
    });
  });
});
