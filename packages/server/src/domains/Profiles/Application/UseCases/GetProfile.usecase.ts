import { AppError, IUseCase } from '@server/Application';
import { ProfilesRepository, Profile, IGetProfile } from '../../Domain';

export class GetProfile implements IUseCase<Profile | null> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetProfile): Promise<Profile | null> {
    const id = input;
    const profile = await this.profilesRepository.getProfile({
      id,
      requestContext,
    });

    if (!profile) throw new AppError('Registro no encontrado', 404);
    return profile;
  }
}
