import { IPaginationResponse, IUseCase } from '@server/Application';
import {
  Userprofile,
  UserprofilesRepository,
  IGetAllUserprofiles,
} from '../../Domain';

export class GetAllUserprofiles
  implements IUseCase<IPaginationResponse<Userprofile[]>>
{
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGetAllUserprofiles): Promise<IPaginationResponse<Userprofile[]>> {
    return await this.userprofilesRepository.getAllUserprofiles({
      filters: input,
      requestContext,
    });
  }
}
