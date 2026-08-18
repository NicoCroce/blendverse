import type { TMainRouter } from '@server/Infrastructure/Routes/Router';
import { createTRPCReact } from '@trpc/react-query';

export const _companyEmailSettingsService = createTRPCReact<TMainRouter>();
export const CompanyEmailSettingsService =
  _companyEmailSettingsService.companyEmailSettings;
