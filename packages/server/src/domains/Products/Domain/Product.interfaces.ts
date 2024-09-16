import { IRequestContext } from '@server/Application';

export interface IGetProducts extends IRequestContext {}
export interface ICreateProduct extends IRequestContext {
  input: { name: string; description: string; stock: number; price: number };
}
export interface IDeleteProduct extends IRequestContext {
  input: string; // id
}
export interface IUpdateStock extends IRequestContext {
  input: { id: string; stock: number };
}
export interface IGetStock extends IRequestContext {
  input: string; // id
}
export interface IGetProduct extends IRequestContext {
  input: string; // id
}
export interface IGetSomeInfoProduct extends IRequestContext {
  input: { id: string; params: string | string[] };
}
