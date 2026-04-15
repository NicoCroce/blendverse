import { IUseCase } from '@server/Application';
import { UserRepository, IGetEmailsByUsersId } from '../../Domain';

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
