import { AppError, IUseCase } from '@server/Application';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { IGetUser } from '../User.interfaces';

export class GetUser implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ id, requestContext }: IGetUser): Promise<User> {
    const user = await this.usersRepository.getUser({ id, requestContext });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
