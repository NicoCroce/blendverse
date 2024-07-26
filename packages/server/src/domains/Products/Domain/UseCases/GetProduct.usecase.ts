import { IUseCase } from '@server/Application';
import { ProductsRepository } from '../Products.repository';
import { Product } from '../Product.entity';

export class GetProduct implements IUseCase<Product | null> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string): Promise<Product | null> {
    return (await this.productsRepository.getProduct(id)) || null;
  }
}
