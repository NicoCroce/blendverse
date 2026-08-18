import { CompanyEmailSettingsDomainError } from '../CompanyEmailSettings.errors';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class EmailAddress {
  private constructor(
    readonly value: string,
    readonly normalized: string,
  ) {}

  static create(value: string): EmailAddress {
    const trimmed = value.trim();
    if (
      trimmed.length === 0 ||
      trimmed.length > 320 ||
      !EMAIL_PATTERN.test(trimmed)
    ) {
      throw new CompanyEmailSettingsDomainError(
        'La dirección de email no es válida',
        400,
        'VALIDATION_ERROR',
      );
    }

    return new EmailAddress(trimmed, trimmed.toLowerCase());
  }
}
