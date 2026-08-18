import { asClass } from 'awilix';
import { container } from '@server/Infrastructure/di/Container';
import {
  CompanyEmailSettingsService,
  EnsureCompanyEmailSettings,
  GetCompanyEmailSettings,
  GetCompanyEmailSettingsAudit,
  GetCurrentTermsVersion,
  PublishTermsVersion,
  ResolveEmailDeliveryPolicy,
  UpdateCompanyEmailSettings,
} from './Application';
import {
  CompanyEmailSettingsController,
  CompanyEmailSettingsRepositoryImplementation,
} from './Infrastructure';

export const companyEmailSettingsApp = {
  companyEmailSettingsRepository: asClass(
    CompanyEmailSettingsRepositoryImplementation,
  ).singleton(),
  companyEmailSettingsAuditRepository: asClass(
    CompanyEmailSettingsRepositoryImplementation,
  ).singleton(),
  companyEmailSettingsService: asClass(CompanyEmailSettingsService),
  companyEmailSettingsController: asClass(CompanyEmailSettingsController),
  _ensureCompanyEmailSettings: asClass(EnsureCompanyEmailSettings),
  _getCompanyEmailSettings: asClass(GetCompanyEmailSettings),
  _updateCompanyEmailSettings: asClass(UpdateCompanyEmailSettings),
  _publishTermsVersion: asClass(PublishTermsVersion),
  _resolveEmailDeliveryPolicy: asClass(ResolveEmailDeliveryPolicy),
  _getCompanyEmailSettingsAudit: asClass(GetCompanyEmailSettingsAudit),
  _getCurrentTermsVersion: asClass(GetCurrentTermsVersion),
};

export const companyEmailSettingsController = () =>
  container.resolve<CompanyEmailSettingsController>(
    'companyEmailSettingsController',
  );
