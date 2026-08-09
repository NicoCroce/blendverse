import { Op } from 'sequelize';
import { UserModel } from '@server/domains/Users';
import {
  IAssociateUserToRoleRepository,
  IDissociateUserToRoleRepository,
  IGetAdminsRepository,
  IGetPermissionsByUserRepository,
  IGetPermissionsRepository,
  IGetRoleByUserRepository,
  IGetRolesRepository,
  IGetRoleByUserIdRepository,
  IGetRolesByMaxHierarchyRepository,
  Permissions,
  PermissionsRepository,
  Roles,
} from '../../Domain';
import { RolesModel } from './Roles.model';
import { PermissionsModel } from './Permissions.model';
import { Users_RolesModel } from './Users_Roles.model';
import { TenantAwareRepository } from '@server/Infrastructure/Database/TenantAwareRepository';
import { AppError } from '@server/Application';

export class PermissionsRepositoryImplementation
  extends TenantAwareRepository
  implements PermissionsRepository
{
  async getRoles(_params: IGetRolesRepository): Promise<Roles[]> {
    const roles = await RolesModel.findAll({
      where: { id: { [Op.not]: 2 } },
    });

    return roles.map((rol) =>
      Roles.create({
        name: rol.denominacion,
        description: '',
        permissions: [],
        hierarchy: rol.jerarquia,
      }),
    );
  }

  async getRoleByUserId({
    userId,
  }: IGetRoleByUserIdRepository): Promise<Roles | null> {
    const userRole = await Users_RolesModel.findOne({
      where: { id_usuario: userId },
    });

    if (!userRole) {
      return null;
    }

    const roleRecord = await RolesModel.findOne({
      where: { id: userRole.id_rol },
    });

    if (!roleRecord) {
      return null;
    }

    return Roles.create({
      name: roleRecord.denominacion,
      description: '',
      permissions: [],
      hierarchy: roleRecord.jerarquia,
    });
  }

  async getRolesByMaxHierarchy({
    maxHierarchy,
  }: IGetRolesByMaxHierarchyRepository): Promise<Roles[]> {
    const roles = await RolesModel.findAll({
      where: {
        jerarquia: {
          [Op.lte]: maxHierarchy,
        },
      },
    });

    return roles.map((rol) =>
      Roles.create({
        name: rol.denominacion,
        description: '',
        permissions: [],
        hierarchy: rol.jerarquia,
      }),
    );
  }

  async getPermissions({
    requestContext: _,
  }: IGetPermissionsRepository): Promise<Permissions[]> {
    throw new AppError('Method not implemented.', 501, 'NOT_IMPLEMENTED');
  }

  async getPermissionsByUser({
    requestContext,
  }: IGetPermissionsByUserRepository): Promise<string[]> {
    const userId = requestContext.values.userId;

    const user = await UserModel.findOne({
      where: { id: userId },
      include: [
        {
          model: RolesModel,
          through: { attributes: [] },
          include: [
            {
              model: PermissionsModel,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new AppError(
        `Usuario con ID ${userId} no encontrado`,
        404,
        'NOT_FOUND',
      );
    }

    const roles = user?.RolesModels;

    const permissions = roles?.flatMap((rol) => rol.PermissionsModels) || null;

    if (!permissions) {
      throw new AppError(
        `Permisos para Usuario con ID ${userId} no encontrado`,
        404,
        'NOT_FOUND',
      );
    }

    return permissions.map((p) => p.codigo);
  }

  async associateUserToRole({
    userId,
    role,
  }: IAssociateUserToRoleRepository): Promise<void> {
    // Buscar si ya existe una relación entre el usuario y un rol
    const existingRelation = await Users_RolesModel.findOne({
      where: { id_usuario: userId },
    });

    const existingRol = await RolesModel.findOne({
      where: { denominacion: role },
    });

    if (!existingRol) throw new AppError('Rol no encontrado', 404, 'NOT_FOUND');

    const newRoleId = existingRol.id;

    if (existingRelation) {
      // Si ya tiene un rol asignado, actualizar el rol
      if (existingRelation.id_rol !== newRoleId) {
        await existingRelation.update({ id_rol: newRoleId });
      }
    } else {
      // Si no tiene un rol asignado, crear una nueva relación
      await Users_RolesModel.create({
        id_usuario: userId,
        id_rol: newRoleId,
      });
    }
  }

  async dissociateUserToRole({
    userId,
  }: IDissociateUserToRoleRepository): Promise<void> {
    await Users_RolesModel.destroy({
      where: { id_usuario: userId },
    });
  }

  async getRoleByUser({
    userId,
  }: IGetRoleByUserRepository): Promise<string | null> {
    const foundRole = await Users_RolesModel.findOne({
      where: { id_usuario: userId },
    });

    if (!foundRole) return null;

    const roleName = await RolesModel.findOne({
      where: { id: foundRole.id_rol },
    });

    return roleName?.denominacion || null;
  }

  async getAdmins({ requestContext }: IGetAdminsRepository): Promise<string[]> {
    const ownerId = requestContext.values.ownerId;
    const users = await UserModel.findAll({
      where: { id_propietario: ownerId },
      include: [
        {
          model: Users_RolesModel,
          as: 'UsersRoles',
          where: { id_rol: 1 },
          attributes: [],
        },
      ],
    });

    if (!users) {
      throw new AppError(`No se encontraron admins`, 404, 'NOT_FOUND');
    }

    return users.map(({ email }) => email);
  }
}
