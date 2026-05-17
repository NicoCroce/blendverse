import { AppError, RequestContext } from '@server/Application';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateToken } from '@server/utils/JWT';
import { Login } from './Login.usecase';

vi.mock('@server/domains/Users', async () => {
  const { User } = await import('@server/domains/Users/Domain/User.entity');
  return { User, ValidateUserPassword: class ValidateUserPassword {} };
});
vi.mock('@server/domains/Permissions', () => ({
  GetRoleByUser: class GetRoleByUser {},
}));
vi.mock('@server/domains/Ownersyss', async () => {
  const { Ownersys } =
    await import('@server/domains/Ownersyss/Domain/Ownersyss.entity');
  return { Ownersys, GetOwnersys: class GetOwnersys {} };
});

import { Ownersys } from '@server/domains/Ownersyss';
import { User } from '@server/domains/Users';

vi.mock('@server/utils/JWT', () => ({
  generateToken: vi.fn(() => 'signed-token'),
}));

const requestContext = new RequestContext(1, 'req-1', 99);

const createUser = (
  overrides: Partial<Parameters<typeof User.create>[0]> = {},
) =>
  User.create({
    id: 7,
    mail: 'john@example.com',
    name: 'John',
    password: '12345678',
    renewPassword: false,
    userImage: 'avatar.png',
    ownerId: 99,
    companyLogo: 'logo.png',
    companyName: 'Acme',
    ...overrides,
  });

const createOwnersys = (tema?: number) =>
  Ownersys.create({
    denominacion: 'Acme',
    logo: 'logo.png',
    razon_social: 'Acme SRL',
    cuit: 12345678901,
    domicilio_fiscal: 'Calle 123',
    telefonos_principales: '123456',
    email_corporativo: 'contacto@acme.com',
    horarios_atencion: '9-18',
    whatsapp: '111111',
    sucursal_pedido: 1,
    sucursal_presupuestos: 1,
    id: 99,
    tema,
  });

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.URL_IMG = 'https://cdn.example.com';
  });

  it('returns the authenticated user, role, theme and token payload with ownerId', async () => {
    const validateUserPassword = {
      execute: vi.fn().mockResolvedValue(createUser()),
    };
    const getRoleByUser = {
      execute: vi.fn().mockResolvedValue('Full Admin'),
    };
    const getOwnersys = {
      execute: vi.fn().mockResolvedValue(createOwnersys(4)),
    };

    const useCase = new Login(
      validateUserPassword as never,
      getOwnersys as never,
      getRoleByUser as never,
    );

    const response = await useCase.execute({
      input: {
        mail: 'john@example.com',
        password: '12345678',
      },
      requestContext,
    });

    expect(generateToken).toHaveBeenCalledWith({
      id: 7,
      user: 'John',
      ownerId: 99,
    });
    expect(response.token).toBe('signed-token');
    expect(response.user.values.ownerId).toBe(99);
    expect(response.user.values.rol).toBe('Full Admin');
    expect(response.user.values.userImage).toBe(
      'https://cdn.example.com/avatar.png',
    );
    expect(response.theme).toBe(4);
  });

  it('falls back to theme 1 when the owner theme is missing', async () => {
    const useCase = new Login(
      { execute: vi.fn().mockResolvedValue(createUser()) } as never,
      { execute: vi.fn().mockResolvedValue(createOwnersys()) } as never,
      { execute: vi.fn().mockResolvedValue('') } as never,
    );

    const response = await useCase.execute({
      input: {
        mail: 'john@example.com',
        password: '12345678',
      },
      requestContext,
    });

    expect(response.theme).toBe(1);
  });

  it('propagates the user not found error from password validation', async () => {
    const useCase = new Login(
      {
        execute: vi
          .fn()
          .mockRejectedValue(new AppError('Usuario no encontrado', 404)),
      } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        input: {
          mail: 'john@example.com',
          password: '12345678',
        },
        requestContext,
      }),
    ).rejects.toMatchObject({ message: 'Usuario no encontrado' });
  });

  it('propagates the incorrect password error from password validation', async () => {
    const useCase = new Login(
      {
        execute: vi
          .fn()
          .mockRejectedValue(new AppError('Contraseña incorrecta', 401)),
      } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        input: {
          mail: 'john@example.com',
          password: '12345678',
        },
        requestContext,
      }),
    ).rejects.toMatchObject({ message: 'Contraseña incorrecta' });
  });

  it('keeps the current raw error when ownerId is missing', async () => {
    const useCase = new Login(
      {
        execute: vi.fn().mockResolvedValue(createUser({ ownerId: undefined })),
      } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        input: {
          mail: 'john@example.com',
          password: '12345678',
        },
        requestContext,
      }),
    ).rejects.toThrow('ownerId no puede ser undefined');
  });

  it('keeps the current raw error when id is missing', async () => {
    const useCase = new Login(
      {
        execute: vi.fn().mockResolvedValue(createUser({ id: undefined })),
      } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
    );

    await expect(
      useCase.execute({
        input: {
          mail: 'john@example.com',
          password: '12345678',
        },
        requestContext,
      }),
    ).rejects.toThrow('id no puede ser undefined');
  });
});
