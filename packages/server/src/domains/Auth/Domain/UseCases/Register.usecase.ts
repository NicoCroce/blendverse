import { IUseCase } from '@server/Application';
import { AuthRepository } from '../Auth.repository';
import { Auth } from '../Auth.entity';

interface IExecuteInput {
  username: string;
  password: string;
}

export class RegisterUser implements IUseCase<string> {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({ username, password }: IExecuteInput): Promise<string> {
    const newUser = new Auth('', username, password);
    return await this.authRepository.register(newUser);
  }
}
