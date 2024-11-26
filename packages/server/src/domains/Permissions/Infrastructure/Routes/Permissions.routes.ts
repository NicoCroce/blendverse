import { permissionsController } from '../../permissions.app';

export const PermissionsRoutes = () => {
  const { getPermissions, getRoles, getPermissionByUser } =
    permissionsController();

  return {
    permissions: {
      getPermissions,
      getRoles,
      getPermissionByUser,
    },
  };
};
