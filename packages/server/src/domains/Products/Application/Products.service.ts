import { executeUseCase } from '@server/Application';
import {
  CreateProduct,
  DeleteProduct,
  GetProducts,
  GetProduct,
  GetSomeInfoProduct,
  GetStockProduct,
  Product,
  UpdateStock,
} from '../Domain';
import {
  ICreateProduct,
  IDeleteProduct,
  IGetProduct,
  IGetProducts,
  IGetSomeInfoProduct,
  IGetStock,
  IUpdateStock,
} from '../Domain/Product.interfaces';

export class ProductsService {
  constructor(
    private readonly _createProduct: CreateProduct,
    private readonly _deleteProduct: DeleteProduct,
    private readonly _getAllProducts: GetProducts,
    private readonly _updateStock: UpdateStock,
    private readonly _getStock: GetStockProduct,
    private readonly _getProduct: GetProduct,
    private readonly _getInfo: GetSomeInfoProduct,
  ) {}

  async getProducts({ requestContext }: IGetProducts): Promise<Product[]> {
    return executeUseCase({
      useCase: this._getAllProducts,
      requestContext: requestContext,
    });
  }

  async createProduct({
    input,
    requestContext,
  }: ICreateProduct): Promise<Product> {
    return executeUseCase({
      useCase: this._createProduct,
      input,
      requestContext,
    });
  }

  async deleteProduct({
    input,
    requestContext,
  }: IDeleteProduct): Promise<Product> {
    return executeUseCase({
      useCase: this._deleteProduct,
      input,
      requestContext,
    });
  }

  async updateStock({ input, requestContext }: IUpdateStock) {
    return executeUseCase({
      useCase: this._updateStock,
      input,
      requestContext,
    });
  }

  async getStock({ input, requestContext }: IGetStock): Promise<number | null> {
    return executeUseCase({ useCase: this._getStock, input, requestContext });
  }

  async getProduct({
    input,
    requestContext,
  }: IGetProduct): Promise<Product | null> {
    return executeUseCase({ useCase: this._getProduct, input, requestContext });
  }

  async getSomeInfoProduct({
    input,
    requestContext,
  }: IGetSomeInfoProduct): Promise<Record<string, unknown> | null> {
    return executeUseCase({ useCase: this._getInfo, input, requestContext });
  }
}
