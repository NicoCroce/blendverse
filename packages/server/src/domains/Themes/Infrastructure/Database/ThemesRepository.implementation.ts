import { Op } from 'sequelize';
import {
  IDeleteThemeRepository,
  IGetThemeRepository,
  IGetThemesRepository,
  ICreateThemeRepository,
  IUpdateThemeRepository,
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

  async create({ theme }: ICreateThemeRepository): Promise<Theme | null> {
    if (!theme) return null;
    const { id, nombre, color_clase, texto_clase, color_primary_hsl } =
      theme.values;
    const newTheme = await ThemeModel.create({
      id,
      nombre,
      color_clase,
      texto_clase,
      color_primary_hsl,
    });
    if (!newTheme) return null;
    return Theme.create({
      id,
      nombre,
      color_clase,
      texto_clase,
      color_primary_hsl,
    });
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

  async update({ theme }: IUpdateThemeRepository): Promise<number | null> {
    const { id, nombre, color_clase, texto_clase, color_primary_hsl } =
      theme.values;
    const rowsAffected = await ThemeModel.update(
      { nombre, color_clase, texto_clase, color_primary_hsl },
      { where: { id } },
    );
    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async delete({ id }: IDeleteThemeRepository): Promise<number | null> {
    const rowsAffected = await ThemeModel.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }
}
