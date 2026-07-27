import { IUseCase, IPaginationResponse } from '@server/Application';
import { DisclaimerRepository, IEmployeeRecord } from '../../Domain';
import { IGetEmployeesByCompany } from '../disclaimer.types';

export class GetEmployeesByCompany implements IUseCase<
  IPaginationResponse<IEmployeeRecord[]>,
  IGetEmployeesByCompanyInput
> {
  constructor(private readonly disclaimerRepository: DisclaimerRepository) {}

  async execute({
    input,
    requestContext,
  }: IGetEmployeesByCompany): Promise<IPaginationResponse<IEmployeeRecord[]>> {
    const ownerId = input.ownerId ?? requestContext.values.ownerId;

    return this.disclaimerRepository.getEmployeesByCompany({
      ownerId,
      search: input.search || '',
      page: input.page,
      limit: input.limit,
      requestContext,
    });
  }
}

export interface IGetEmployeesByCompanyInput {
  ownerId?: number;
  search?: string;
  page?: string;
  limit?: string;
}
