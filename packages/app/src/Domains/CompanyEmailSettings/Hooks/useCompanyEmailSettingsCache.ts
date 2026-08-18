import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { CompanyEmailSettingsService } from '../CompanyEmailSettings.service';

export const useCompanyEmailSettingsCache = () => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(CompanyEmailSettingsService.get);

  return {
    getData: () => queryClient.getQueryData(queryKey),
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  };
};
