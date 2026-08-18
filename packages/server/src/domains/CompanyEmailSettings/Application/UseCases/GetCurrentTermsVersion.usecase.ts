import { IUseCase, type RequestContext } from '@server/Application';
import type {
  ICompanyEmailSettingsRepository,
  TermsVersion,
} from '../../Domain';

export class GetCurrentTermsVersion implements IUseCase<TermsVersion | null> {
  constructor(
    private readonly companyEmailSettingsRepository: ICompanyEmailSettingsRepository,
  ) {}

  async execute({
    requestContext,
  }: {
    requestContext: RequestContext;
  }): Promise<TermsVersion | null> {
    const snapshot =
      await this.companyEmailSettingsRepository.ensure(requestContext);
    return snapshot.currentTerms;
  }
}
