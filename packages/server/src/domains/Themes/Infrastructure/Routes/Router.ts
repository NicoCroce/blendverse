import { router } from '@server/Infrastructure/trpc';
import { ThemeRoutes } from './Themes.routes';

const ThemeRouter = () => router(ThemeRoutes());
export type TThemeRouter = ReturnType<typeof ThemeRouter>;
