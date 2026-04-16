import { AppError, IUseCase } from '@server/Application';
import { IDeleteOwnersys, OwnersyssRepository } from '../../Domain';

export class DeleteOwnersys implements IUseCase<number | null> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({
    input,
    requestContext,
  }: IDeleteOwnersys): Promise<number | null> {
    const id = input;
    const ownersys = await this.ownersyssRepository.getOwnersys({
      id,
      requestContext,
    });
    if (ownersys) {
      await this.ownersyssRepository.delete({
        id,
        requestContext,
      });
      return id;
    } else {
      throw new AppError('No se puede Borrar Registro');
    }
  }
}
