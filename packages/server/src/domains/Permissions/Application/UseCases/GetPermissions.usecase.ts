import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { Permissions } from '../Permissions.entity';
import { PermissionsRepository } from '../Permissions.repository';
import { IGetPermissions } from '../Permissions.interfaces';

export class GetPermissions implements IUseCase<Permissions[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetPermissions): Promise<Permissions[]> {
    return this.permissionsRepository.getPermissions({
      requestContext,
    });
  }
}
