import { RequestContext, executeUseCase } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionsService } from '../Permissions.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

describe('PermissionsService', () => {
  const requestContext = new RequestContext(1, 'req-1', 10);

  beforeEach(() => vi.clearAllMocks());

  const buildService = () =>
    new PermissionsService(
      {} as never, // getPermissions
      {} as never, // getRoles
      {} as never, // getPermissionsByUser
      {} as never, // getRoleByUser
    );

  it('delegates getPermissions to executeUseCase', async () => {
    const perms = [{ name: 'x' }];
    vi.mocked(executeUseCase).mockResolvedValue(perms as never);

    const service = buildService();
    const result = await service.getPermissions({ requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(perms);
  });

  it('delegates getRoles to executeUseCase', async () => {
    const roles = [{ name: 'Admin' }];
    vi.mocked(executeUseCase).mockResolvedValue(roles as never);

    const service = buildService();
    const result = await service.getRoles({ requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    expect(result).toBe(roles);
  });

  it('delegates getPermissionsByUser to executeUseCase', async () => {
    const userPerms = ['users:read'];
    vi.mocked(executeUseCase).mockResolvedValue(userPerms as never);

    const service = buildService();
    const result = await service.getPermissionsByUser({ requestContext });

    expect(result).toBe(userPerms);
  });

  it('delegates getRoleByUser with userId input to executeUseCase', async () => {
    vi.mocked(executeUseCase).mockResolvedValue('Full Admin' as never);

    const service = buildService();
    const result = await service.getRoleByUser({ input: 5, requestContext });

    expect(executeUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ input: 5, requestContext }),
    );
    expect(result).toBe('Full Admin');
  });
});
