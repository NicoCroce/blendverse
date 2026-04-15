import { router } from '@server/Infrastructure/trpc';
import { ThemeRoutes } from './ThemeRoutes';

const ThemeRouter = () => router(ThemeRoutes());
export type TThemeRouter = ReturnType<typeof ThemeRouter>;
