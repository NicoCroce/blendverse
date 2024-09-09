import { User } from './User.entity';

export interface UserRepository {
  save(user: User): Promise<User>;
  findUser(id: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  validateUser(mail: string): Promise<User | null>;
}
