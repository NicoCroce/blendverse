import { AppError, IUseCase } from '@server/Application';
import { getCryptedPassword } from '@server/utils/bcrypt';
import { UserRepository } from '../User.repository';
import { User } from '../User.entity';

interface IExecuteInput {
  mail: string;
  name: string;
  password: string;
  rePassword: string;
}

export class RegisterUser implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    mail,
    name,
    password,
    rePassword,
  }: IExecuteInput): Promise<User> {
    if (password !== rePassword) {
      throw new AppError('Las contraseñas son diferentes');
    }

    const user = await this.usersRepository.validateUser(mail);

    if (user) {
      throw new AppError('El usuario ya existe');
    }

    const newUser = new User('', mail, name, getCryptedPassword(password));
    return await this.usersRepository.save(newUser);
  }
}
