import {
  ICompanyOwner,
  ICountActiveEmployeesRepository,
  IRenewPasswordRepository,
  IChangePasswordRepository,
  IGetAllActiveOwnersRepository,
  IGetEmailsByUsersIdRepository,
  IValidateUserRepository,
  User,
  UserRepository,
  IGetUserRepository,
} from '../../Domain';

import { UserModel } from './Users.model';
import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { TenantAwareRepository } from '@server/Infrastructure/Database/TenantAwareRepository';

export class UsersRepositoryImplementation
  extends TenantAwareRepository
  implements UserRepository
{
  async getUser({
    id,
    requestContext,
  }: IGetUserRepository): Promise<User | null> {
    const whereClause: { [key: string]: unknown } = { id };

    const isCurrentUser = requestContext?.values.userId === id;
    if (requestContext?.values.ownerId && !isCurrentUser) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const userFound = await UserModel.findOne({ where: whereClause });
    if (!userFound) {
      return null;
    }
    const { email, nombre, apellido } = userFound;
    return User.create({
      id,
      mail: email,
      name: nombre,
      surname: apellido,
      ownerId: userFound.id_propietario,
    });
  }

  async validateUser({
    mail,
    id,
  }: IValidateUserRepository): Promise<User | null> {
    const whereClause: { [key: string]: unknown } = mail
      ? { email: mail }
      : { id };

    const user = await UserModel.findOne<UserModel>({
      where: whereClause,
      include: [
        {
          model: CompaniesModel,
          attributes: ['denominacion', 'logo'],
        },
      ],
    });

    if (!user) return null;

    return User.create({
      id: user.id,
      mail: user.email,
      name: user.nombre,
      password: user.clave,
      renewPassword: user.renovar_clave,
      userImage: user.imagen,
      ownerId: user.id_propietario,
      companyLogo: user?.CompaniesModel?.logo || '',
      companyName: user?.CompaniesModel?.denominacion,
    });
  }

  async changePassword({
    password,
    requestContext,
  }: IChangePasswordRepository): Promise<void | null> {
    const id = requestContext.values.userId;
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const rowsAffected = await UserModel.update(
      { clave: password, renovar_clave: false },
      { where: whereClause },
    );

    if (!id || !rowsAffected[0]) return null;
  }

  async getEmailsByUsersId({
    userIds,
    requestContext,
  }: IGetEmailsByUsersIdRepository): Promise<string[]> {
    const {
      values: { ownerId },
    } = requestContext;

    const users = ownerId
      ? await UserModel.findAll({
          attributes: ['email'],
          where: { id: userIds, id_propietario: ownerId },
        })
      : await UserModel.findAll({
          attributes: ['email'],
          where: { id: userIds },
        });

    return users
      .map((user) => user.email)
      .filter((email) => email && email.trim() !== '');
  }

  async renewPassword(params: IRenewPasswordRepository): Promise<void | null> {
    const { mail, password } = params;

    const rowsAffected = await UserModel.update(
      { clave: password },
      { where: { email: mail } },
    );

    if (!mail || !rowsAffected[0]) return null;
  }

  // ── Reporte diario (daily-admin-report) ──────────────────────────────────

  async getAllActiveOwners(
    _params: IGetAllActiveOwnersRepository,
  ): Promise<ICompanyOwner[]> {
    // Nota: `sis_propietarios` no tiene columna `active` (verificado en la
    // base de datos). La consigna original asumía `WHERE active = true`;
    // se devuelven todos los owners registrados.
    const owners = await CompaniesModel.findAll({
      attributes: ['id', 'denominacion'],
      order: [['denominacion', 'ASC']],
    });

    return owners.map((owner) => ({
      id: owner.id,
      denominacion: owner.denominacion,
    }));
  }

  async countActiveEmployees({
    requestContext,
  }: ICountActiveEmployeesRepository): Promise<number> {
    const ownerId = requestContext.values.ownerId;
    return UserModel.count({
      where: { id_propietario: ownerId },
    });
  }
}
