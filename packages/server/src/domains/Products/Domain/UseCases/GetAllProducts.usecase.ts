import { IUseCase, RequestContext } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Products.repository';

export class GetAllProducts implements IUseCase<Product[]> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(requestContext: RequestContext): Promise<Product[]> {
    console.log('use the context', requestContext);
    return this.productsRepository.getProducts();
  }
}
