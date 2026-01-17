import { IUseCase } from '@server/Application/Interfaces/IUseCase';
import { User } from '../../Domain/User.entity';
import { UserRepository } from '../../Domain/User.repository';
import { IGetUsers } from '../../Domain/User.interfaces';
import { IPaginationResponse } from '@server/Application';

export class GetUsers implements IUseCase<IPaginationResponse<User[]>> {
  constructor(private usersRepository: UserRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetUsers): Promise<IPaginationResponse<User[]>> {
    return this.usersRepository.getUsers({
      filters: input,
      requestContext,
    });
  }
}
