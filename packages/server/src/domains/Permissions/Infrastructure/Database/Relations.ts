import { UserModel } from '@server/domains/Users';
import { PermissionsModel } from './Permissions.model';
import { RolesModel } from './Roles.model';

PermissionsModel.belongsToMany(RolesModel, {
  through: 'Roles_permisos',
  foreignKey: 'id_permiso',
  otherKey: 'id_rol',
});

RolesModel.belongsToMany(PermissionsModel, {
  through: 'Roles_permisos',
  foreignKey: 'id_rol',
  otherKey: 'id_permiso',
});

UserModel.belongsToMany(RolesModel, {
  through: 'Usuarios_roles',
  foreignKey: 'id_usuario',
  otherKey: 'id_rol',
});

RolesModel.belongsToMany(UserModel, {
  through: 'Usuarios_roles',
  foreignKey: 'id_rol',
  otherKey: 'id_usuario',
});
