import { AppError } from '@server/Application';
import { CompanyEmailSettingsDomainError } from '../Domain';

export const mapCompanyEmailSettingsError = (error: unknown): unknown => {
  if (!(error instanceof CompanyEmailSettingsDomainError)) return error;

  return new AppError(error.message, error.statusCode, error.errorCode);
};
