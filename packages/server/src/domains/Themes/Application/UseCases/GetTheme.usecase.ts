import { AppError, IUseCase } from '@server/Application';
import { ThemesRepository } from '../../Domain/Themes.repository';
import { Theme } from '../../Domain/Themes.entity';
import { IGetTheme } from '../../Domain/Themes.interfaces';

export class GetTheme implements IUseCase<Theme | null> {
  constructor(private readonly themesRepository: ThemesRepository) {}

  async execute({ input, requestContext }: IGetTheme): Promise<Theme | null> {
    const id = input;
    const theme = await this.themesRepository.getTheme({ id, requestContext });

    if (!theme) throw new AppError('Registro no encontrado', 404);
    return theme;
  }
}
