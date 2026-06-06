import { permissionsController } from '../..';

export const PermissionsRoutes = () => {
  const { getPermissions, getRoles, getPermissionByUser, getRoleByUser } =
    permissionsController();

  return {
    permissions: {
      getPermissions: getPermissions(),
      getRoles: getRoles(),
      getPermissionByUser: getPermissionByUser(),
      getRoleByUser: getRoleByUser(),
    },
  };
};
