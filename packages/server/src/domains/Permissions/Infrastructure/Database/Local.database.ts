import { Permissions, Roles } from '@server/data';
import { delay } from '@server/utils/Utils';

export class LocalDatabasePermissions {
  getPermissionsList = async () => {
    await delay();
    return Permissions;
  };

  getRolesList = async () => {
    await delay();
    return Roles;
  };
}
