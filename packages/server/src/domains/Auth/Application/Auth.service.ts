import { executeUseCase } from '@server/Application';
import { IExecuteResponse, Login, RegisterUser } from '../Domain';
import { AuthRepository } from '../Domain/Auth.repository';
import bcrypt from 'bcryptjs';
import { generateToken } from '@server/utils/JWT';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(username: string, password: string): Promise<IExecuteResponse> {
    // Por medio de this, estoy enviando la dependencia del servicio hacia el caso de uso.
    const _login = new Login(this.authRepository, this);
    return await executeUseCase(_login, { username, password });
  }

  async register(username: string, password: string): Promise<string> {
    const cryptedPassword = bcrypt.hashSync(password, 10);
    const _register = new RegisterUser(this.authRepository);
    return await executeUseCase(_register, {
      username,
      password: cryptedPassword,
    });
  }

  async comparePassword(
    rawPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  async getToken(data: object): Promise<string> {
    return generateToken(data);
  }
}
