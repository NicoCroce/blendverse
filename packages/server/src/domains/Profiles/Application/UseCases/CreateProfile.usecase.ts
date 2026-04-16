import { AppError, IUseCase } from '@server/Application';
import { ProfilesRepository, ICreateProfile, Profile } from '../../Domain';

export class CreateProfile implements IUseCase<Profile> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({ input, requestContext }: ICreateProfile): Promise<Profile> {
    const { id, denominacion, visualiza_stock, prioridad_precio } = input;
    const { ownerId } = requestContext.values;

    const newProfile = Profile.create({
      id,
      id_propietario: ownerId,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    });

    if (!newProfile) {
      throw new AppError('No se puede Ingresar Registro');
    }
    return newProfile;
  }
}
