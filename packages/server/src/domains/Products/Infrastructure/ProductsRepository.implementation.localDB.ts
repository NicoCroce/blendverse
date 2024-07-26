import { Product, ProductsRepository } from '../Domain';
import { ProductsLocalDatabase } from './Database/ProductsLocal.database';

export class ProductsRepositoryImplementation implements ProductsRepository {
  private Db = new ProductsLocalDatabase();

  async getProducts(): Promise<Product[]> {
    const products = await this.Db.getProductsList();
    return products.map(
      ({ id, name, description, stock }) =>
        new Product(id, name, description, stock),
    );
  }

  async create(product: Product): Promise<Product> {
    const { id, name, description, stock } = await this.Db.addProduct(
      product.values,
    );
    return new Product(id, name, description, stock);
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await this.Db.updateStock(id, stock);

    if (!product) throw new Error(`Product with id ${id} does not exist`);

    const { name, description } = product;
    return new Product(id, name, description, stock);
  }

  async delete(id: string): Promise<Product> {
    const { name, description, stock } = await this.Db.deleteProduct(id);
    return new Product(id, name, description, stock);
  }

  async getProduct(id: string): Promise<Product | null> {
    const product = await this.Db.getProduct(id);
    if (!product) return null;
    const { name, description, stock } = product;
    return new Product(id, name, description, stock);
  }
}
