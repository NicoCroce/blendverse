import { describe, expect, it, vi } from 'vitest';
import { RestorePassword } from '../RestorePassword.usecase';
import { AppError, RequestContext } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

describe('RestorePassword usecase', () => {
  it('calls restorePassword on the repository with the provided mail', async () => {
    const repository = {
      restorePassword: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new RestorePassword(repository as never);
    await useCase.execute({ input: 'user@test.com', requestContext });

    expect(repository.restorePassword).toHaveBeenCalledWith({
      mail: 'user@test.com',
      requestContext,
    });
  });

  it('throws AppError when repository throws', async () => {
    const repository = {
      restorePassword: vi.fn().mockRejectedValue(new Error('SMTP error')),
    };

    const useCase = new RestorePassword(repository as never);

    await expect(
      useCase.execute({ input: 'user@test.com', requestContext }),
    ).rejects.toThrow(AppError);
  });

  it('throws error with message "No se pudo reestablecer la constraseña"', async () => {
    const repository = {
      restorePassword: vi.fn().mockRejectedValue(new Error('fail')),
    };

    const useCase = new RestorePassword(repository as never);

    await expect(
      useCase.execute({ input: 'user@test.com', requestContext }),
    ).rejects.toThrow('No se pudo reestablecer la constraseña');
  });
});
