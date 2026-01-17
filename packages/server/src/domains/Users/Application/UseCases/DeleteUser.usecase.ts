import { AppError, IUseCase } from '@server/Application';
import { UserRepository } from '../../Domain/User.repository';
import { IDeleteUser } from '../../Domain/User.interfaces';

export class DeleteUser implements IUseCase<number> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ input: id, requestContext }: IDeleteUser): Promise<number> {
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
