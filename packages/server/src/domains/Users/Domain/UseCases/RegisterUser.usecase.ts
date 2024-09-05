import { IUseCase } from '@server/Application/Interfaces/IUSeCase';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';

export interface IExecuteInput {
  mail: string;
  name: string;
  password: string;
}

export class RegisterUser implements IUseCase<User> {
  constructor(private usersRepository: UserRepository) {}

  async execute({ mail, name, password }: IExecuteInput) {
    const newUser = new User('', mail, name, password);
    return await this.usersRepository.save(newUser);
  }
}
