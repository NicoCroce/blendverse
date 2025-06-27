import { UserModel } from '@server/domains/Users';
import { PermissionsModel } from './Permissions.model';
import { RolesModel } from './Roles.model';

export const relatePermissions = () => {
  PermissionsModel.belongsToMany(RolesModel, {
    through: 'roles_permisos',
    foreignKey: 'id_permiso',
    otherKey: 'id_rol',
  });

  RolesModel.belongsToMany(PermissionsModel, {
    through: 'roles_permisos',
    foreignKey: 'id_rol',
    otherKey: 'id_permiso',
  });

  UserModel.belongsToMany(RolesModel, {
    through: 'usuarios_roles',
    foreignKey: 'id_usuario',
    otherKey: 'id_rol',
  });

  RolesModel.belongsToMany(UserModel, {
    through: 'usuarios_roles',
    foreignKey: 'id_rol',
    otherKey: 'id_usuario',
  });
};
