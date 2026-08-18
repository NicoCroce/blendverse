import type {
  CompanyEmailSettingsDraft,
  CompanyEmailSettingsSnapshot,
  DeliveryPolicy,
  EmailCatalogCode,
  CompanyEmailRequestContext,
} from './CompanyEmailSettings.types';

export interface ICompanyEmailSettingsRepository {
  get(
    requestContext: CompanyEmailRequestContext,
  ): Promise<CompanyEmailSettingsSnapshot>;
  ensure(
    requestContext: CompanyEmailRequestContext,
  ): Promise<CompanyEmailSettingsSnapshot>;
  update(params: {
    requestContext: CompanyEmailRequestContext;
    expectedVersion: number;
    draft: CompanyEmailSettingsDraft;
  }): Promise<CompanyEmailSettingsSnapshot>;
  publishTerms(params: {
    requestContext: CompanyEmailRequestContext;
    expectedVersion: number;
    sanitizedContent: string;
  }): Promise<CompanyEmailSettingsSnapshot>;
  resolvePolicy(params: {
    requestContext: CompanyEmailRequestContext;
    code: EmailCatalogCode;
  }): Promise<DeliveryPolicy>;
}
