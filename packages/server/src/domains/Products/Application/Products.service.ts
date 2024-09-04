import {
  executeUseCase,
  RequestContext,
  TRequestContext,
} from '@server/Application';
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
import { logReqId } from '@server/utils/logReqId';
import { GetSobrecarga } from '../Domain/UseCases/GetSobrecarga';
import { GetSobrecargaParams } from '../Domain/UseCases/GetSobrecargaParams';

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

  async sobrecargaClean(input: string): Promise<{
    requestId: string;
    userId: string;
    input: string;
  }> {
    const requestContext = this.requestContext.values;
    const _sobrecarga = new GetSobrecarga(
      this.productsRepository,
      requestContext,
    );
    await delay(1000);
    return await executeUseCase(_sobrecarga, input);
  }

  async sobrecarga(input: string): Promise<{
    requestId: string;
    userId: string;
    input: string;
  }> {
    const requestContext = this.requestContext.values;
    const userId = this.requestContext.values.userId;
    const requestId = this.requestContext.values.requestId;
    const _sobrecarga = new GetSobrecarga(
      this.productsRepository,
      requestContext,
    );
    await delay(1000);
    logReqId('Service', { requestId, userId, input });
    return await executeUseCase(_sobrecarga, input);
  }

  async sobrecargaParams(
    input: string,
    requestContext: TRequestContext,
  ): Promise<{
    requestId: string;
    userId: string;
    input: string;
  }> {
    await delay(1000);
    const _sobrecarga = new GetSobrecargaParams(this.productsRepository);
    logReqId('Service', {
      requestId: requestContext.requestId,
      userId: requestContext.userId,
      input,
    });
    return await executeUseCase(_sobrecarga, {
      requestId: requestContext.requestId,
      userId: requestContext.userId,
      input,
    });
  }
}
