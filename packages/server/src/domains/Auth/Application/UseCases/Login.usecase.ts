import { executeUseCase, IUseCase } from '@server/Application';
import { generateToken } from '@server/utils/JWT';
import { IExecuteResponse, Ilogin } from '../../Domain/auth.interfaces';
import { ValidateUserPassword } from './ValidateUserPassword.usecase';
import { User } from '@server/domains/Users';
import { PermissionsRepositoryImplementation } from '@server/domains/Permissions/Infrastructure';
import { GetRoleByUser } from '@server/domains/Permissions/Application/UseCases/GetRoleByUser.usecase';
import { GetOwnersys } from '@server/domains/Ownersyss';

export class Login implements IUseCase<IExecuteResponse> {
  constructor(
    private readonly _validateUserPassword: ValidateUserPassword,
    private readonly _getOwnersys: GetOwnersys,
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

    // Obtener el rol del usuario
    const permissionsRepository = new PermissionsRepositoryImplementation();
    const getRoleByUser = new GetRoleByUser(permissionsRepository);
    if (id === undefined) {
      throw new Error('id no puede ser undefined');
    }
    const rol = await getRoleByUser.execute({ input: id, requestContext });

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
