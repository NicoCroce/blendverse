import { AppError, IUseCase } from '@server/Application';
import { ProfilesRepository, IUpdateProfile, Profile } from '../../Domain';

export class UpdateProfile implements IUseCase<Profile> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({ input, requestContext }: IUpdateProfile): Promise<Profile> {
    const { id, denominacion, visualiza_stock, prioridad_precio } = input;
    const { ownerId } = requestContext.values;

    const updProfile = Profile.create({
      id,
      id_propietario: ownerId,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    });
    const idret = await this.profilesRepository.update({
      profile: updProfile,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar Registro');
    }
    return updProfile;
  }
}
