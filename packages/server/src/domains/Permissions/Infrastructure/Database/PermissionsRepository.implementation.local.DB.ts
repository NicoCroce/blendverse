import {
  IGetPermissionsRepository,
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
}
