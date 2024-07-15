import { AppError, IUseCase } from '@server/Application';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';

export class GetUser implements IUseCase<User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: string): Promise<User> {
    const user = await this.userRepository.findUser(input);
    if (!user) {
      throw new AppError('User not found');
    }
    return user;
  }
}
