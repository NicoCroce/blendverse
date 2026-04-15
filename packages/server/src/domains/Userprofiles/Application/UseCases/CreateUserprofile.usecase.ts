import { AppError, IUseCase } from '@server/Application';
import {
  UserprofilesRepository,
  ICreateUserprofile,
  Userprofile,
} from '../../Domain';

export class CreateUserprofile implements IUseCase<Userprofile> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: ICreateUserprofile): Promise<Userprofile> {
    const { id, id_usuario, id_perfil } = input;
    const newUserprofile = Userprofile.create({
      id_usuario,
      id_perfil,
      id,
    });
    const userprofile = await this.userprofilesRepository.create({
      userprofile: newUserprofile,
      requestContext,
    });

    if (!userprofile) {
      throw new AppError('No se puede Ingresar Registro');
    }
    return userprofile;
  }
}
