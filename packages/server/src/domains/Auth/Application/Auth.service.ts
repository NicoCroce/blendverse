import { executeUseCase } from '@server/Application';
import { Login } from '../Domain';
import { IExecuteResponse, Ilogin } from '../Domain/auth.interfaces';

export class AuthService {
  constructor(private readonly _login: Login) {}

  async login({ input, requestContext }: Ilogin): Promise<IExecuteResponse> {
    return executeUseCase({
      useCase: this._login,
      input,
      requestContext,
      inputLog: {
        mail: input.mail,
      },
    });
  }
}
