import { AppError, IUseCase } from '@server/Application';
import { IDeleteTheme } from '../../Domain/Themes.interfaces';
import { ThemesRepository } from '../../Domain/Themes.repository';

export class DeleteTheme implements IUseCase<number | null> {
  constructor(private readonly themesRepository: ThemesRepository) {}

  async execute({
    input,
    requestContext,
  }: IDeleteTheme): Promise<number | null> {
    const id = input;
    const theme = await this.themesRepository.getTheme({ id, requestContext });
    if (theme) {
      await this.themesRepository.delete({ id, requestContext });
      return id;
    } else {
      throw new AppError('No se puede Borrar Registro');
    }
  }
}
