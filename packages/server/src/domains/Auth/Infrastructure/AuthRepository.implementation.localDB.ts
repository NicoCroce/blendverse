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

    return 'Usuario creado';
  }

  async validateUser(username: string): Promise<Auth | null> {
    const user = await this.Db.getAuth(username);
    if (!user) return null;
    const { id, username: _username, password } = user;
    return new Auth(id, _username, password);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  restorePassword(username: string, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
