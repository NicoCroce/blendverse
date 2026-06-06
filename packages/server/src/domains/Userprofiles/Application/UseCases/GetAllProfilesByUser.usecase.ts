import { IUseCase } from '@server/Application';
import { UserprofilesRepository, Userprofile } from '../../Domain';
import { IGetAllProfilesByUser } from '../userprofiles.types';

export class GetAllProfilesByUser implements IUseCase<Userprofile[]> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    requestContext,
  }: IGetAllProfilesByUser): Promise<Userprofile[]> {
    const profiles = await this.userprofilesRepository.getAllProfilesByUser({
      requestContext,
    });

    return profiles ?? [];
  }
}
