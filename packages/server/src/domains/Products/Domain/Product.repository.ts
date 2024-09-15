import { Product } from './Product.entity';

export interface ProductsRepository {
  getProducts(): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  updateStock(id: string, stock: number): Promise<Product>;
  delete(id: string): Promise<Product>;
  getProduct(id: string): Promise<Product | null>;
  getProductInfo(
    productId: string,
    params: string | string[],
  ): Promise<Record<string, unknown> | null>;
}
