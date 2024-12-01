import { protectedProcedure } from '@server/Infrastructure';
import { PermissionsService } from '../../Aplication';
import { executeService } from '@server/Application';
import z from 'zod';

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

  getPermissionByUser = protectedProcedure.query(
    executeService(
      this.permissionsService.getPermissionsByUser.bind(
        this.permissionsService,
      ),
    ),
  );

  getRoleByUser = protectedProcedure
    .input(z.number())
    .query(
      executeService(
        this.permissionsService.getRoleByUser.bind(this.permissionsService),
      ),
    );
}
