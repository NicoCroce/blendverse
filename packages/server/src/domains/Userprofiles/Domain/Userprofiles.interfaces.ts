import { IPagination, IRequestContext } from '@server/Application';
export interface IGetAllUserprofiles extends IRequestContext {
  input?: { search?: string } & IPagination;
}
export interface ICreateUserprofile extends IRequestContext {
  input: {
    id: number;
    id_usuario: number;
    id_perfil: number;
  };
}
export interface IGetUserprofile extends IRequestContext {
  input: number;
}
export interface IUpdateUserprofile extends IRequestContext {
  input: {
    id: number;
    id_usuario: number;
    id_perfil: number;
  };
}
export interface IDeleteUserprofile extends IRequestContext {
  input: number;
}
export interface IGetAllProfilesByUser extends IRequestContext {
  input?: Record<string, never>;
}
export interface IUserprofile {
  id_usuario?: number;
  id_perfil?: number;
  id?: number;
  userName?: string;
  profileName?: string;
  prioridad_precio?: number;
}
