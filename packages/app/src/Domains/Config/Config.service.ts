import { createTRPCReact } from '@trpc/react-query';
import { TOwnersysRouter } from '@server/domains/Ownersyss';
import { TThemeRouter } from '@server/domains/Themes';

export const _ownserSysService = createTRPCReact<TOwnersysRouter>();
export const OwnserSysService = _ownserSysService.ownersyss;

export const _themesService = createTRPCReact<TThemeRouter>();
export const ThemesService = _themesService.themes;
