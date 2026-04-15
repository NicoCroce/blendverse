import { GetRoleByUser } from '@server/domains/Permissions/Application/UseCases/GetRoleByUser.usecase';
import { PermissionsRepository } from '@server/domains/Permissions/Domain/Permissions.repository';
import { RequestContext } from '@server/Application/Entities';

export class UserRoleService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async getRoleByUserId(
    userId: number,
    requestContext: RequestContext,
  ): Promise<string> {
    const getRoleByUser = new GetRoleByUser(this.permissionsRepository);
    return await getRoleByUser.execute({ input: userId, requestContext });
  }
}
