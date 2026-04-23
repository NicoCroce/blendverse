import { themesController } from '../../theme.app';

export const ThemeRoutes = () => {
  const { getAllThemes, getTheme } = themesController();

  return {
    themes: {
      getAll: getAllThemes(),
      get: getTheme(),
    },
  };
};
