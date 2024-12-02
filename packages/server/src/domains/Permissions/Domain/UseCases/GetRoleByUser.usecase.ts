import { AppError, IUseCase } from '@server/Application';
import { PermissionsRepository } from '../Permissions.repository';
import { IGetRoleByUser } from '../Permissions.interfaces';

export class GetRoleByUser implements IUseCase<string> {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute({
    input: userId,
    requestContext,
  }: IGetRoleByUser): Promise<string> {
    try {
      const role = await this.permissionsRepository.getRoleByUser({
        userId,
        requestContext,
      });

      if (!role) return '';

      return role;
    } catch (error) {
      throw new AppError(
        `Error al obtener el rol del usuario con ID ${userId}: ${error}`,
        500,
      );
    }
  }
}
