import { IUseCase, type RequestContext } from '@server/Application';
import {
  type CompanyEmailSettingsSnapshot,
  type ICompanyEmailSettingsRepository,
} from '../../Domain';
import { mapCompanyEmailSettingsError } from '../CompanyEmailSettingsError.mapper';

export class EnsureCompanyEmailSettings implements IUseCase<CompanyEmailSettingsSnapshot> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
  ) {}

  async execute({
    requestContext,
  }: {
    requestContext: RequestContext;
  }): Promise<CompanyEmailSettingsSnapshot> {
    try {
      return await this.companyEmailSettingsRepository.ensure(requestContext);
    } catch (error) {
      throw mapCompanyEmailSettingsError(error);
    }
  }
}
