import { executeUseCase } from '@server/Application';
import {
  GetCompanyEmailSettings,
  GetCompanyEmailSettingsAudit,
  PublishTermsVersion,
  ResolveEmailDeliveryPolicy,
  UpdateCompanyEmailSettings,
} from './UseCases';
import type {
  GetAuditRequest,
  GetCompanyEmailSettingsInput,
  PublishTermsRequest,
  ResolveEmailDeliveryPolicyResult,
  ResolveDeliveryRequest,
  UpdateCompanyEmailSettingsRequest,
} from './companyEmailSettings.types';

export class CompanyEmailSettingsService {
  constructor(
    private readonly _getCompanyEmailSettings: GetCompanyEmailSettings,
    private readonly _updateCompanyEmailSettings: UpdateCompanyEmailSettings,
    private readonly _publishTermsVersion: PublishTermsVersion,
    private readonly _resolveEmailDeliveryPolicy: ResolveEmailDeliveryPolicy,
    private readonly _getCompanyEmailSettingsAudit: GetCompanyEmailSettingsAudit,
  ) {}

  get({ requestContext }: GetCompanyEmailSettingsInput) {
    return executeUseCase({
      useCase: this._getCompanyEmailSettings,
      requestContext,
    });
  }

  update({ input, requestContext }: UpdateCompanyEmailSettingsRequest) {
    return executeUseCase({
      useCase: this._updateCompanyEmailSettings,
      input,
      requestContext,
    });
  }

  publishTerms({ input, requestContext }: PublishTermsRequest) {
    return executeUseCase({
      useCase: this._publishTermsVersion,
      input,
      requestContext,
    });
  }

  resolveDelivery({
    input,
    requestContext,
  }: ResolveDeliveryRequest): Promise<ResolveEmailDeliveryPolicyResult> {
    return executeUseCase({
      useCase: this._resolveEmailDeliveryPolicy,
      input,
      requestContext,
    });
  }

  getAudit({ input, requestContext }: GetAuditRequest) {
    return executeUseCase({
      useCase: this._getCompanyEmailSettingsAudit,
      input,
      requestContext,
    });
  }
}
