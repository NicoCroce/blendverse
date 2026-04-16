import { IPaginationResponse, IUseCase } from '@server/Application';
import { Profile, ProfilesRepository, IGetAllProfiles } from '../../Domain';

export class GetAllProfiles
  implements IUseCase<IPaginationResponse<Profile[]>>
{
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetAllProfiles): Promise<IPaginationResponse<Profile[]>> {
    return await this.profilesRepository.getAllProfiles({
      filters: input,
      requestContext,
    });
  }
}
