import { executeUseCase, TRequestContext } from '@server/Application';
import {
  AuthRepository,
  IExecuteResponse,
  Login,
  RegisterUser,
} from '../Domain';

interface IServiceInput {
  username: string;
  password: string;
  rePassword: string;
}

export class AuthService {
  constructor(
    private readonly _register: RegisterUser,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(
    input: Omit<IServiceInput, 'rePassword'>,
    requestContext: TRequestContext,
  ): Promise<IExecuteResponse> {
    const _login = new Login(this.authRepository, this);
    return executeUseCase(_login, input, requestContext);
  }

  async register(
    input: IServiceInput,
    requestContext: TRequestContext,
  ): Promise<string> {
    return executeUseCase(this._register, input, requestContext);
  }
}
