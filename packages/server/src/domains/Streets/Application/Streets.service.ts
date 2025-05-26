import {
  executeUseCase,
  ISelect,
  TransformToSelect,
} from '@server/Application';
import {
  CreateStreet,
  DeleteStreet,
  GetAllStreets,
  GetStreet,
  UpdateStreet,
  Street,
} from '../Domain';
import {
  ICreateStreet,
  IDeleteStreet,
  IGetAllStreets,
  IGetStreet,
  IUpdateStreet,
} from '../Domain';

export class StreetsService {
  constructor(
    private readonly _create: CreateStreet,
    private readonly _delete: DeleteStreet,
    private readonly _update: UpdateStreet,
    private readonly _getAllStreets: GetAllStreets,
    private readonly _getStreet: GetStreet,
  ) {}

  async createStreet({
    input,
    requestContext,
  }: ICreateStreet): Promise<Street | null> {
    return executeUseCase({
      useCase: this._create,
      input,
      requestContext,
    });
  }
  async deleteStreet({
    input,
    requestContext,
  }: IDeleteStreet): Promise<number | null> {
    return executeUseCase({
      useCase: this._delete,
      input,
      requestContext,
    });
  }
  async updateStreet({
    input,
    requestContext,
  }: IUpdateStreet): Promise<Street | null> {
    return executeUseCase({
      useCase: this._update,
      input,
      requestContext,
    });
  }

  async getAllStreets({
    input,
    requestContext,
  }: IGetAllStreets): Promise<ISelect[]> {
    const data = await executeUseCase({
      useCase: this._getAllStreets,
      input,
      requestContext,
    });

    return TransformToSelect(data, 'denominacion');
  }

  async getStreet({
    input,
    requestContext,
  }: IGetStreet): Promise<Street | null> {
    return executeUseCase({ useCase: this._getStreet, input, requestContext });
  }
}
