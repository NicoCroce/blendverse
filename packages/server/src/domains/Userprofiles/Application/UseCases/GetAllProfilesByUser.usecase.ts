import { AppError, IUseCase } from '@server/Application';
import {
  UserprofilesRepository,
  IGetAllProfilesByUser,
  Userprofile,
} from '../../Domain';

export class GetAllProfilesByUser implements IUseCase<Userprofile[] | null> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    requestContext,
  }: IGetAllProfilesByUser): Promise<Userprofile[] | null> {
    const profiles = await this.userprofilesRepository.getAllProfilesByUser({
      requestContext,
    });

    if (!profiles) {
      throw new AppError('No se obtuvieron los perfiles para el usuario');
    }

    return profiles;
  }
}
