import { asClass } from 'awilix';
import {
  ThemesService,
  GetAllThemes,
  GetTheme,
  CreateTheme,
  DeleteTheme,
  UpdateTheme,
} from './Application';
import {
  ThemesController,
  ThemesRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/utils/Container';

export const themeApp = {
  themesRepository: asClass(ThemesRepositoryImplementation),
  themesService: asClass(ThemesService),
  themesController: asClass(ThemesController),
  _getAllThemes: asClass(GetAllThemes),
  _getTheme: asClass(GetTheme),
  _createTheme: asClass(CreateTheme),
  _deleteTheme: asClass(DeleteTheme),
  _updateTheme: asClass(UpdateTheme),
};

export const themesController = () =>
  container.resolve<ThemesController>('themesController');
