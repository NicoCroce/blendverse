import { executeUseCase, TRequestContext } from '@server/Application';
import {
  AuthRepository,
  IExecuteResponse,
  Login,
  RegisterUser,
} from '../Domain';
import bcrypt from 'bcryptjs';
import { generateToken } from '@server/utils/JWT';

interface IServiceInput {
  username: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly _register: RegisterUser,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(
    input: IServiceInput,
    requestContext: TRequestContext,
  ): Promise<IExecuteResponse> {
    const _login = new Login(this.authRepository, this);
    return executeUseCase(_login, input, requestContext);
  }

  async register(
    { username, password }: IServiceInput,
    requestContext: TRequestContext,
  ): Promise<string> {
    const cryptedPassword = bcrypt.hashSync(password, 10);
    return executeUseCase(
      this._register,
      {
        username,
        password: cryptedPassword,
      },
      requestContext,
    );
  }

  async comparePassword(
    rawPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  async getToken(data: object): Promise<string> {
    return generateToken(data);
  }
}
