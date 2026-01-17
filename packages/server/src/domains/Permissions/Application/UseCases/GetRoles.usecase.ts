import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { IGetRoles, PermissionsRepository, Roles } from '../../Domain';

export class GetRoles implements IUseCase<Roles[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetRoles): Promise<Roles[]> {
    return this.permissionsRepository.getRoles({
      requestContext,
    });
  }
}
