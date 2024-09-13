import { IUseCase } from '@server/Application/Interfaces/IUSeCase';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { RequestContext } from '@server/Application';

export class GetAllUsers implements IUseCase<User[]> {
  constructor(private usersRepository: UserRepository) {}

  async execute(requestContext: RequestContext): Promise<User[]> {
    console.log('Use the context', requestContext);
    return await this.usersRepository.getUsers();
  }
}
