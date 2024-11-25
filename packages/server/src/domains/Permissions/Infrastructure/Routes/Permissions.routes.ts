import { permissionsController } from '../../permissions.app';

export const PermissionsRoutes = () => {
  const { getPermissions, getRoles } = permissionsController();

  return {
    permissions: {
      getPermissions,
      getRoles,
    },
  };
};
