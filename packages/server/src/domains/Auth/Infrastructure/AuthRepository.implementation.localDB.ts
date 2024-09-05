import { Auth, AuthRepository } from '../Domain';
import { LocalDatabaseUser } from './Database';

export class AuthRepositoryImplementation implements AuthRepository {
  private Db = new LocalDatabaseUser();

  async register(newUser: Auth): Promise<string> {
    await this.Db.addUserAuth({
      username: newUser.values.authName,
      password: newUser.values.authPassword,
    });

    console.log(await this.Db.getAuthList());

    return 'OK';
  }

  async login(username: string): Promise<Auth | null> {
    const user = await this.Db.getAuth(username);
    if (!user) return null;
    const { id, username: _username, password } = user;
    return new Auth(id, _username, password);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  restorePassword(username: string, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  validatePassword(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    username: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    password: string,
  ): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  /* async getUsers(): Promise<User[]> {
    const users = await this.Db.getUsersList();
    return users.map(({ id, name, mail }) => new User(id, mail, name));
  }

  async save(user: User): Promise<User> {
    const { id, mail, name } = await this.Db.addUser({
      ...user.values,
      password: user.password || '',
    });
    return new User(id, mail, name);
  }

  async findUser(id: string): Promise<User | null> {
    const userFound = await this.Db.getUser(id);
    if (!userFound) {
      return null;
    }
    const { id: userId, mail, name } = userFound;
    return new User(userId, mail, name);
  } */
}
