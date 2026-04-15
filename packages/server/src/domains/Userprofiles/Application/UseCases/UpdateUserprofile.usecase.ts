import { AppError, IUseCase } from '@server/Application';
import {
  IUpdateUserprofile,
  Userprofile,
  UserprofilesRepository,
} from '../../Domain';

export class UpdateUserprofile implements IUseCase<Userprofile> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: IUpdateUserprofile): Promise<Userprofile> {
    const { id, id_usuario, id_perfil } = input;
    const updUserprofile = Userprofile.create({
      id,
      id_usuario,
      id_perfil,
    });
    const idret = await this.userprofilesRepository.update({
      userprofile: updUserprofile,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar Registro');
    }
    return updUserprofile;
  }
}
