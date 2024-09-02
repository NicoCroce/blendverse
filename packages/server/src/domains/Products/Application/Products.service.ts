import { executeUseCase } from '@server/Application';
import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProduct,
  GetSomeInfoProduct,
  GetStockProduct,
  ICreateProductInput,
  IGetSomeInfoProductInput,
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
    price: number,
  ): Promise<Product> {
    const _createProduct = new CreateProduct(this.productsRepository);
    return await executeUseCase<Product, ICreateProductInput>(_createProduct, {
      name,
      description,
      stock,
      price,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    const _deleteProduct = new DeleteProduct(this.productsRepository);
    return await executeUseCase<Product, string>(_deleteProduct, id);
  }
  async getAllProducts(): Promise<Product[]> {
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

  async getSomeInfoProduct(
    input: IGetSomeInfoProductInput,
  ): Promise<Record<string, unknown> | null> {
    const _getInfo = new GetSomeInfoProduct(this.productsRepository);
    return await executeUseCase(_getInfo, input);
  }
}
