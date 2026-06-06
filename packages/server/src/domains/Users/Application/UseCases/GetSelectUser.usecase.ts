import { ISelect, IUseCase } from '@server/Application';
import { UserRepository } from '../../Domain';
import { IGetSelectUser } from '../users.types';

export class GetSelectUser implements IUseCase<ISelect[]> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ input, requestContext }: IGetSelectUser): Promise<ISelect[]> {
    return await this.usersRepository.getSelectUser({
      filters: input,
      requestContext,
    });
  }
}
