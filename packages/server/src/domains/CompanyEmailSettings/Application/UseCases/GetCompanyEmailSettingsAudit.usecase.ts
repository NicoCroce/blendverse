import { IUseCase } from '@server/Application';
import { GetPermissionsByUser } from '@server/domains/Permissions/Application';
import type {
  CompanyEmailSettingsAuditRepository,
  PaginatedAuditEvents,
} from '../../Domain';
import { requireDashboardAccess } from '../CompanyEmailSettingsAuthorization';
import type { GetAuditRequest } from '../companyEmailSettings.types';

export class GetCompanyEmailSettingsAudit implements IUseCase<PaginatedAuditEvents> {
  constructor(
    private readonly companyEmailSettingsAuditRepository: CompanyEmailSettingsAuditRepository,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
  ) {}

  async execute({
    input,
    requestContext,
  }: GetAuditRequest): Promise<PaginatedAuditEvents> {
    try {
      await requireDashboardAccess(requestContext, this._getPermissionsByUser);
      return await this.companyEmailSettingsAuditRepository.list({
        requestContext,
        page: input?.page ?? 1,
        limit: input?.limit ?? 50,
        action: input?.action,
        outcome: input?.outcome,
      });
    } catch (error) {
      await this.companyEmailSettingsAuditRepository
        .record(
          {
            action: 'access_rejected',
            outcome: 'rejected',
            reasonCode: 'FORBIDDEN',
          },
          requestContext,
        )
        .catch(() => undefined);
      throw error;
    }
  }
}
