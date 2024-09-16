import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { IGetUsers } from '../User.interfaces';

export class GetUsers implements IUseCase<User[]> {
  constructor(private usersRepository: UserRepository) {}

  async execute({ requestContext }: IGetUsers): Promise<User[]> {
    return await this.usersRepository.getUsers({ requestContext });
  }
}
