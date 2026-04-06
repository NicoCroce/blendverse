import { ThemesService } from '../Config.service';

export const useGetThemes = () => {
  return ThemesService.getAll.useQuery();
};
