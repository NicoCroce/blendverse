import { IUseCase } from '@server/Application';
import { UserRepository } from '../../Domain';
import { IGetEmailsByUsersId } from '../users.types';

export class GetEmailsByUsersId implements IUseCase<string[]> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetEmailsByUsersId): Promise<string[]> {
    return await this.usersRepository.getEmailsByUsersId({
      userIds: input,
      requestContext,
    });
  }
}
