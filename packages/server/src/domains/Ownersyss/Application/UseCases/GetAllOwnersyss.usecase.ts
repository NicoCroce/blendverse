import { IPaginationResponse, IUseCase } from '@server/Application';
import { Ownersys, OwnersyssRepository, IGetAllOwnersyss } from '../../Domain';

export class GetAllOwnersyss
  implements IUseCase<IPaginationResponse<Ownersys[]>>
{
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetAllOwnersyss): Promise<IPaginationResponse<Ownersys[]>> {
    return await this.ownersyssRepository.getAllOwnersyss({
      filters: input,
      requestContext,
    });
  }
}
