import { Op } from 'sequelize';
import {
  IDeleteUserRepository,
  IGetUserRepository,
  IGetUsersRepository,
  IRegisterUserRepository,
  IUpdateUserRepository,
  IValidateUserRepository,
  User,
  UserRepository,
} from '../../Domain';

import { UserScheme } from './Users.scheme';
import { CompaniesModel } from '@server/domains/Companies/Infrastructure';

export class UsersRepositoryImplementation implements UserRepository {
  async getUsers({ filters }: IGetUsersRepository): Promise<User[]> {
    const users = await UserScheme.findAll({
      attributes: ['id', 'email', 'nombre'],
      where: filters?.name
        ? {
            nombre: {
              [Op.substring]: filters?.name,
            },
          }
        : {},
    });
    return users.map(({ id, email, nombre }) =>
      User.create({ id, mail: email, name: nombre }),
    );
  }

  async registerUser({ user }: IRegisterUserRepository): Promise<User> {
    const newUser = await UserScheme.create({
      nombre: user.mail,
      apellido: '',
      clave: user.password!,
      email: user.mail,
    });
    return User.create({
      id: newUser.id,
      mail: newUser.email,
      name: newUser.nombre,
    });
  }

  async getUser({ id }: IGetUserRepository): Promise<User | null> {
    const userFound = await UserScheme.findOne({ where: { id } });
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
    const user = await UserScheme.findOne<UserScheme>({
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
      userImage: user.imagen,
      companyLogo: user.CompaniesModel.logo,
      companyName: user.CompaniesModel.denominacion,
    });
  }

  async updateUser({ user }: IUpdateUserRepository): Promise<number | null> {
    const { id, mail, name } = user.values;
    const rowsAffected = await UserScheme.update(
      { nombre: name, email: mail },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async deleteUser({ id }: IDeleteUserRepository): Promise<number | null> {
    const rowsAffected = await UserScheme.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }
}
