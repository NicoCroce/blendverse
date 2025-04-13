import { AppError, executeUseCase, IUseCase } from '@server/Application';
import { ValidateUserPassword } from '@server/domains/Auth';
import { IChangePassword } from '../User.interfaces';
import { UserRepository } from '../User.repository';
import { getCryptedPassword } from '@server/utils/bcrypt';

export class ChangePassword implements IUseCase<void> {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly _validateUserPassword: ValidateUserPassword,
  ) {}

  async execute({
    input: { password, newPassword, rePassword },
    requestContext,
  }: IChangePassword): Promise<void> {
    if (newPassword !== rePassword) {
      throw new AppError('Las contraseñas nuevas no coinciden');
    }
    const user = await executeUseCase({
      useCase: this._validateUserPassword,
      input: { id: requestContext.values.userId, password },
      requestContext,
    });

    if (!user) throw new AppError('No se puede validar el usuario');

    try {
      await this.usersRepository.changePassword({
        password: getCryptedPassword(newPassword),
        requestContext,
      });
    } catch {
      throw new AppError('No se pudo cambiar la constraseña');
    }
  }
}
