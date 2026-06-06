import { IPagination, IRequestContext } from '@server/Application';

export interface IGetAllUserprofiles extends IRequestContext {
  input?: { search?: string } & IPagination;
}

export interface IGetAllProfilesByUser extends IRequestContext {
  input?: Record<string, never>;
}

export interface IAssociateUserToProfile extends IRequestContext {
  input: {
    userId: number;
    profileId: number | null;
  };
}
