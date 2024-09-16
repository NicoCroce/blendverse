import { AppError, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { comparePassword } from '@server/utils/bcrypt';
import { UserRepository } from '../../../Users/Domain/User.repository';
import { IExecuteResponse, Ilogin } from '../auth.interfaces';

export class Login implements IUseCase<IExecuteResponse> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input: { mail, password },
    requestContext,
  }: Ilogin): Promise<IExecuteResponse> {
    const user = await this.usersRepository.validateUser({
      mail,
      requestContext,
    });
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
