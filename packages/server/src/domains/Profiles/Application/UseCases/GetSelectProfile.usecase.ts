import { ISelect, IUseCase } from '@server/Application';
import { ProfilesRepository, IGetSelectProfile } from '../../Domain';

export class GetSelectProfile implements IUseCase<ISelect[]> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetSelectProfile): Promise<ISelect[]> {
    return await this.profilesRepository.getSelectProfile({
      filters: input,
      requestContext,
    });
  }
}
