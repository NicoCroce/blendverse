import { IUseCase } from '@server/Application';
import type {
  DeliveryPolicy,
  ICompanyEmailSettingsRepository,
} from '../../Domain';
import type { DeliveryPolicyRequest } from '../companyEmailSettings.types';
import { mapCompanyEmailSettingsError } from '../CompanyEmailSettingsError.mapper';

export class ResolveEmailDeliveryPolicy implements IUseCase<DeliveryPolicy> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: DeliveryPolicyRequest): Promise<DeliveryPolicy> {
    try {
      return await this.companyEmailSettingsRepository.resolvePolicy({
        requestContext,
        code: input.code,
      });
    } catch (error) {
      throw mapCompanyEmailSettingsError(error);
    }
  }
}
