import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { Roles } from '../Roles.entity';
import { IGetRoles } from '../Roles.interfaces';
import { PermissionsRepository } from '../Permissions.repository';

export class GetRoles implements IUseCase<Roles[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetRoles): Promise<Roles[]> {
    return this.permissionsRepository.getRoles({
      requestContext,
    });
  }
}
