import { ISelect, IUseCase } from '@server/Application';
import { OwnersyssRepository, IGetSelectOwnersys } from '../../Domain';

export class GetSelectOwnersys implements IUseCase<ISelect[]> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetSelectOwnersys): Promise<ISelect[]> {
    return await this.ownersyssRepository.getSelectOwnersys({
      filters: input,
      requestContext,
    });
  }
}
