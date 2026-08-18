import { AppError, IUseCase } from '@server/Application';
import { GetPermissionsByUser } from '@server/domains/Permissions/Application';
import type {
  CompanyEmailSettingsSnapshot,
  CompanyEmailSettingsAuditRepository,
  ICompanyEmailSettingsRepository,
} from '../../Domain';
import {
  contentHash,
  sanitizeTermsContent,
} from '../../Domain/value-objects/EmailContent.value';
import { requireDashboardAccess } from '../CompanyEmailSettingsAuthorization';
import type { PublishTermsRequest } from '../companyEmailSettings.types';
import { mapCompanyEmailSettingsError } from '../CompanyEmailSettingsError.mapper';

export class PublishTermsVersion implements IUseCase<CompanyEmailSettingsSnapshot> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
    private readonly companyEmailSettingsAuditRepository: CompanyEmailSettingsAuditRepository,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
  ) {}

  async execute({
    input,
    requestContext,
  }: PublishTermsRequest): Promise<CompanyEmailSettingsSnapshot> {
    try {
      await requireDashboardAccess(requestContext, this._getPermissionsByUser);
      if (!input.confirmNewAcceptanceRequirement) {
        throw new AppError(
          'Debe confirmar la nueva aceptación requerida',
          400,
          'VALIDATION_ERROR',
        );
      }
      const sanitizedContent = sanitizeTermsContent(input.content);
      return await this.companyEmailSettingsRepository.publishTerms({
        requestContext,
        expectedVersion: input.expectedVersion,
        sanitizedContent,
      });
    } catch (error) {
      const mappedError = mapCompanyEmailSettingsError(error);
      await this.companyEmailSettingsAuditRepository.record(
        {
          action: 'terms_published',
          outcome: 'rejected',
          reasonCode:
            mappedError instanceof AppError
              ? mappedError.errorCode
              : 'PERSISTENCE_ERROR',
          settingsVersionBefore: input.expectedVersion,
          contentHashAfter: (() => {
            try {
              return contentHash(sanitizeTermsContent(input.content));
            } catch {
              return null;
            }
          })(),
        },
        requestContext,
      );
      throw mappedError;
    }
  }
}
