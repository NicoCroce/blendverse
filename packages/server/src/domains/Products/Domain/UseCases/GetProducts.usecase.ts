import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';
import { IGetProducts } from '../Product.interfaces';

export class GetProducts implements IUseCase<Product[]> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(requestContext: IGetProducts): Promise<Product[]> {
    return this.productsRepository.getProducts(requestContext);
  }
}
