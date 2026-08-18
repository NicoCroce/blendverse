import { asClass } from 'awilix';
import {
  PermissionsController,
  PermissionsRepositoryImplementation,
} from './Infrastructure';
import {
  AssociateUserToRole,
  GetAdmins,
  GetPermissions,
  GetPermissionsByUser,
  GetRoleByUser,
  GetRoles,
  PermissionsService,
} from './Application';
import { container } from '@server/Infrastructure/di/Container';

export const permissionsApp = {
  permissionsRepository: asClass(PermissionsRepositoryImplementation),
  permissionsService: asClass(PermissionsService),
  permissionsController: asClass(PermissionsController),
  _getPermissions: asClass(GetPermissions),
  _getRoles: asClass(GetRoles),
  _getPermissionsByUser: asClass(GetPermissionsByUser),
  _associateUserToRole: asClass(AssociateUserToRole),
  _getRoleByUser: asClass(GetRoleByUser),
  _getAdmins: asClass(GetAdmins),
};

export const permissionsController = () =>
  container.resolve<PermissionsController>('permissionsController');
