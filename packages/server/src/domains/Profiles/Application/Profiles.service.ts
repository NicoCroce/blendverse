import {
  executeUseCase,
  IPaginationResponse,
  ISelect,
} from '@server/Application';
import {
  Profile,
  IGetSelectProfile,
  ICreateProfile,
  IDeleteProfile,
  IGetAllProfiles,
  IGetProfile,
  IUpdateProfile,
} from '../Domain';
import {
  CreateProfile,
  DeleteProfile,
  GetAllProfiles,
  GetProfile,
  UpdateProfile,
  GetSelectProfile,
} from './UseCases';

export class ProfilesService {
  constructor(
    private readonly _createProfile: CreateProfile,
    private readonly _deleteProfile: DeleteProfile,
    private readonly _updateProfile: UpdateProfile,
    private readonly _getAllProfiles: GetAllProfiles,
    private readonly _getSelectProfile: GetSelectProfile,
    private readonly _getProfile: GetProfile,
  ) {}

  async createProfile({
    input,
    requestContext,
  }: ICreateProfile): Promise<Profile | null> {
    return executeUseCase({
      useCase: this._createProfile,
      input,
      requestContext,
    });
  }
  async deleteProfile({
    input,
    requestContext,
  }: IDeleteProfile): Promise<number | null> {
    return executeUseCase({
      useCase: this._deleteProfile,
      input,
      requestContext,
    });
  }
  async updateProfile({
    input,
    requestContext,
  }: IUpdateProfile): Promise<Profile | null> {
    return executeUseCase({
      useCase: this._updateProfile,
      input,
      requestContext,
    });
  }

  async getAllProfiles({
    input,
    requestContext,
  }: IGetAllProfiles): Promise<IPaginationResponse<Profile[]>> {
    return executeUseCase({
      useCase: this._getAllProfiles,
      input,
      requestContext,
    });
  }

  async getSelectProfile({
    input,
    requestContext,
  }: IGetSelectProfile): Promise<ISelect[]> {
    const data = await executeUseCase({
      useCase: this._getSelectProfile,
      input,
      requestContext,
    });

    return data;
  }
  async getProfile({
    input,
    requestContext,
  }: IGetProfile): Promise<Profile | null> {
    return executeUseCase({
      useCase: this._getProfile,
      input,
      requestContext,
    });
  }
}
