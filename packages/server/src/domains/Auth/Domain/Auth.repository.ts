import { Auth } from './Auth.entity';

export interface AuthRepository {
  register(newUser: Auth): Promise<string>;
  validateUser(username: string): Promise<Auth | null>;
  restorePassword(username: string, password: string): Promise<string>;
}
