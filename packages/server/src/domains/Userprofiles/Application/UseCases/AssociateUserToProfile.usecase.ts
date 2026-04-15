import { AppError, IRequestContext, IUseCase } from '@server/Application';
import { UserprofilesRepository, Userprofile } from '../../Domain';

interface IAssociateUserToProfile extends IRequestContext {
  input: {
    userId: number;
    profileId: number | null;
  };
}

export class AssociateUserToProfile implements IUseCase<void> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input: { userId, profileId },
    requestContext,
  }: IAssociateUserToProfile): Promise<void> {
    // Buscar si ya existe una relación entre el usuario y un perfil
    const modifiedContext = requestContext;
    modifiedContext.setUserId(userId);

    const existingProfiles =
      await this.userprofilesRepository.getAllProfilesByUser({
        requestContext: modifiedContext,
      });

    if (!profileId) {
      // Si profileId es null, eliminar la relación existente si hay alguna
      if (existingProfiles && existingProfiles.length > 0) {
        const existingProfile = existingProfiles[0];
        if (existingProfile.values.id) {
          await this.userprofilesRepository.delete({
            id: existingProfile.values.id,
            requestContext,
          });
        }
      }
      return;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      // Si ya tiene un perfil asignado, actualizar el perfil
      const existingProfile = existingProfiles[0];
      if (
        existingProfile.values.id_perfil !== profileId &&
        existingProfile.values.id
      ) {
        const updatedProfile = Userprofile.create({
          id: existingProfile.values.id,
          id_usuario: userId,
          id_perfil: profileId,
        });
        await this.userprofilesRepository.update({
          userprofile: updatedProfile,
          requestContext,
        });
      }
    } else {
      // Si no tiene un perfil asignado, crear una nueva relación
      const newUserprofile = Userprofile.create({
        id_usuario: userId,
        id_perfil: profileId,
      });
      const created = await this.userprofilesRepository.create({
        userprofile: newUserprofile,
        requestContext,
      });

      if (!created) {
        throw new AppError('No se pudo asociar el perfil al usuario');
      }
    }
  }
}
