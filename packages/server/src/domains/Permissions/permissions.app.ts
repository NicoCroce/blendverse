import { container } from '@server/utils/Container';
import { asClass } from 'awilix';
import { PermissionsController } from './Infrastructure/Controllers';
import {
  AssociateUserToRole,
  GetPermissions,
  GetPermissionsByUser,
  GetRoleByUser,
  GetRoles,
} from './Domain';
import { PermissionsService } from './Aplication';
import { PermissionsRepositoryImplementationLocal } from './Infrastructure/Database';

export const permissionsApp = {
  permissionsRepository: asClass(PermissionsRepositoryImplementationLocal),
  permissionsService: asClass(PermissionsService),
  permissionsController: asClass(PermissionsController),
  _getPermissions: asClass(GetPermissions),
  _getRoles: asClass(GetRoles),
  _getPermissionsByUser: asClass(GetPermissionsByUser),
  _associateUserToRole: asClass(AssociateUserToRole),
  _getRoleByUser: asClass(GetRoleByUser),
};

export const permissionsController = () =>
  container.resolve<PermissionsController>('permissionsController');
