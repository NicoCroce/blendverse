import { CompanyEmailSettingsService } from '../CompanyEmailSettings.service';

export const useGetCompanyEmailSettings = () =>
  CompanyEmailSettingsService.get.useQuery(undefined, {
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
