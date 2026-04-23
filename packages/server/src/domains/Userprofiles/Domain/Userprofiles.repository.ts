import { IPaginationResponse, IRequestContext } from '@server/Application';
import { Userprofile } from './Userprofiles.entity';
export interface ICreateUserprofileRepository extends IRequestContext {
  userprofile: Userprofile;
}
export interface IUpdateUserprofileRepository extends IRequestContext {
  userprofile: Userprofile;
}
export interface IDeleteUserprofileRepository extends IRequestContext {
  id: number;
}
export interface IGetUserprofilesRepositoryResponse
  extends IPaginationResponse<Userprofile[]> {}
export interface UserprofilesRepository {
  getAllProfilesByUser(params: IRequestContext): Promise<Userprofile[] | null>;
  createUserprofile(
    params: ICreateUserprofileRepository,
  ): Promise<Userprofile | null>;
  updateUserprofile(
    params: IUpdateUserprofileRepository,
  ): Promise<number | null>;
  deleteUserprofile(
    params: IDeleteUserprofileRepository,
  ): Promise<number | null>;
}
