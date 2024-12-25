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

  async getRoles(_params: IGetRolesRepository): Promise<Roles[]> {
    const roles = await this.Db.getRolesList();

    return roles.map(({ name, description, permissions }) =>
      Roles.create({ name, description, permissions }),
    );
  }

  getPermissions({
    requestContext: _,
  }: IGetPermissionsRepository): Promise<Permissions[]> {
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
    requestContext: _,
  }: IAssociateUserToRoleRepository): Promise<void> {
    return await this.Db.associateUserToRole(userId, role);
  }

  async getRoleByUser({
    userId,
    requestContext: _,
  }: IGetRoleByUserRepository): Promise<string | null> {
    return this.Db.getRoleByUser(userId);
  }

  async dissociateUserToRole({
    userId,
    requestContext: _,
  }: IDissociateUserToRoleRepository): Promise<void> {
    return this.Db.dissociateUserToRole(userId);
  }
}
