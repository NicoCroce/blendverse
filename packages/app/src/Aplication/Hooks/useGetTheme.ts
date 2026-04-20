import { isLogged } from '@app/Aplication/Helpers/isLogged';
import { ThemesService } from '@app/Domains/Config';

export const useGetTheme = (id: number) => {
  return ThemesService.get.useQuery(id, {
    enabled: isLogged() && id !== undefined,
  });
};
