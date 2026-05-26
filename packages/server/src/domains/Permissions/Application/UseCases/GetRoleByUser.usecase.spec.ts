import { describe, expect, it, vi } from 'vitest';
import { GetRoleByUser } from './GetRoleByUser.usecase';
import { AppError, RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('GetRoleByUser usecase', () => {
  it('returns the role when found', async () => {
    const repository = {
      getRoleByUser: vi.fn().mockResolvedValue('Full Admin'),
    };

    const useCase = new GetRoleByUser(repository as never);
    const result = await useCase.execute({ input: 7, requestContext });

    expect(result).toBe('Full Admin');
    expect(repository.getRoleByUser).toHaveBeenCalledWith({
      userId: 7,
      requestContext,
    });
  });

  it('returns empty string when repository returns null/falsy', async () => {
    const repository = { getRoleByUser: vi.fn().mockResolvedValue(null) };

    const useCase = new GetRoleByUser(repository as never);
    const result = await useCase.execute({ input: 7, requestContext });

    expect(result).toBe('');
  });

  it('throws AppError when repository throws an error', async () => {
    const repository = {
      getRoleByUser: vi.fn().mockRejectedValue(new Error('DB failure')),
    };

    const useCase = new GetRoleByUser(repository as never);

    await expect(useCase.execute({ input: 7, requestContext })).rejects.toThrow(
      AppError,
    );
  });

  it('wraps the error message in the AppError message', async () => {
    const repository = {
      getRoleByUser: vi.fn().mockRejectedValue(new Error('timeout')),
    };

    const useCase = new GetRoleByUser(repository as never);

    await expect(useCase.execute({ input: 7, requestContext })).rejects.toThrow(
      'Error al obtener el rol del usuario con ID 7',
    );
  });
});
