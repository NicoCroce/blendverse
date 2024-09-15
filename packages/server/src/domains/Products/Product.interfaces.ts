import { IRequestContext } from '@server/Application';

export interface IGetProducts extends IRequestContext {}
export interface ICreateProduct extends IRequestContext {
  name: string;
  description: string;
  stock: number;
  price: number;
}
export interface IDeleteProduct extends IRequestContext {
  id: string;
}
export interface IUpdateStock extends IRequestContext {
  id: string;
  stock: number;
}
export interface IGetStock extends IRequestContext {
  id: string;
}
export interface IGetProduct extends IRequestContext {
  id: string;
}
export interface IGetInfo extends IRequestContext {
  productId: string;
  params: string | string[];
}
