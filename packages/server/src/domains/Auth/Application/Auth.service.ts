import { executeUseCase } from '@server/Application';
import { Login } from '../Domain';
import {
  IExecuteResponse,
  Ilogin,
  IRestorePassword,
} from '../Domain/auth.interfaces';
import { RestorePassword } from '../Domain/UseCases/RestorePassword.usecase';

export class AuthService {
  constructor(
    private readonly _login: Login,
    private readonly _restorePassword: RestorePassword,
  ) {}

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

  async restorePassword({
    input,
    requestContext,
  }: IRestorePassword): Promise<void> {
    return executeUseCase({
      useCase: this._restorePassword,
      input,
      requestContext,
    });
  }
}
