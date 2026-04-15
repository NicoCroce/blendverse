import { IRequestContext } from '@server/Application';
export interface IGetAllProfiles extends IRequestContext {
  input?: {
    denominacion: string;
  };
}
export interface IGetSelectProfile extends IRequestContext {
  input?: {
    denominacion: string;
  };
}
export interface ICreateProfile extends IRequestContext {
  input: {
    denominacion: string;
    id?: number;
    visualiza_stock: number;
    prioridad_precio: number;
  };
}
export interface IGetProfile extends IRequestContext {
  input: number;
}
export interface IUpdateProfile extends IRequestContext {
  input: {
    id: number;
    denominacion: string;
    visualiza_stock: number;
    prioridad_precio: number;
  };
}
export interface IDeleteProfile extends IRequestContext {
  input: number;
}
export interface IProfile {
  id_propietario: number;
  denominacion: string;
  visualiza_stock: number;
  prioridad_precio: number;
  id?: number;
}
