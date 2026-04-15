import {
  executeUseCase,
  IPaginationResponse,
  IRequestContext,
} from '@server/Application';
import {
  Userprofile,
  ICreateUserprofile,
  IDeleteUserprofile,
  IGetAllUserprofiles,
  IGetUserprofile,
  IUpdateUserprofile,
} from '../Domain';
import {
  CreateUserprofile,
  DeleteUserprofile,
  GetAllUserprofiles,
  GetUserprofile,
  UpdateUserprofile,
  GetProfileByUserId,
} from './UseCases';

interface IGetProfileByUserId extends IRequestContext {
  input: number;
}

export class UserprofilesService {
  constructor(
    private readonly _createUserprofile: CreateUserprofile,
    private readonly _deleteUserprofile: DeleteUserprofile,
    private readonly _updateUserprofile: UpdateUserprofile,
    private readonly _getAllUserprofiles: GetAllUserprofiles,
    private readonly _getUserprofile: GetUserprofile,
    private readonly _getProfileByUserId: GetProfileByUserId,
  ) {}

  async createUserprofile({
    input,
    requestContext,
  }: ICreateUserprofile): Promise<Userprofile | null> {
    return executeUseCase({
      useCase: this._createUserprofile,
      input,
      requestContext,
    });
  }
  async deleteUserprofile({
    input,
    requestContext,
  }: IDeleteUserprofile): Promise<number | null> {
    return executeUseCase({
      useCase: this._deleteUserprofile,
      input,
      requestContext,
    });
  }
  async updateUserprofile({
    input,
    requestContext,
  }: IUpdateUserprofile): Promise<Userprofile | null> {
    return executeUseCase({
      useCase: this._updateUserprofile,
      input,
      requestContext,
    });
  }

  async getAllUserprofiles({
    input,
    requestContext,
  }: IGetAllUserprofiles): Promise<IPaginationResponse<Userprofile[]>> {
    return executeUseCase({
      useCase: this._getAllUserprofiles,
      input,
      requestContext,
    });
  }

  async getUserprofile({
    input,
    requestContext,
  }: IGetUserprofile): Promise<Userprofile | null> {
    return executeUseCase({
      useCase: this._getUserprofile,
      input,
      requestContext,
    });
  }

  async getProfileByUserId({
    input,
    requestContext,
  }: IGetProfileByUserId): Promise<number | null> {
    return executeUseCase({
      useCase: this._getProfileByUserId,
      input,
      requestContext,
    });
  }
}
