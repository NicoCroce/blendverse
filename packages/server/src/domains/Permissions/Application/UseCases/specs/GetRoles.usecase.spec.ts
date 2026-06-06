import { describe, expect, it, vi } from 'vitest';
import { GetRoles } from '../GetRoles.usecase';
import { RequestContext } from '@server/Application';
import { Roles } from '../../../Domain/Roles.entity';

const makeRole = () =>
  Roles.create({
    name: 'Full Admin',
    description: 'All access',
    permissions: ['users:read'],
    hierarchy: 1,
  });

describe('GetRoles usecase', () => {
  it('returns roles with hierarchy <= user role hierarchy', async () => {
    const userRole = makeRole();
    const roles = [makeRole()];

    const repository = {
      getRoleByUserId: vi.fn().mockResolvedValue(userRole),
      getRolesByMaxHierarchy: vi.fn().mockResolvedValue(roles),
    };

    const requestContext = new RequestContext(5, 'req-1', 10);

    const useCase = new GetRoles(repository as never);
    const result = await useCase.execute({ requestContext });

    expect(result).toBe(roles);
    expect(repository.getRoleByUserId).toHaveBeenCalledWith({ userId: 5 });
    expect(repository.getRolesByMaxHierarchy).toHaveBeenCalledWith({
      maxHierarchy: 1,
    });
  });

  it('throws error when user has no role assigned', async () => {
    const repository = {
      getRoleByUserId: vi.fn().mockResolvedValue(null),
      getRolesByMaxHierarchy: vi.fn(),
    };

    const requestContext = new RequestContext(5, 'req-1', 10);

    const useCase = new GetRoles(repository as never);

    await expect(useCase.execute({ requestContext })).rejects.toThrow(
      'no tiene rol asignado',
    );
  });
});
