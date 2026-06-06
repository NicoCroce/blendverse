import { themesController } from '../..';

export const ThemeRoutes = () => {
  const { getAllThemes, getTheme } = themesController();

  return {
    themes: {
      getAll: getAllThemes(),
      get: getTheme(),
    },
  };
};
