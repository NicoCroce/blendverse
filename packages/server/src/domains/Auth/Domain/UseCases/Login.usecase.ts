import { AppError, IUseCase } from '@server/Application';
import { AuthRepository } from '../Auth.repository';
import { AuthService } from '../../Application';
import { generateToken } from '@server/utils/JWT';
import { comparePassword } from '@server/utils/bcrypt';

interface IExecuteInput {
  username: string;
  password: string;
}

export interface IExecuteResponse {
  token: string;
}

export class Login implements IUseCase<IExecuteResponse> {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService,
  ) {}

  async execute({
    username,
    password,
  }: IExecuteInput): Promise<IExecuteResponse> {
    const user = await this.authRepository.validateUser(username);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const isAuthenticated = comparePassword(password, user.values.authPassword);

    if (!isAuthenticated) {
      throw new AppError('Wrong password', 401);
    }

    const data = {
      id: user.values.id,
      user: user.values.authName,
    };

    const token = generateToken(data);

    return { token };
  }
}
