import { AppError, IUseCase } from '@server/Application';
import {
  UserprofilesRepository,
  Userprofile,
  IGetUserprofile,
} from '../../Domain';

export class GetUserprofile implements IUseCase<Userprofile | null> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGetUserprofile): Promise<Userprofile | null> {
    const id = input;
    const userprofile = await this.userprofilesRepository.getUserprofile({
      id,
      requestContext,
    });

    if (!userprofile) throw new AppError('Registro no encontrado', 404);
    return userprofile;
  }
}
