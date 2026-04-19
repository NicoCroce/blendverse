import { executeUseCase, AppError } from '@server/Application';
import { Login } from './UseCases/Login.usecase';
import {
  IExecuteResponse,
  Ilogin,
  IRenewPasswordAuth,
  IRestorePassword,
} from '../Domain/auth.interfaces';
import { RestorePassword } from './UseCases';
import { RenewPasswordAuth } from './UseCases/RenewPasswordAuth.usecase';
import { verifyToken } from '@server/utils';

export class AuthService {
  constructor(
    private readonly _login: Login,
    private readonly _restorePassword: RestorePassword,
    private readonly _renewPasswordAuth: RenewPasswordAuth,
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

  async renewPasswordAuth({
    input,
    requestContext,
  }: IRenewPasswordAuth): Promise<void> {
    const { token, newPassword, rePassword } = input;

    if (!token) {
      throw new AppError('Token not provided', 401, 'UNAUTHORIZED');
    }

    let dataToken;

    try {
      dataToken = (await verifyToken(token)) as { email: string };
    } catch {
      throw new AppError('Token error', 401, 'UNAUTHORIZED');
    }

    return executeUseCase({
      useCase: this._renewPasswordAuth,
      input: { mail: dataToken.email, newPassword, rePassword },
      requestContext,
    });
  }
}
