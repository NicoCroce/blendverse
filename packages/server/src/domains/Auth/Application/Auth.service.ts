import { executeUseCase, TRequestContext } from '@server/Application';
import { IExecuteResponse, Login } from '../Domain';

interface IServiceInput {
  mail: string;
  password: string;
}

export class AuthService {
  constructor(private readonly _login: Login) {}

  async login(
    input: Omit<IServiceInput, 'rePassword'>,
    requestContext: TRequestContext,
  ): Promise<IExecuteResponse> {
    return executeUseCase(this._login, input, requestContext, {
      mail: input.mail,
    });
  }
}
