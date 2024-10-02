import { AppError, IUseCase } from '@server/Application';
import { User } from '../User.entity';
import { UserRepository } from '../User.repository';
import { IUpdateUser } from '../User.interfaces';

export class UpdateUser implements IUseCase<number> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input: { id, mail, name },
    requestContext,
  }: IUpdateUser): Promise<number> {
    const user = User.create({ id, mail, name });
    const response = await this.usersRepository.updateUser({
      user,
      requestContext,
    });

    if (!response) {
      throw new AppError('The user can`t be updated');
    }

    return response;
  }
}
