import { AppError, IUseCase, TRequestContext } from '@server/Application';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';

export class GetUser implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute(input: string, requestContext: TRequestContext): Promise<User> {
    console.log('Use the context', requestContext);
    const user = await this.usersRepository.findUser(input);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
