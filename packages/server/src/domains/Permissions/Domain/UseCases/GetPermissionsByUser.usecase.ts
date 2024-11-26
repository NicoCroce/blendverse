import { IUseCase } from '@server/Application';
import { PermissionsRepository } from '../Permissions.repository';
import { IGetPermissionsByUser } from '../Permissions.interfaces';

export class GetPermissionsByUser implements IUseCase<string[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  execute({ requestContext }: IGetPermissionsByUser): Promise<string[]> {
    return this.permissionsRepository.getPermissionsByUser({ requestContext });
  }
}
