import { Permissions, Roles, Users } from '@server/data';
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

  getPermissionsByUser = async (userId: number) => {
    await delay();
    const _user = Users.find((user) => user.id === userId);
    const rol = Roles.find((p) => p.name === _user?.rol);

    return rol?.permissions;
  };
}
