import { isLogged } from '@app/Aplication/Helpers/isLogged';
import { ThemesService } from '../Config.service';

export const useGetThemes = () => {
  return ThemesService.getAll.useQuery(undefined, {
    enabled: isLogged(),
  });
};
