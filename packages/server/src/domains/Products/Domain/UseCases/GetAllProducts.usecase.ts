import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Products.repository';

export class GetAllProducts implements IUseCase<Product[]> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(): Promise<Product[]> {
    return await this.productsRepository.getProducts();
  }
}
