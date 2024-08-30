import { Auth } from './Auth.entity';

export interface AuthRepository {
  register(newUser: Auth): Promise<string>;
  login(username: string): Promise<Auth | null>;
  restorePassword(username: string, password: string): Promise<string>;
  validatePassword(username: string, password: string): Promise<string | null>;
}
