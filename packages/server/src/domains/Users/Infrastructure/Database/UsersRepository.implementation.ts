import { Op } from 'sequelize';
import {
  IRenewPasswordRepository,
  IChangePasswordRepository,
  IDeleteUserRepository,
  IGetEmailsByUsersIdRepository,
  IGetSelectUserRepository,
  IGetUserRepository,
  IGetUsersRepository,
  IGetUsersRepositoryResponse,
  IRegisterUserRepository,
  IUpdateUserRepository,
  IValidateUserRepository,
  User,
  UserRepository,
  UserSelect,
} from '../../Domain';

import { UserModel } from './Users.model';
import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { RolesModel } from '@server/domains/Permissions';
import { ISelect, TransformToSelect } from '@server/Application';
import { PaginationImplementation } from '@server/utils/pagination';

export class UsersRepositoryImplementation implements UserRepository {
  async getUsers({
    filters,
    requestContext,
  }: IGetUsersRepository): Promise<IGetUsersRepositoryResponse> {
    // Usar la utilidad de paginación.
    const { limit, offset, createPaginatedResponse } =
      PaginationImplementation(filters);
    const ownerId = requestContext?.values.ownerId;

    const whereClause: { [key: string]: unknown } = {};

    if (filters?.name) {
      whereClause.nombre = {
        [Op.substring]: filters.name,
      };
    }

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }

    const { count, rows } = await UserModel.findAndCountAll({
      limit,
      offset,
      attributes: ['id', 'email', 'nombre'],
      where: whereClause,
      include: [
        {
          model: RolesModel,
        },
      ],
    });

    // Mapear los datos
    const mappedUsers = rows.map(({ id, email, nombre, RolesModels }) =>
      User.create({
        id,
        mail: email,
        name: nombre,
        rol: RolesModels[0]?.id.toString() ?? '',
      }),
    );

    // Crear respuesta paginada usando la utilidad
    return createPaginatedResponse(mappedUsers, count);
  }

  async registerUser({ user }: IRegisterUserRepository): Promise<User> {
    const newUser = await UserModel.create({
      nombre: user.values.name,
      apellido: '',
      clave: user.password!,
      renovar_clave: user.values.renewPassword || false,
      email: user.mail,
      id_propietario: user.values.ownerId,
    });
    return User.create({
      id: newUser.id,
      mail: newUser.email,
      name: newUser.nombre,
      ownerId: newUser.id_propietario,
    });
  }

  async getUser({
    id,
    requestContext,
  }: IGetUserRepository): Promise<User | null> {
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext?.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const userFound = await UserModel.findOne({ where: whereClause });
    if (!userFound) {
      return null;
    }
    const { email, nombre } = userFound;
    return User.create({
      id,
      mail: email,
      name: nombre,
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
      companyLogo: user.CompaniesModel.logo,
      companyName: user.CompaniesModel.denominacion,
    });
  }

  async updateUser({
    user,
    requestContext,
  }: IUpdateUserRepository): Promise<number | null> {
    const { id, mail, name } = user.values;
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext?.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const rowsAffected = await UserModel.update(
      { nombre: name, email: mail },
      { where: whereClause },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async deleteUser({
    id,
    requestContext,
  }: IDeleteUserRepository): Promise<number | null> {
    const whereClause: { [key: string]: unknown } = { id };

    if (requestContext?.values.ownerId) {
      whereClause.id_propietario = requestContext.values.ownerId;
    }

    const rowsAffected = await UserModel.destroy({ where: whereClause });
    if (rowsAffected === 0) return null;
    return id;
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
  async getSelectUser({
    requestContext,
  }: IGetSelectUserRepository): Promise<ISelect[]> {
    const whereClause: { [key: string]: unknown } = {};
    const {
      values: { ownerId },
    } = requestContext;

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }
    const data = await UserModel.findAll({
      attributes: ['id', 'nombre'],
      where: whereClause,
    });

    const ret = data.map(({ id, nombre }) => new UserSelect(nombre, id));
    return TransformToSelect(ret, 'nombre');
  }

  async getEmailsByUsersId({
    userIds,
    requestContext,
  }: IGetEmailsByUsersIdRepository): Promise<string[]> {
    const {
      values: { ownerId },
    } = requestContext;

    const whereClause: { [key: string]: unknown } = {
      id: userIds,
    };

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }

    const users = await UserModel.findAll({
      attributes: ['email'],
      where: whereClause,
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
}
