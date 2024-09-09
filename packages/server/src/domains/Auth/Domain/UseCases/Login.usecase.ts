import { AppError, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { comparePassword } from '@server/utils/bcrypt';
import { UserRepository } from '../../../Users/Domain/User.repository';

export interface IExecuteInput {
  mail: string;
  password: string;
}

export interface IExecuteResponse {
  token: string;
}

export class Login implements IUseCase<IExecuteResponse> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ mail, password }: IExecuteInput): Promise<IExecuteResponse> {
    const user = await this.usersRepository.validateUser(mail);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const isAuthenticated = comparePassword(password, user?.password || '');

    if (!isAuthenticated) {
      throw new AppError('Wrong password', 401);
    }

    const data = {
      id: user.values.id,
      user: user.values.name,
    };

    const token = generateToken(data);

    return { token };
  }
}
