import { AppError, IUseCase } from '@server/Application';
import { ThemesRepository } from '../../Domain/Themes.repository';
import { ICreateTheme } from '../../Domain/Themes.interfaces';
import { Theme } from '../../Domain/Themes.entity';

export class CreateTheme implements IUseCase<Theme> {
  constructor(private readonly themesRepository: ThemesRepository) {}

  async execute({ input, requestContext }: ICreateTheme): Promise<Theme> {
    const { id, nombre, color_clase, texto_clase, color_primary_hsl } = input;
    const newTheme = Theme.create({
      nombre,
      color_clase,
      texto_clase,
      color_primary_hsl,
      id,
    });
    const theme = await this.themesRepository.create({
      theme: newTheme,
      requestContext,
    });

    if (!theme) {
      throw new AppError('No se puede Ingresar Registro');
    }
    return theme;
  }
}
