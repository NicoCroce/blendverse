import { AppError, executeUseCase, IUseCase } from '@server/Application';
import {
  UserprofilesRepository,
  Userprofile,
  IAssociateUserToProfile,
} from '../../Domain';
import { GetAllProfilesByUser } from './GetAllProfilesByUser.usecase';

export class AssociateUserToProfile implements IUseCase<void> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
    private readonly _getAllProfilesByUser: GetAllProfilesByUser,
  ) {}

  async execute({
    input: { userId, profileId },
    requestContext,
  }: IAssociateUserToProfile): Promise<void> {
    // Buscar si ya existe una relación entre el usuario y un perfil
    const modifiedContext = requestContext;
    modifiedContext.setUserId(userId);

    const existingProfiles = await executeUseCase({
      useCase: this._getAllProfilesByUser,
      requestContext: modifiedContext,
    });

    if (!profileId) {
      // Si profileId es null, eliminar la relación existente si hay alguna
      if (existingProfiles && existingProfiles.length > 0) {
        const existingProfile = existingProfiles[0];
        if (existingProfile.values.id) {
          await this.userprofilesRepository.deleteUserprofile({
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
        await this.userprofilesRepository.updateUserprofile({
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
      const created = await this.userprofilesRepository.createUserprofile({
        userprofile: newUserprofile,
        requestContext,
      });

      if (!created) {
        throw new AppError('No se pudo asociar el perfil al usuario');
      }
    }
  }
}
