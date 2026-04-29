import { AppError, executeUseCase, IUseCase } from '@server/Application';
import { getCryptedPassword } from '@server/utils/bcrypt';
import { UserRepository } from '../../Domain/User.repository';
import { User } from '../../Domain/User.entity';
import { IRegisterUser } from '../../Domain/User.interfaces';
import { AssociateUserToRole } from '@server/domains/Permissions';
import { AssociateUserToProfile } from '@server/domains/Userprofiles';
import { EmailSender, emailTemplates } from '@server/Application';
import { logger } from '@server/utils/pino';

export class RegisterUser implements IUseCase<User> {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly _associateUserToRole: AssociateUserToRole,
    private readonly _associateUserToProfile: AssociateUserToProfile,
  ) {}

  async execute({
    input: { mail, name, password, rePassword, role, profile },
    requestContext,
  }: IRegisterUser): Promise<User> {
    if (password !== rePassword) {
      throw new AppError('Las contraseñas son diferentes');
    }

    const _user = await this.usersRepository.validateUser({
      mail: mail,
      requestContext,
    });

    if (_user) {
      throw new AppError('El usuario ya existe');
    }

    password = getCryptedPassword(password);

    const ownerId = requestContext.values.ownerId;

    const user = User.create({
      ownerId,
      mail,
      name,
      password,
      renewPassword: true,
    });

    const createdUser = await this.usersRepository.registerUser({
      user,
      requestContext,
    });

    const userId = createdUser.values.id;

    if (!userId) {
      throw new AppError('Error al crear el usuario');
    }

    // Asociar rol si se proporcionó
    if (role) {
      try {
        await executeUseCase({
          requestContext,
          useCase: this._associateUserToRole,
          input: {
            role,
            userId,
          },
        });
      } catch {
        throw new AppError('No se pudo asignar el rol');
      }
    }

    // Asociar perfil si se proporcionó
    if (profile) {
      try {
        await executeUseCase({
          requestContext,
          useCase: this._associateUserToProfile,
          input: {
            profileId: parseInt(profile),
            userId,
          },
        });
      } catch {
        throw new AppError('No se pudo asignar el perfil');
      }
    }

    // Enviar email de notificación al usuario
    try {
      const emailTemplate = emailTemplates.newUserRegistration({
        userName: name,
        userEmail: mail,
      });

      await EmailSender({
        to: [mail],
        subject: emailTemplate.subject,
        body: emailTemplate.body,
      });

      logger.info(`Email de bienvenida enviado a ${mail}`);
    } catch (error) {
      logger.error(error, `Error al enviar email de bienvenida a ${mail}:`);
      // No lanzamos error para que no falle el registro si falla el email
    }

    return createdUser;
  }
}
