import { AppError, IUseCase } from '@server/Application';
import { AuthRepository } from '../Auth.repository';
import { Auth } from '../Auth.entity';
import { getCryptedPassword } from '@server/utils/bcrypt';

interface IExecuteInput {
  username: string;
  password: string;
  rePassword: string;
}

export class RegisterUser implements IUseCase<string> {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({
    username,
    password,
    rePassword,
  }: IExecuteInput): Promise<string> {
    if (password !== rePassword) {
      throw new AppError('Las contraseñas son diferentes');
    }

    const user = await this.authRepository.validateUser(username);

    if (user) {
      throw new AppError('El usuario ya existe');
    }

    const newUser = new Auth('', username, getCryptedPassword(password));
    return await this.authRepository.register(newUser);
  }
}
