export type CompanyEmailSettingsErrorCode =
  | 'VALIDATION_ERROR'
  | 'PERSISTENCE_ERROR';

export class CompanyEmailSettingsDomainError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly errorCode: CompanyEmailSettingsErrorCode,
  ) {
    super(message);
    this.name = 'CompanyEmailSettingsDomainError';
  }
}
