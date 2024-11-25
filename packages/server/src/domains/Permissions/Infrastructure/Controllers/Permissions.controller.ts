import { protectedProcedure } from '@server/Infrastructure';
import { PermissionsService } from '../../Aplication';
import { executeService } from '@server/Application';

export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  getPermissions = protectedProcedure.query(
    executeService(
      this.permissionsService.getPermissions.bind(this.permissionsService),
    ),
  );

  getRoles = protectedProcedure.query(
    executeService(
      this.permissionsService.getRoles.bind(this.permissionsService),
    ),
  );
}
