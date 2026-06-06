import { isLogged } from '@app/Application/Helpers/isLogged';
import { ThemesService } from '../Config.service';

export const useGetThemes = () => {
  return ThemesService.getAll.useQuery(undefined, {
    enabled: isLogged(),
  });
};
