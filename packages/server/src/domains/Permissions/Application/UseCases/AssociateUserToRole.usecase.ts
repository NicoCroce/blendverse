import { IUseCase } from '@server/Application';
import { PermissionsRepository } from '../../Domain';
import { IAssociateUserToRole } from '../permissions.types';

export class AssociateUserToRole implements IUseCase<void> {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute({
    input,
    requestContext,
  }: IAssociateUserToRole): Promise<void> {
    const { role, userId } = input;

    if (role) {
      await this.permissionsRepository.associateUserToRole({
        role,
        userId,
        requestContext,
      });
    } else {
      await this.permissionsRepository.dissociateUserToRole({
        userId,
        requestContext,
      });
    }
  }
}
