import { AppError, IUseCase } from '@server/Application';
import { UserRepository } from '../User.repository';
import { IDeleteUser } from '../User.interfaces';
import { User } from '../User.entity';

export class DeleteUser implements IUseCase<User> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ input: id, requestContext }: IDeleteUser): Promise<User> {
    const response = await this.usersRepository.deleteUser({
      id,
      requestContext,
    });

    if (!response) {
      throw new AppError('User can`t be deleted');
    }

    return response;
  }
}
