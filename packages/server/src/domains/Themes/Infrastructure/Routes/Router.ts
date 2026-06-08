import { router } from '@server/Infrastructure/trpc';
import { ThemeRoutes } from './Themes.routes';

const _ThemeRouter = () => router(ThemeRoutes());
export type TThemeRouter = ReturnType<typeof _ThemeRouter>;
