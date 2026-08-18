import { describe, expect, it, vi } from 'vitest';
import { GetPermissionsByUser } from '../GetPermissionsByUser.usecase';
import { RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetPermissionsByUser usecase', () => {
  it('delegates to the repository and returns user permissions', async () => {
    const perms = ['users:read', 'users:write'];
    const repository = {
      getPermissionsByUser: vi.fn().mockResolvedValue(perms),
    };

    const useCase = new GetPermissionsByUser(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(perms);
    expect(repository.getPermissionsByUser).toHaveBeenCalledWith({
      requestContext,
    });
  });
});
