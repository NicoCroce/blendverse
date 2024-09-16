import {
  IGetUserRepository,
  IGetUsersRepository,
  IRegisterUserRepository,
  IValidateUserRepository,
  User,
  UserRepository,
} from '../Domain';
import { LocalDatabase } from './Database';

export class UsersRepositoryImplementation implements UserRepository {
  private Db = new LocalDatabase();

  async getUsers({ requestContext }: IGetUsersRepository): Promise<User[]> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const users = await this.Db.getUsersList();
    return users.map(({ id, name, mail }) => new User(id, mail, name));
  }

  async registerUser({
    user,
    requestContext,
  }: IRegisterUserRepository): Promise<User> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const { id, mail, name } = await this.Db.addUser({
      ...user.values,
      password: user.password || '',
    });
    return new User(id, mail, name);
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
    const { id: userId, mail, name } = userFound;
    return new User(userId, mail, name);
  }

  async validateUser({
    mail,
    requestContext,
  }: IValidateUserRepository): Promise<User | null> {
    // TODO: use requestContext to execte db
    console.log(requestContext);
    const user = await this.Db.validateUser(mail);
    if (!user) return null;
    const { id, mail: _mail, name, password } = user;
    return new User(id, _mail, name, password);
  }
}
