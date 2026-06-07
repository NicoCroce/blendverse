import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidateUserPassword } from '../ValidateUserPassword.usecase';
import { AppError, RequestContext } from '@server/Application';
import { User } from '@server/domains/Users/Domain/User.entity';

// ── Pino stub ─────────────────────────────────────────────────────────────────
vi.mock('@server/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@server/utils/bcrypt', () => ({
  comparePassword: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeRequestContext = () => new RequestContext(0, 'req-test', 0);

const makeUser = (password = 'hashed-password') =>
  User.create({
    id: 1,
    mail: 'test@example.com',
    name: 'Test User',
    ownerId: 1,
    password,
  });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ValidateUserPassword usecase', () => {
  let comparePasswordMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const bcryptModule = await import('@server/Infrastructure/utils/bcrypt.js');
    comparePasswordMock = vi.mocked(bcryptModule.comparePassword);
  });

  it('returns the user when credentials are valid', async () => {
    const user = makeUser();
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(user) };
    comparePasswordMock.mockResolvedValue(true);

    const useCase = new ValidateUserPassword(usersRepository as never);

    const result = await useCase.execute({
      input: { mail: 'test@example.com', password: 'plaintext' },
      requestContext: makeRequestContext(),
    });

    expect(result.values.mail).toBe('test@example.com');
    expect(result.values.name).toBe('Test User');
  });

  it('calls usersRepository.validateUser with the provided mail', async () => {
    const user = makeUser();
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(user) };
    comparePasswordMock.mockResolvedValue(true);

    const useCase = new ValidateUserPassword(usersRepository as never);

    await useCase.execute({
      input: { mail: 'test@example.com', password: 'plaintext' },
      requestContext: makeRequestContext(),
    });

    expect(usersRepository.validateUser).toHaveBeenCalledOnce();
    expect(usersRepository.validateUser).toHaveBeenCalledWith(
      expect.objectContaining({ mail: 'test@example.com' }),
    );
  });

  it('throws AppError with 404 status when user is not found', async () => {
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(null) };

    const useCase = new ValidateUserPassword(usersRepository as never);

    await expect(
      useCase.execute({
        input: { mail: 'unknown@example.com', password: 'any' },
        requestContext: makeRequestContext(),
      }),
    ).rejects.toThrow(AppError);
  });

  it('throws "Usuario no encontrado" when user is not found', async () => {
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(null) };

    const useCase = new ValidateUserPassword(usersRepository as never);

    await expect(
      useCase.execute({
        input: { mail: 'unknown@example.com', password: 'any' },
        requestContext: makeRequestContext(),
      }),
    ).rejects.toThrow('Usuario no encontrado');
  });

  it('throws "Contraseña incorrecta" when password does not match', async () => {
    const user = makeUser();
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(user) };
    comparePasswordMock.mockResolvedValue(false);

    const useCase = new ValidateUserPassword(usersRepository as never);

    await expect(
      useCase.execute({
        input: { mail: 'test@example.com', password: 'wrong-password' },
        requestContext: makeRequestContext(),
      }),
    ).rejects.toThrow('Contraseña incorrecta');
  });

  it('throws AppError with 401 status when password does not match', async () => {
    const user = makeUser();
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(user) };
    comparePasswordMock.mockResolvedValue(false);

    const useCase = new ValidateUserPassword(usersRepository as never);

    let thrownError: AppError | undefined;
    try {
      await useCase.execute({
        input: { mail: 'test@example.com', password: 'wrong-password' },
        requestContext: makeRequestContext(),
      });
    } catch (e) {
      thrownError = e as AppError;
    }

    expect(thrownError).toBeInstanceOf(AppError);
    expect(thrownError?.statusCode).toBe(401);
  });

  it('does not call comparePassword when user is not found', async () => {
    const usersRepository = { validateUser: vi.fn().mockResolvedValue(null) };

    const useCase = new ValidateUserPassword(usersRepository as never);

    try {
      await useCase.execute({
        input: { mail: 'unknown@example.com', password: 'any' },
        requestContext: makeRequestContext(),
      });
    } catch {
      // expected
    }

    expect(comparePasswordMock).not.toHaveBeenCalled();
  });
});
