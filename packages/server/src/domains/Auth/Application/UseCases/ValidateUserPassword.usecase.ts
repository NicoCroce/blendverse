import { AppError, IUseCase } from '@server/Application';
import { User, UserRepository } from '@server/domains/Users';
import { IValidateUserPassword } from '../../Domain/auth.interfaces';
import { comparePassword } from '@server/utils/bcrypt';

export class ValidateUserPassword implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input: { password, id, mail },
    requestContext,
  }: IValidateUserPassword): Promise<User> {
    const user = await this.usersRepository.validateUser({
      id,
      mail,
      requestContext,
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isAuthenticated = await comparePassword(
      password,
      user?.password || '',
    );

    if (!isAuthenticated) {
      throw new AppError('Contraseña incorrecta', 401);
    }

    return user;
  }
}
