import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { IGetUsers } from '../User.interfaces';

export class GetUsers implements IUseCase<User[]> {
  constructor(private usersRepository: UserRepository) {}

  async execute({ input, requestContext }: IGetUsers): Promise<User[]> {
    return this.usersRepository.getUsers({
      filters: input,
      requestContext,
    });
  }
}
