import { AppError, IUseCase } from '@server/Application';
import { IDeleteProfile, ProfilesRepository } from '../../Domain';

export class DeleteProfile implements IUseCase<number | null> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute({
    input,
    requestContext,
  }: IDeleteProfile): Promise<number | null> {
    const id = input;
    const profile = await this.profilesRepository.getProfile({
      id,
      requestContext,
    });
    if (profile) {
      await this.profilesRepository.delete({
        id,
        requestContext,
      });
      return id;
    } else {
      throw new AppError('No se puede Borrar Registro');
    }
  }
}
