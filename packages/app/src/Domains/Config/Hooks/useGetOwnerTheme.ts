import { isLogged } from '@app/Application/Helpers/isLogged';
import { OwnserSysService } from '../Config.service';

export const useGetOwnerTheme = () => {
  const { data, ...res } = OwnserSysService.getOwnerTheme.useQuery(undefined, {
    enabled: isLogged(),
  });

  return { dataOwnerTheme: data, res };
};
