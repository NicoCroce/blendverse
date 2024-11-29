import { UserScheme } from '@server/domains/Users';
import {
  IGetPermissionsByUserRepository,
  IGetPermissionsRepository,
  IGetRolesRepository,
  Permissions,
  PermissionsRepository,
  Roles,
} from '../../Domain';
import { RolesModel } from './Roles.model';
import { PermissionsModel } from './Permissions.model';

export class PermissionsRepositoryImplementation
  implements PermissionsRepository
{
  async getRoles(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _params: IGetRolesRepository,
  ): Promise<Roles[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissions({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IGetPermissionsRepository): Promise<Permissions[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserRepository): Promise<string[]> {
    const userId = requestContext.values.userId;

    const user = await UserScheme.findOne({
      where: { id: userId },
      include: [
        {
          model: RolesModel,
          through: { attributes: [] },
          include: [
            {
              model: PermissionsModel,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }

    const roles = user?.RolesModels;

    const permissions = roles?.flatMap((rol) => rol.PermissionsModels) || null;
    console.log(permissions);

    if (!permissions) {
      throw new Error(`Permisos para Usuario con ID ${userId} no encontrado`);
    }

    return permissions.map((p) => p.codigo);
  }
}
