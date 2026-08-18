import { IUseCase } from '@server/Application';
import { OwnersyssRepository } from '@server/domains/Ownersyss';
import {
  IGetDisclaimerText,
  IGetDisclaimerTextResponse,
} from '../disclaimer.types';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';

export class GetDisclaimerText implements IUseCase<IGetDisclaimerTextResponse> {
  constructor(
    private readonly ownersyssRepository: OwnersyssRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({
    requestContext,
  }: IGetDisclaimerText): Promise<IGetDisclaimerTextResponse> {
    if (this._getCurrentTermsVersion) {
      const currentTerms = await this._getCurrentTermsVersion.execute({
        requestContext,
      });
      if (currentTerms) {
        return {
          content: currentTerms.content,
          version: currentTerms.version,
        };
      }
    }
    const ownersys = await this.ownersyssRepository.getOwnersys({
      id: requestContext.values.ownerId,
      requestContext,
    });

    return {
      content: ownersys?.values.texto_disclaimer || '',
      version: null,
    };
  }
}
