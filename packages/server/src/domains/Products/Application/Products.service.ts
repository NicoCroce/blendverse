import { executeUseCase, RequestContext } from '@server/Application';
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
import { delay } from '@server/utils/Utils';

export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly requestContext: RequestContext,
  ) {}

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
    console.log('🔵🔵🔵', this.requestContext.userId);
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

  async sobrecarga(input: string): Promise<{ body: string; userId: string }> {
    const userId = this.requestContext.userId;
    console.log(userId);
    await retornaProductos(input, userId);
    return await retornaProductos(input, userId);
  }
}

const retornaProductos = async (input: string, userId: string) => {
  await delay();

  return {
    body: input,
    userId: userId,
  };
};
