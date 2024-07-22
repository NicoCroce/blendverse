import { executeUseCase } from '@server/Application/Adapters/ExecuteUseCase';
import {
  GetAllUsers,
  GetUser,
  IExecuteInput,
  RegisterUser,
  User,
  UserRepository,
} from '../Domain';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    const getUsers = new GetAllUsers(this.userRepository);
    return await executeUseCase<User[]>(getUsers);
  }

  async registerUser(
    mail: string,
    name: string,
    password: string,
  ): Promise<User> {
    const registerUser = new RegisterUser(this.userRepository);
    return await executeUseCase<User, IExecuteInput>(registerUser, {
      mail,
      name,
      password,
    });
  }

  async getUser(id: string): Promise<User> {
    const getUser = new GetUser(this.userRepository);
    return await executeUseCase<User, string>(getUser, id);
  }
}
