import { executeUseCase, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { IExecuteResponse, Ilogin } from '../auth.interfaces';
import { ValidateUserPassword } from './ValidateUserPassword.usecase';
import { User } from '@server/domains/Users';

export class Login implements IUseCase<IExecuteResponse> {
  constructor(private readonly _validateUserPassword: ValidateUserPassword) {}

  async execute({ input, requestContext }: Ilogin): Promise<IExecuteResponse> {
    const user = await executeUseCase({
      useCase: this._validateUserPassword,
      input,
      requestContext,
    });

    const {
      id,
      name,
      mail,
      renewPassword,
      userImage,
      companyLogo,
      companyName,
      ownerId,
    } = user.values;

    const data = {
      id: id,
      user: name,
      ownerId: ownerId,
    };

    const token = generateToken(data);
    const userImageResponse =
      userImage && process.env.URL_IMG
        ? `${process.env.URL_IMG}/${userImage}`
        : '';

    return {
      token,
      user: User.create({
        id,
        name,
        mail,
        renewPassword,
        userImage: userImageResponse,
        companyLogo,
        companyName,
      }),
    };
  }
}
