/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserModel } from '@server/domains/Users';
import {
  IAssociateUserToRoleRepository,
  IDissociateUserToRoleRepository,
  IGetPermissionsByUserRepository,
  IGetPermissionsRepository,
  IGetRoleByUserRepository,
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
  async getRoles(_params: IGetRolesRepository): Promise<Roles[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissions({
    requestContext,
  }: IGetPermissionsRepository): Promise<Permissions[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserRepository): Promise<string[]> {
    const userId = requestContext.values.userId;

    const user = await UserModel.findOne({
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

  associateUserToRole(params: IAssociateUserToRoleRepository): Promise<void> {
    throw new Error('Method not implemented.');
  }
  dissociateUserToRole(params: IDissociateUserToRoleRepository): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getRoleByUser(params: IGetRoleByUserRepository): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
}
