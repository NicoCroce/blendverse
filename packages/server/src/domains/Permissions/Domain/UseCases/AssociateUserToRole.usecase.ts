import { IUseCase } from '@server/Application';
import { IAssociateUserToRole } from '../Permissions.interfaces';
import { PermissionsRepository } from '../Permissions.repository';

export class AssociateUserToRole implements IUseCase<void> {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute({
    input,
    requestContext,
  }: IAssociateUserToRole): Promise<void> {
    const { role, userId } = input;
    return this.permissionsRepository.associateUserToRole({
      role,
      userId,
      requestContext,
    });
  }
}
