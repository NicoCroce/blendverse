import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RegisterUser } from './RegisterUser.usecase';
import { RequestContext } from '@server/Application';
import { User } from '../../Domain/User.entity';

vi.mock('@server/utils/pino', () => ({
  loggerContextInput: () => ({ info: vi.fn() }),
  loggerContext: () => ({ info: vi.fn(), error: vi.fn() }),
  logger: { info: vi.fn(), error: vi.fn() },
}));

vi.mock('@server/utils/bcrypt', () => ({
  getCryptedPassword: vi.fn((pw: string) => `hashed:${pw}`),
}));

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

vi.mock('@server/domains/Permissions', () => ({
  AssociateUserToRole: class AssociateUserToRole {},
}));
vi.mock('@server/domains/Userprofiles', () => ({
  AssociateUserToProfile: class AssociateUserToProfile {},
}));
vi.mock('@server/Application/Adapters/EmailSender', () => ({
  EmailSender: { sendMail: vi.fn() },
  emailTemplates: { registerUser: vi.fn(() => ({ subject: '', html: '' })) },
}));

import { executeUseCase } from '@server/Application';

const requestContext = new RequestContext(1, 'req-1', 10);

const validInput = {
  mail: 'new@user.com',
  name: 'New User',
  password: 'Pass1234',
  rePassword: 'Pass1234',
  role: null,
  profile: null,
};

const makeCreatedUser = () =>
  User.create({ id: 42, mail: 'new@user.com', name: 'New User', ownerId: 10 });

describe('RegisterUser usecase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws AppError when passwords do not match', async () => {
    const repository = {
      validateUser: vi.fn(),
      registerUser: vi.fn(),
    };

    const useCase = new RegisterUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({
        input: { ...validInput, rePassword: 'different' },
        requestContext,
      }),
    ).rejects.toThrow('Las contraseñas son diferentes');
  });

  it('throws AppError when the user already exists', async () => {
    const existing = User.create({
      id: 1,
      mail: 'new@user.com',
      name: 'Existing User',
    });
    const repository = {
      validateUser: vi.fn().mockResolvedValue(existing),
      registerUser: vi.fn(),
    };

    const useCase = new RegisterUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({ input: validInput, requestContext }),
    ).rejects.toThrow('El usuario ya existe');
  });

  it('registers user and propagates ownerId from requestContext', async () => {
    const createdUser = makeCreatedUser();
    const repository = {
      validateUser: vi.fn().mockResolvedValue(null),
      registerUser: vi.fn().mockResolvedValue(createdUser),
    };
    vi.mocked(executeUseCase).mockResolvedValue(undefined as never);

    const useCase = new RegisterUser(
      repository as never,
      {} as never,
      {} as never,
    );

    const result = await useCase.execute({ input: validInput, requestContext });

    expect(repository.registerUser).toHaveBeenCalledWith(
      expect.objectContaining({ requestContext }),
    );
    const registeredUser = repository.registerUser.mock.calls[0][0]
      .user as User;
    expect(registeredUser.values.ownerId).toBe(10);
    expect(result).toBe(createdUser);
  });

  it('throws AppError when created user has no id', async () => {
    const userWithNoId = User.create({
      mail: 'new@user.com',
      name: 'New User',
    });
    const repository = {
      validateUser: vi.fn().mockResolvedValue(null),
      registerUser: vi.fn().mockResolvedValue(userWithNoId),
    };

    const useCase = new RegisterUser(
      repository as never,
      {} as never,
      {} as never,
    );

    await expect(
      useCase.execute({ input: validInput, requestContext }),
    ).rejects.toThrow('Error al crear el usuario');
  });
});
