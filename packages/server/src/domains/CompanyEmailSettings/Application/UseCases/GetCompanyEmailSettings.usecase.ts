import { IUseCase } from '@server/Application';
import { GetPermissionsByUser } from '@server/domains/Permissions/Application';
import type {
  CompanyEmailSettingsAuditRepository,
  CompanyEmailSettingsSnapshot,
  ICompanyEmailSettingsRepository,
} from '../../Domain';
import { requireDashboardAccess } from '../CompanyEmailSettingsAuthorization';
import type { GetCompanyEmailSettingsInput } from '../companyEmailSettings.types';
import { mapCompanyEmailSettingsError } from '../CompanyEmailSettingsError.mapper';

export class GetCompanyEmailSettings implements IUseCase<CompanyEmailSettingsSnapshot> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
    private readonly companyEmailSettingsAuditRepository: CompanyEmailSettingsAuditRepository,
    private readonly _getPermissionsByUser: GetPermissionsByUser,
  ) {}

  async execute({
    requestContext,
  }: GetCompanyEmailSettingsInput): Promise<CompanyEmailSettingsSnapshot> {
    try {
      await requireDashboardAccess(requestContext, this._getPermissionsByUser);
      return await this.companyEmailSettingsRepository.ensure(requestContext);
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
      throw mapCompanyEmailSettingsError(error);
    }
  }
}
