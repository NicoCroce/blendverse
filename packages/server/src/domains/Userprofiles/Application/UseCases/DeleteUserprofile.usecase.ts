import { AppError, IUseCase } from '@server/Application';
import { IDeleteUserprofile, UserprofilesRepository } from '../../Domain';

export class DeleteUserprofile implements IUseCase<number | null> {
  constructor(
    private readonly userprofilesRepository: UserprofilesRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: IDeleteUserprofile): Promise<number | null> {
    const id = input;
    const userprofile = await this.userprofilesRepository.getUserprofile({
      id,
      requestContext,
    });
    if (userprofile) {
      await this.userprofilesRepository.delete({
        id,
        requestContext,
      });
      return id;
    } else {
      throw new AppError('No se puede Borrar Registro');
    }
  }
}
