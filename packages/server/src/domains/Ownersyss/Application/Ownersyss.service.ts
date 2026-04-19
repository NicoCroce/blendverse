import {
  executeUseCase,
  IPaginationResponse,
  ISelect,
} from '@server/Application';
import {
  Ownersys,
  IGetSelectOwnersys,
  ICreateOwnersys,
  IDeleteOwnersys,
  IGetAllOwnersyss,
  IGetOwnersys,
  IUpdateOwnersys,
  IUpdateTheme,
  IGetOwnerTheme,
} from '../Domain';
import {
  CreateOwnersys,
  DeleteOwnersys,
  GetAllOwnersyss,
  GetOwnersys,
  UpdateOwnersys,
  GetSelectOwnersys,
  ChangeTheme,
  GetOwnerTheme,
} from './UseCases';

export class OwnersyssService {
  constructor(
    private readonly _createOwnersys: CreateOwnersys,
    private readonly _deleteOwnersys: DeleteOwnersys,
    private readonly _updateOwnersys: UpdateOwnersys,
    private readonly _getAllOwnersyss: GetAllOwnersyss,
    private readonly _getSelectOwnersys: GetSelectOwnersys,
    private readonly _getOwnersys: GetOwnersys,
    private readonly _changeTheme: ChangeTheme,
    private readonly _getOwnerTheme: GetOwnerTheme,
  ) {}

  async createOwnersys({
    input,
    requestContext,
  }: ICreateOwnersys): Promise<Ownersys | null> {
    return executeUseCase({
      useCase: this._createOwnersys,
      input,
      requestContext,
    });
  }
  async deleteOwnersys({
    input,
    requestContext,
  }: IDeleteOwnersys): Promise<number | null> {
    return executeUseCase({
      useCase: this._deleteOwnersys,
      input,
      requestContext,
    });
  }
  async updateOwnersys({
    input,
    requestContext,
  }: IUpdateOwnersys): Promise<Ownersys | null> {
    return executeUseCase({
      useCase: this._updateOwnersys,
      input,
      requestContext,
    });
  }

  async getAllOwnersyss({
    input,
    requestContext,
  }: IGetAllOwnersyss): Promise<IPaginationResponse<Ownersys[]>> {
    return executeUseCase({
      useCase: this._getAllOwnersyss,
      input,
      requestContext,
    });
  }

  async getSelectOwnersys({
    input,
    requestContext,
  }: IGetSelectOwnersys): Promise<ISelect[]> {
    const data = await executeUseCase({
      useCase: this._getSelectOwnersys,
      input,
      requestContext,
    });

    return data;
  }
  async getOwnersys({
    input,
    requestContext,
  }: IGetOwnersys): Promise<Ownersys | null> {
    return executeUseCase({
      useCase: this._getOwnersys,
      input,
      requestContext,
    });
  }

  async updateTheme({
    input,
    requestContext,
  }: IUpdateTheme): Promise<number | null> {
    return executeUseCase({
      useCase: this._changeTheme,
      input,
      requestContext,
    });
  }

  async getOwnerTheme({ requestContext }: IGetOwnerTheme) {
    return executeUseCase({
      useCase: this._getOwnerTheme,
      requestContext,
    });
  }
}
