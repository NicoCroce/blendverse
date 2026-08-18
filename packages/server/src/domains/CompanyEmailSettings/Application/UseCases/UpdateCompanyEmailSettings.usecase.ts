import { AppError, IUseCase } from '@server/Application';
import { GetPermissionsByUser } from '@server/domains/Permissions/Application';
import {
  CompanyEmailSettingsSnapshot,
  CompanyEmailSettingsAuditRepository,
  ICompanyEmailSettingsRepository,
  EMAIL_CATALOG_CODES,
  validateDeliveryDraft,
  validateReportDraft,
} from '../../Domain';
import { EmailAddress } from '../../Domain/value-objects/EmailAddress.value';
import { sanitizeWelcomeMessage } from '../../Domain/value-objects/EmailContent.value';
import { requireDashboardAccess } from '../CompanyEmailSettingsAuthorization';
import type { UpdateCompanyEmailSettingsRequest } from '../companyEmailSettings.types';
import { mapCompanyEmailSettingsError } from '../CompanyEmailSettingsError.mapper';

export class UpdateCompanyEmailSettings implements IUseCase<CompanyEmailSettingsSnapshot> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
    private readonly companyEmailSettingsAuditRepository: CompanyEmailSettingsAuditRepository,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
  ) {}

  async execute({
    input,
    requestContext,
  }: UpdateCompanyEmailSettingsRequest): Promise<CompanyEmailSettingsSnapshot> {
    try {
      await requireDashboardAccess(requestContext, this._getPermissionsByUser);
      validateDeliveryDraft(input.delivery);
      validateReportDraft(input.reportSections);

      const recipients = input.adminRecipients.map(({ email }) =>
        EmailAddress.create(email),
      );
      if (
        new Set(recipients.map((recipient) => recipient.normalized)).size !==
        recipients.length
      ) {
        throw new AppError(
          'No se permiten destinatarios duplicados',
          400,
          'VALIDATION_ERROR',
        );
      }

      const hasActiveAdminDelivery = input.delivery.some(
        ({ code, enabled }) =>
          enabled &&
          code !== 'requester_document_manual' &&
          (code === 'admin_license_created' ||
            code === 'admin_document_signed' ||
            code === 'admin_daily_report'),
      );
      if (hasActiveAdminDelivery && recipients.length === 0) {
        throw new AppError(
          'Debe existir al menos un destinatario administrativo',
          400,
          'VALIDATION_ERROR',
        );
      }

      const reportEnabled = input.delivery.some(
        ({ code, enabled }) => code === 'admin_daily_report' && enabled,
      );
      if (
        reportEnabled &&
        !input.reportSections.some(({ enabled }) => enabled)
      ) {
        throw new AppError(
          'Seleccione al menos una sección del reporte',
          400,
          'VALIDATION_ERROR',
        );
      }

      const sanitizedWelcomeMessage = sanitizeWelcomeMessage(
        input.welcomeMessage,
      );
      const snapshot = await this.companyEmailSettingsRepository.update({
        requestContext,
        expectedVersion: input.expectedVersion,
        draft: {
          ...input,
          delivery: input.delivery as never,
          reportSections: input.reportSections as never,
          adminRecipients: recipients.map(({ value }) => ({ email: value })),
          welcomeMessage: sanitizedWelcomeMessage,
        },
      });
      return snapshot;
    } catch (error) {
      const mappedError = mapCompanyEmailSettingsError(error);
      await this.companyEmailSettingsAuditRepository.record(
        {
          action: 'settings_updated',
          outcome: 'rejected',
          reasonCode:
            mappedError instanceof AppError
              ? mappedError.errorCode
              : 'PERSISTENCE_ERROR',
          settingsVersionBefore: input.expectedVersion,
          changedCodes: EMAIL_CATALOG_CODES,
        },
        requestContext,
      );
      throw mappedError;
    }
  }
}
