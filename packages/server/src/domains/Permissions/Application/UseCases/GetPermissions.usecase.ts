import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import {
  IGetPermissions,
  Permissions,
  PermissionsRepository,
} from '../../Domain';

export class GetPermissions implements IUseCase<Permissions[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetPermissions): Promise<Permissions[]> {
    return this.permissionsRepository.getPermissions({
      requestContext,
    });
  }
}
