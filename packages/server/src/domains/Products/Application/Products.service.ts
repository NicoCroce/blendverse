import { executeUseCase, RequestContext } from '@server/Application';
import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProduct,
  GetSomeInfoProduct,
  GetStockProduct,
  IGetSomeInfoProductInput,
  IUpdateStockInput,
  Product,
  UpdateStock,
} from '../Domain';

export class ProductsService {
  constructor(
    private readonly requestContext: RequestContext,
    private readonly _createProduct: CreateProduct,
    private readonly _deleteProduct: DeleteProduct,
    private readonly _getAllProducts: GetAllProducts,
    private readonly _updateStock: UpdateStock,
    private readonly _getStock: GetStockProduct,
    private readonly _getProduct: GetProduct,
    private readonly _getInfo: GetSomeInfoProduct,
  ) {}

  async createProduct(
    name: string,
    description: string,
    stock: number,
    price: number,
  ): Promise<Product> {
    return executeUseCase(
      this._createProduct,
      {
        name,
        description,
        stock,
        price,
      },
      this.requestContext.values,
    );
  }

  async deleteProduct(id: string): Promise<Product> {
    return executeUseCase(this._deleteProduct, id, this.requestContext.values);
  }

  async getAllProducts(): Promise<Product[]> {
    return executeUseCase(this._getAllProducts, this.requestContext.values);
  }

  async updateStock({ id, stock }: IUpdateStockInput) {
    return await executeUseCase(
      this._updateStock,
      { id, stock },
      this.requestContext.values,
    );
  }

  async getStock(id: string): Promise<number | null> {
    return await executeUseCase(this._getStock, id, this.requestContext.values);
  }

  async getProduct(id: string): Promise<Product | null> {
    return await executeUseCase(
      this._getProduct,
      id,
      this.requestContext.values,
    );
  }

  async getSomeInfoProduct(
    input: IGetSomeInfoProductInput,
  ): Promise<Record<string, unknown> | null> {
    return await executeUseCase(
      this._getInfo,
      input,
      this.requestContext.values,
    );
  }
}
