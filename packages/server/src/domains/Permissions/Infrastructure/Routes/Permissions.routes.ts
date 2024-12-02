import { permissionsController } from '../../permissions.app';

export const PermissionsRoutes = () => {
  const { getPermissions, getRoles, getPermissionByUser, getRoleByUser } =
    permissionsController();

  return {
    permissions: {
      getPermissions,
      getRoles,
      getPermissionByUser,
      getRoleByUser,
    },
  };
};
