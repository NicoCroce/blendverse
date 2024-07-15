import { User, UserRepository } from '../Domain';
import { LocalDatabase } from './Database';

export class UserRepositoryImplementation implements UserRepository {
  private Db = new LocalDatabase();

  async getUsers(): Promise<User[]> {
    const users = await this.Db.getUsersList();
    return users.map((u) => new User(u.id, u.mail, u.name, u.password));
  }

  async save(user: User): Promise<User> {
    const newUser = await this.Db.addUser(user.values);
    return new User(newUser.id, newUser.mail, newUser.name, newUser.password);
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
