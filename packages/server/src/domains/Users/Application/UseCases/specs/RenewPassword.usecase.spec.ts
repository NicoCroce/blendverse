import { describe, expect, it, vi } from 'vitest';
import { RenewPassword } from '../RenewPassword.usecase';
import { AppError, RequestContext } from '@server/Application';

vi.mock('@server/utils/bcrypt', () => ({
  getCryptedPassword: vi.fn((pw: string) => `hashed:${pw}`),
}));

const requestContext = new RequestContext(1, 'req-1', 10);

describe('RenewPassword usecase', () => {
  it('throws AppError when new passwords do not match', async () => {
    const useCase = new RenewPassword({} as never);

    await expect(
      useCase.execute({
        input: {
          mail: 'u@t.com',
          newPassword: 'pass0001',
          rePassword: 'pass0002',
        },
        requestContext,
      }),
    ).rejects.toThrow('Las contraseñas nuevas no coinciden');
  });

  it('calls renewPassword on the repository when passwords match', async () => {
    const repository = { renewPassword: vi.fn().mockResolvedValue(undefined) };

    const useCase = new RenewPassword(repository as never);
    await useCase.execute({
      input: {
        mail: 'u@t.com',
        newPassword: 'pass0001',
        rePassword: 'pass0001',
      },
      requestContext,
    });

    expect(repository.renewPassword).toHaveBeenCalledWith(
      expect.objectContaining({ mail: 'u@t.com', requestContext }),
    );
  });

  it('throws AppError when repository throws during password renewal', async () => {
    const repository = {
      renewPassword: vi.fn().mockRejectedValue(new Error('DB error')),
    };

    const useCase = new RenewPassword(repository as never);

    await expect(
      useCase.execute({
        input: {
          mail: 'u@t.com',
          newPassword: 'pass0001',
          rePassword: 'pass0001',
        },
        requestContext,
      }),
    ).rejects.toThrow(AppError);
  });
});
