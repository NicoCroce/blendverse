import { IRequestContext } from '@server/Application';
import { Product } from './Product.entity';

export interface IGetProductsRepository extends IRequestContext {}
export interface ICreateProductRepository extends IRequestContext {
  product: Product;
}
export interface IUpdateStockRepository extends IRequestContext {
  id: string;
  stock: number;
}
export interface IDeleteProductRepository extends IRequestContext {
  id: string;
}
export interface IGetProductRepository extends IRequestContext {
  id: string;
}
export interface IGetProductInfoRepository extends IRequestContext {
  productId: string;
  params: string | string[];
}

export interface ProductsRepository {
  getProducts({ requestContext }: IGetProductsRepository): Promise<Product[]>;
  createProduct({
    product,
    requestContext,
  }: ICreateProductRepository): Promise<Product>;
  updateStock({
    id,
    stock,
    requestContext,
  }: IUpdateStockRepository): Promise<Product>;
  deleteProduct({ id }: IDeleteProductRepository): Promise<Product>;
  getProduct({ id }: IGetProductRepository): Promise<Product | null>;
  getProductInfo({
    productId,
    params,
  }: IGetProductInfoRepository): Promise<Record<string, unknown> | null>;
}
