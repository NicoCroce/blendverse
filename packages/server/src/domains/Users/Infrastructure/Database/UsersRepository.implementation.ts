import { Op } from 'sequelize';
import {
  IChangePasswordRepository,
  IDeleteUserRepository,
  IGetUserRepository,
  IGetUsersRepository,
  IGetUsersRepositoryResponse,
  IRegisterUserRepository,
  IUpdateUserRepository,
  IValidateUserRepository,
  User,
  UserRepository,
} from '../../Domain';

import { UserModel } from './Users.model';
import { CompaniesModel } from '@server/domains/Companies/Infrastructure';
import { RolesModel } from '@server/domains/Permissions';

export class UsersRepositoryImplementation implements UserRepository {
  async getUsers({
    filters,
  }: IGetUsersRepository): Promise<IGetUsersRepositoryResponse> {
    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await UserModel.findAndCountAll({
      limit,
      offset,
      attributes: ['id', 'email', 'nombre'],
      where: filters?.name
        ? {
            nombre: {
              [Op.substring]: filters?.name,
            },
          }
        : {},
      include: [
        {
          model: RolesModel,
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows.map(({ id, email, nombre, RolesModels }) =>
        User.create({
          id,
          mail: email,
          name: nombre,
          rol: RolesModels[0]?.id.toString() ?? '',
        }),
      ),
      meta: {
        totalItems: count,
        totalPages,
        currentPage: page,
      },
    };
  }

  async registerUser({ user }: IRegisterUserRepository): Promise<User> {
    const newUser = await UserModel.create({
      nombre: user.mail,
      apellido: '',
      clave: user.password!,
      renovar_clave: user.values.renewPassword || false,
      email: user.mail,
    });
    return User.create({
      id: newUser.id,
      mail: newUser.email,
      name: newUser.nombre,
    });
  }

  async getUser({ id }: IGetUserRepository): Promise<User | null> {
    const userFound = await UserModel.findOne({ where: { id } });
    if (!userFound) {
      return null;
    }
    const { email, nombre } = userFound;
    return User.create({ id, mail: email, name: nombre });
  }

  async validateUser({
    mail,
    id,
  }: IValidateUserRepository): Promise<User | null> {
    const user = await UserModel.findOne<UserModel>({
      where: mail ? { email: mail } : { id },
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

  async updateUser({ user }: IUpdateUserRepository): Promise<number | null> {
    const { id, mail, name } = user.values;
    const rowsAffected = await UserModel.update(
      { nombre: name, email: mail },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async deleteUser({ id }: IDeleteUserRepository): Promise<number | null> {
    const rowsAffected = await UserModel.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }

  async changePassword({
    password,
    requestContext,
  }: IChangePasswordRepository): Promise<void | null> {
    const id = requestContext.values.userId;

    const rowsAffected = await UserModel.update(
      { clave: password, renovar_clave: false },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
  }
}
