import { container } from '@server/utils/Container';
import { asClass } from 'awilix';
import { PermissionsController } from './Infrastructure/Controllers';

import { PermissionsRepositoryImplementation } from './Infrastructure';
import {
  AssociateUserToRole,
  GetPermissions,
  GetPermissionsByUser,
  GetRoleByUser,
  GetRoles,
  PermissionsService,
} from './Application';

export const permissionsApp = {
  permissionsRepository: asClass(PermissionsRepositoryImplementation),
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
