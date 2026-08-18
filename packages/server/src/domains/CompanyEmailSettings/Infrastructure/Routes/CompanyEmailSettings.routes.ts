import { router } from '@server/Infrastructure';
import { companyEmailSettingsController } from '../../companyEmailSettings.di';

export const CompanyEmailSettingsRoutes = () => {
  const controller = companyEmailSettingsController();
  return {
    companyEmailSettings: router({
      get: controller.get,
      update: controller.update,
      publishTerms: controller.publishTerms,
      getAudit: controller.getAudit,
    }),
  };
};

export type TCompanyEmailSettingsRouter = ReturnType<
  typeof CompanyEmailSettingsRoutes
>['companyEmailSettings'];
