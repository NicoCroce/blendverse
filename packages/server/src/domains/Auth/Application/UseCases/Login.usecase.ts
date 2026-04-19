import { executeUseCase, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { IExecuteResponse, Ilogin } from '../../Domain/auth.interfaces';
import { User, ValidateUserPassword } from '@server/domains/Users';
import { GetRoleByUser } from '@server/domains/Permissions';
import { GetOwnersys } from '@server/domains/Ownersyss';

export class Login implements IUseCase<IExecuteResponse> {
  constructor(
    private readonly _validateUserPassword: ValidateUserPassword,
    private readonly _getOwnersys: GetOwnersys,
    private readonly _getRoleByUser: GetRoleByUser,
  ) {}

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

    if (ownerId === undefined) {
      throw new Error('ownerId no puede ser undefined');
    }

    if (id === undefined) {
      throw new Error('id no puede ser undefined');
    }

    // Obtener el rol del usuario
    const rol = await executeUseCase({
      useCase: this._getRoleByUser,
      input: id,
      requestContext,
    });

    const data = {
      id: id,
      user: name,
      ownerId: ownerId,
    };

    const theme = await executeUseCase({
      requestContext,
      useCase: this._getOwnersys,
      input: user.values.ownerId,
    });

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
        ownerId,
        rol,
      }),
      theme: theme?.values.tema || 1,
    };
  }
}
