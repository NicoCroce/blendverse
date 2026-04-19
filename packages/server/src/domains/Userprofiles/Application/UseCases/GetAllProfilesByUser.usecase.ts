import { IUseCase } from '@server/Application';
import {
  UserprofilesRepository,
  IGetAllProfilesByUser,
  Userprofile,
} from '../../Domain';

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
