import { OwnserSysService } from '../Config.service';

export const useGetOwnerTheme = () => {
  const { data, ...res } = OwnserSysService.getOwnerTheme.useQuery();

  return { dataOwnerTheme: data, res };
};
