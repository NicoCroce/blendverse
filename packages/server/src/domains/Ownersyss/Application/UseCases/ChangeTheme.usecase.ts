import { AppError, IUseCase } from '@server/Application';
import { OwnersyssRepository } from '../../Domain';
import { IUpdateTheme } from '../ownersyss.types';

export class ChangeTheme implements IUseCase<number> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({ input: id, requestContext }: IUpdateTheme): Promise<number> {
    const idret = await this.ownersyssRepository.updateTheme({
      tema: id,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar el Tema');
    }

    return idret;
  }
}
