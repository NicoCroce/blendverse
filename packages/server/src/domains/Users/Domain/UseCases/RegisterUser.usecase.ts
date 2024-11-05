import { AppError, IUseCase } from '@server/Application';
import { getCryptedPassword } from '@server/utils/bcrypt';
import { UserRepository } from '../User.repository';
import { User } from '../User.entity';
import { IRegisterUser } from '../User.interfaces';

export class RegisterUser implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input: { mail, name, password, rePassword },
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

    const user = User.create({ mail, name, password, renewPassword: true });

    return this.usersRepository.registerUser({ user, requestContext });
  }
}
