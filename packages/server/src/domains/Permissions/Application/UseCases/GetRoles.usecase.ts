import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { IGetRoles, PermissionsRepository, Roles } from '../../Domain';

export class GetRoles implements IUseCase<Roles[]> {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute({ requestContext }: IGetRoles): Promise<Roles[]> {
    const userId = requestContext.values.userId;

    // Obtener el rol del usuario actual
    const userRole = await this.permissionsRepository.getRoleByUserId({
      userId,
    });

    if (!userRole) {
      throw new Error(`Usuario con ID ${userId} no tiene rol asignado`);
    }

    // Obtener todos los roles con jerarquía menor o igual
    return this.permissionsRepository.getRolesByMaxHierarchy({
      maxHierarchy: userRole.values.hierarchy,
    });
  }
}
