import { User, UserRepository } from '../Domain';
import { LocalDatabase } from './Database';

export class UserRepositoryImplementation implements UserRepository {
  private Db = new LocalDatabase();

  async getUsers(): Promise<User[]> {
    const users = await this.Db.getUsersList();
    return users.map(
      ({ id, name, mail, password }) => new User(id, mail, name, password),
    );
  }

  async save(user: User): Promise<User> {
    const { id, mail, name, password } = await this.Db.addUser(user.values);
    return new User(id, name, mail, password);
  }

  async findUser(id: string): Promise<User | null> {
    const userFound = await this.Db.getUser(id);
    if (!userFound) {
      return null;
    }
    const { id: userId, mail, name, password } = userFound;
    return new User(userId, mail, name, password);
  }
}
