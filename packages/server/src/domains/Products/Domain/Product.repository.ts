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
  id: string;
  params: string | string[];
}

export interface ProductsRepository {
  getProducts(params: IGetProductsRepository): Promise<Product[]>;
  createProduct(params: ICreateProductRepository): Promise<Product>;
  updateStock(params: IUpdateStockRepository): Promise<Product>;
  deleteProduct(params: IDeleteProductRepository): Promise<Product>;
  getProduct(params: IGetProductRepository): Promise<Product | null>;
  getProductInfo(
    params: IGetProductInfoRepository,
  ): Promise<Record<string, unknown> | null>;
}
