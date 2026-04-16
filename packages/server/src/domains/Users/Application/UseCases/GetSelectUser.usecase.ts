import { ISelect, IUseCase } from '@server/Application';
import { IGetSelectUser, UserRepository } from '../../Domain';

export class GetSelectUser implements IUseCase<ISelect[]> {
  constructor(private readonly usersRepository: UserRepository) {}

  async execute({ input, requestContext }: IGetSelectUser): Promise<ISelect[]> {
    return await this.usersRepository.getSelectUser({
      filters: input,
      requestContext,
    });
  }
}
