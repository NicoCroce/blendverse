import { IUseCase } from '@server/Application';
import { IGetPermissionsByUser, PermissionsRepository } from '../../Domain';

export class GetPermissionsByUser implements IUseCase<string[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  execute({ requestContext }: IGetPermissionsByUser): Promise<string[]> {
    return this.permissionsRepository.getPermissionsByUser({ requestContext });
  }
}
