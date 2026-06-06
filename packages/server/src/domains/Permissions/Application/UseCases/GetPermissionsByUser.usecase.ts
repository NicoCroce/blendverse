import { IUseCase } from '@server/Application';
import { PermissionsRepository } from '../../Domain';
import { IGetPermissionsByUser } from '../permissions.types';

export class GetPermissionsByUser implements IUseCase<string[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  execute({ requestContext }: IGetPermissionsByUser): Promise<string[]> {
    return this.permissionsRepository.getPermissionsByUser({ requestContext });
  }
}
