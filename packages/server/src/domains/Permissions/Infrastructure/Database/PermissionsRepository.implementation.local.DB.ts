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
import { LocalDatabasePermissions } from './Local.database';

export class PermissionsRepositoryImplementationLocal
  implements PermissionsRepository
{
  private Db = new LocalDatabasePermissions();

  async getRoles(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _params: IGetRolesRepository,
  ): Promise<Roles[]> {
    const roles = await this.Db.getRolesList();

    return roles.map(({ name, description, permissions }) =>
      Roles.create({ name, description, permissions }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPermissions(params: IGetPermissionsRepository): Promise<Permissions[]> {
    throw new Error('Method not implemented.');
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserRepository): Promise<string[]> {
    return (
      (await this.Db.getPermissionsByUser(requestContext.values.userId)) || ['']
    );
  }

  async associateUserToRole({
    userId,
    role,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IAssociateUserToRoleRepository): Promise<void> {
    return await this.Db.associateUserToRole(userId, role);
  }

  async getRoleByUser({
    userId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IGetRoleByUserRepository): Promise<string | null> {
    return this.Db.getRoleByUser(userId);
  }

  async dissociateUserToRole({
    userId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IDissociateUserToRoleRepository): Promise<void> {
    return this.Db.dissociateUserToRole(userId);
  }
}
