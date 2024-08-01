import { User, UserRepository } from '../Domain';
import { LocalDatabase } from './Database';

export class UserRepositoryImplementation implements UserRepository {
  private Db = new LocalDatabase();

  async getUsers(): Promise<User[]> {
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
  }
}
