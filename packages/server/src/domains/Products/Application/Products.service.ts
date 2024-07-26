import { executeUseCase } from '@server/Application';
import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProduct,
  GetStockProduct,
  ICreateProductInput,
  IUpdateStockInput,
  Product,
  ProductsRepository,
  UpdateStock,
} from '../Domain';

export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async createProduct(
    name: string,
    description: string,
    stock: number,
  ): Promise<Product> {
    const _createProduct = new CreateProduct(this.productsRepository);
    return await executeUseCase<Product, ICreateProductInput>(_createProduct, {
      name,
      description,
      stock,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    const _deleteProduct = new DeleteProduct(this.productsRepository);
    return await executeUseCase<Product, string>(_deleteProduct, id);
  }
  async getllProducts(): Promise<Product[]> {
    const _getAllProducts = new GetAllProducts(this.productsRepository);
    return await executeUseCase<Product[]>(_getAllProducts);
  }

  async updateStock({ id, stock }: IUpdateStockInput) {
    const _updateStock = new UpdateStock(this.productsRepository);
    return await executeUseCase(_updateStock, { id, stock });
  }

  async getStock(id: string): Promise<number | null> {
    const _getStock = new GetStockProduct(this.productsRepository);
    return await executeUseCase(_getStock, id);
  }

  async getProduct(id: string): Promise<Product | null> {
    const _getProduct = new GetProduct(this.productsRepository);
    return await executeUseCase(_getProduct, id);
  }
}
