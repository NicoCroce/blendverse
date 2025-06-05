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
import { LocalDatabase } from '.';

export class UsersRepositoryImplementationLocal implements UserRepository {
  private Db = new LocalDatabase();

  async getUsers({
    filters,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestContext,
  }: IGetUsersRepository): Promise<IGetUsersRepositoryResponse> {
    // TODO: use requestContext to execte db
    const users = await this.Db.getUsersList(filters);

    const data = users.map(({ id, name, mail, renewPassword }) =>
      User.create({ id, mail, name, renewPassword: !!renewPassword }),
    );

    return {
      data,
      meta: {
        totalItems: data.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  }

  async registerUser({
    user,
    requestContext,
  }: IRegisterUserRepository): Promise<User> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const { id, mail, name, renewPassword } = await this.Db.addUser({
      ...user.values,
      password: user.password || '',
    });
    return User.create({ id, mail, name, renewPassword: !!renewPassword });
  }

  async getUser({
    id,
    requestContext,
  }: IGetUserRepository): Promise<User | null> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const userFound = await this.Db.getUser(id);
    if (!userFound) {
      return null;
    }
    const { mail, name, renewPassword } = userFound;
    return User.create({ id, mail, name, renewPassword: !!renewPassword });
  }

  async validateUser({
    mail,
    requestContext,
    id,
  }: IValidateUserRepository): Promise<User | null> {
    // TODO: use requestContext to execte db
    console.log(requestContext);

    const user = id
      ? await this.Db.validateUserById(id)
      : mail
        ? await this.Db.validateUserByMail(mail)
        : null;

    if (!user) return null;

    const {
      id: userID,
      mail: _mail,
      name,
      password,
      renewPassword,
      ownerId,
      companyLogo,
      companyName,
      userImage,
    } = user;

    return User.create({
      id: userID,
      mail: _mail,
      name,
      password,
      renewPassword: !!renewPassword,
      ownerId,
      companyLogo,
      companyName,
      userImage,
    });
  }

  async updateUser({
    user,
    requestContext,
  }: IUpdateUserRepository): Promise<number | null> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const { mail, name } = user.values;
    const userUpdated = await this.Db.updateUser({
      id: user.id!,
      mail,
      name,
    });

    if (!userUpdated) return null;
    return user.id!;
  }

  async deleteUser({
    id,
    requestContext,
  }: IDeleteUserRepository): Promise<number | null> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const userDeleted = await this.Db.deleteUser(id);
    if (!userDeleted) return null;
    return id;
  }

  async changePassword({
    password,
    requestContext,
  }: IChangePasswordRepository): Promise<void | null> {
    console.log(requestContext);
    const { userId } = requestContext.values;
    const userUpdated = await this.Db.changePassword(userId, password);

    if (!userUpdated) return null;
  }
}
