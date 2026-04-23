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
export interface IUserprofile {
  id_usuario?: number;
  id_perfil?: number;
  id?: number;
  userName?: string;
  profileName?: string;
  prioridad_precio?: number;
}
