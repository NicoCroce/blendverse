import { AppError, IUseCase, IPaginationResponse } from '@server/Application';
import { DisclaimerRepository, IEmployeeRecord } from '../../Domain';
import { IGetEmployeesByCompany } from '../disclaimer.types';
import { GetCurrentTermsVersion } from '@server/domains/CompanyEmailSettings/Application';

export class GetEmployeesByCompany implements IUseCase<
  IPaginationResponse<IEmployeeRecord[]>,
  IGetEmployeesByCompany['input']
> {
  constructor(
    private readonly disclaimerRepository: DisclaimerRepository,
    private readonly _getCurrentTermsVersion?: GetCurrentTermsVersion,
  ) {}

  async execute({
    input,
    requestContext,
  }: IGetEmployeesByCompany): Promise<IPaginationResponse<IEmployeeRecord[]>> {
    const currentTerms = await this._getCurrentTermsVersion?.execute({
      requestContext,
    });
    if (!currentTerms) {
      throw new AppError(
        'Los términos vigentes no están disponibles',
        409,
        'STALE_TERMS_VERSION',
      );
    }
    const termsVersionId = currentTerms.id;

    return this.disclaimerRepository.getEmployeesByCompany({
      search: input.search || '',
      page: input.page,
      limit: input.limit,
      withoutSegments: input.withoutSegments,
      segmentIds: input.segmentIds,
      termsVersionId,
      requestContext,
    });
  }
}
