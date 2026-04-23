import { Op } from 'sequelize';
import {
  IGetThemeRepository,
  IGetThemesRepository,
  Theme,
  ThemesRepository,
} from '../../Domain';

import { ThemeModel } from './Theme.model';

export class ThemesRepositoryImplementation implements ThemesRepository {
  async getAllThemes({ filters }: IGetThemesRepository): Promise<Theme[]> {
    const whereClause: { [key: string]: unknown } = {};
    if (filters?.nombre) {
      whereClause.nombre = {
        [Op.substring]: filters.nombre,
      };
    }

    const response = await ThemeModel.findAll({
      attributes: [
        'id',
        'nombre',
        'color_clase',
        'texto_clase',
        'color_primary_hsl',
      ],
      where: whereClause,
    });

    return response.map(
      ({ id, nombre, color_clase, texto_clase, color_primary_hsl }) =>
        Theme.create({
          id,
          nombre,
          color_clase,
          texto_clase,
          color_primary_hsl,
        }),
    );
  }

  async getTheme({ id }: IGetThemeRepository): Promise<Theme | null> {
    const themeFound = await ThemeModel.findOne({ where: { id } });
    if (!themeFound) return null;
    const { nombre, color_clase, texto_clase, color_primary_hsl } = themeFound;
    return Theme.create({
      id,
      nombre,
      color_clase,
      texto_clase,
      color_primary_hsl,
    });
  }
}
