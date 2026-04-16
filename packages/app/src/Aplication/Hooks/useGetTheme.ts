import { ThemesService } from '@app/Domains/Config';

export const useGetTheme = (id: number) => {
  return ThemesService.get.useQuery(id, {
    enabled: id !== undefined,
  });
};
