import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ChangePassword } from '../ChangePassword.usecase';
import { RequestContext } from '@server/Application';
import { User } from '../../../Domain/User.entity';

vi.mock('@server/utils/bcrypt', () => ({
  getCryptedPassword: vi.fn((pw: string) => `hashed:${pw}`),
  comparePassword: vi.fn(),
}));

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

import { executeUseCase } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);
const validUser = User.create({
  id: 1,
  mail: 'u@t.com',
  name: 'User',
  password: 'hashedPass1',
});

describe('ChangePassword usecase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws AppError when new passwords do not match', async () => {
    const useCase = new ChangePassword({} as never, {} as never);

    await expect(
      useCase.execute({
        input: { password: 'old', newPassword: 'new1', rePassword: 'new2' },
        requestContext,
      }),
    ).rejects.toThrow('Las contraseñas nuevas no coinciden');
  });

  it('throws AppError when validateUserPassword returns null/falsy', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(null as never);

    const useCase = new ChangePassword({} as never, {} as never);

    await expect(
      useCase.execute({
        input: { password: 'old', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).rejects.toThrow('No se puede validar el usuario');
  });

  it('changes password when user is validated and passwords match', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(validUser as never);

    const repository = { changePassword: vi.fn().mockResolvedValue(undefined) };
    const useCase = new ChangePassword(repository as never, {} as never);

    await expect(
      useCase.execute({
        input: { password: 'old', newPassword: 'new123', rePassword: 'new123' },
        requestContext,
      }),
    ).resolves.toBeUndefined();

    expect(repository.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
  });

  it('throws AppError when repository throws during password change', async () => {
    vi.mocked(executeUseCase).mockResolvedValue(validUser as never);

    const repository = {
      changePassword: vi.fn().mockRejectedValue(new Error('DB error')),
    };
    const useCase = new ChangePassword(repository as never, {} as never);

    await expect(
      useCase.execute({
        input: { password: 'old', newPassword: 'new', rePassword: 'new' },
        requestContext,
      }),
    ).rejects.toThrow('No se pudo cambiar la constraseña');
  });
});
