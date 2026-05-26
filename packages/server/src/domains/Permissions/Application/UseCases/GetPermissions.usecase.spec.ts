import { describe, expect, it, vi } from 'vitest';
import { GetPermissions } from './GetPermissions.usecase';
import { RequestContext } from '@server/Application';
import { Permissions } from '../../Domain/Permissions.entity';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetPermissions usecase', () => {
  it('returns all permissions from the repository', async () => {
    const perms = [Permissions.create({ name: 'x', description: 'y' })];
    const repository = { getPermissions: vi.fn().mockResolvedValue(perms) };

    const useCase = new GetPermissions(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(perms);
    expect(repository.getPermissions).toHaveBeenCalledWith({ requestContext });
  });
});
