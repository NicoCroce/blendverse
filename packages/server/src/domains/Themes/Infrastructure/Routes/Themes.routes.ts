import { themesController } from '../../theme.app';

export const ThemeRoutes = () => {
  const { getAllThemes, createTheme, deleteTheme, getTheme, updateTheme } =
    themesController();

  return {
    themes: {
      getAll: getAllThemes(),
      create: createTheme(),
      get: getTheme(),
      delete: deleteTheme(),
      update: updateTheme(),
    },
  };
};
