import {
  IPagination,
  IPaginationResponse,
  IRequestContext,
  ISelect,
} from '@server/Application';
import { Profile } from './Profiles.entity';

export interface IGetProfilesRepository extends IRequestContext {
  filters?: {
    denominacion?: string;
  } & IPagination;
}
export interface ICreateProfileRepository extends IRequestContext {
  profile: Profile;
}
export interface IGetProfileRepository extends IRequestContext {
  id: number;
}
export interface IUpdateProfileRepository extends IRequestContext {
  profile: Profile;
}
export interface IDeleteProfileRepository extends IRequestContext {
  id: number;
}
export interface IGetSelectProfileRepository extends IRequestContext {
  filters?: {
    denominacion?: string;
  };
}
export interface IGetProfilesRepositoryResponse
  extends IPaginationResponse<Profile[]> {}
export interface ProfilesRepository {
  getAllProfiles(
    params: IGetProfilesRepository,
  ): Promise<IGetProfilesRepositoryResponse>;
  getSelectProfile(params: IGetSelectProfileRepository): Promise<ISelect[]>;
  create(params: ICreateProfileRepository): Promise<Profile | null>;
  update(params: IUpdateProfileRepository): Promise<number | null>;
  delete(params: IDeleteProfileRepository): Promise<number | null>;
  getProfile(params: IGetProfileRepository): Promise<Profile | null>;
}
