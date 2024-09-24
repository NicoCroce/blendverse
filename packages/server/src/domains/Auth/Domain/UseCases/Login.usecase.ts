import { executeUseCase, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { IExecuteResponse, Ilogin } from '../auth.interfaces';
import { ValidateUserPassword } from './ValidateUserPassword.usecase';

export class Login implements IUseCase<IExecuteResponse> {
  constructor(private readonly _validateUserPassword: ValidateUserPassword) {}

  async execute({ input, requestContext }: Ilogin): Promise<IExecuteResponse> {
    const user = await executeUseCase({
      useCase: this._validateUserPassword,
      input,
      requestContext,
    });

    const data = {
      id: user.values.id,
      user: user.values.name,
    };

    const token = generateToken(data);

    return { token };
  }
}
