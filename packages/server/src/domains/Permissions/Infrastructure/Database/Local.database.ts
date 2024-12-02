import { Permissions, Roles, Roles_Users } from '@server/data';
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
    const _rol = Roles_Users.find((rol) => rol.userId === userId);
    const rol = Roles.find((p) => p.name === _rol?.roleName);

    return rol?.permissions;
  };

  associateUserToRole = async (userId: number, role: string) => {
    await delay();
    const indexRole = Roles_Users.findIndex(
      (userRole) => userRole.userId === userId,
    );

    if (indexRole === -1) {
      Roles_Users.push({
        userId,
        roleName: role,
      });
    } else {
      Roles_Users[indexRole].roleName = role;
    }

    console.log(Roles_Users);
  };

  dissociateUserToRole = async (userId: number) => {
    await delay();
    const indexRole = Roles_Users.findIndex(
      (userRole) => userRole.userId === userId,
    );

    if (indexRole !== -1) {
      Roles_Users.splice(indexRole, 1);
    }
  };

  getRoleByUser = async (userId: number) => {
    await delay();
    const rol = Roles_Users.find((rol) => rol.userId === userId);

    if (!rol) return null;

    return rol.roleName;
  };
}
