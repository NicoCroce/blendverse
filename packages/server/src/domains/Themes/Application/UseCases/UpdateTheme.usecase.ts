import { AppError, IUseCase } from '@server/Application';
import { ThemesRepository } from '../../Domain/Themes.repository';
import { IUpdateTheme } from '../../Domain/Themes.interfaces';
import { Theme } from '../../Domain/Themes.entity';

export class UpdateTheme implements IUseCase<Theme> {
  constructor(private readonly themesRepository: ThemesRepository) {}

  async execute({ input, requestContext }: IUpdateTheme): Promise<Theme> {
    const { id, nombre, color_clase, texto_clase, color_primary_hsl } = input;
    const updTheme = Theme.create({
      id,
      nombre,
      color_clase,
      texto_clase,
      color_primary_hsl,
    });
    const idret = await this.themesRepository.update({
      theme: updTheme,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar Registro');
    }
    return updTheme;
  }
}
