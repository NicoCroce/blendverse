import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Products.repository';

export class DeleteProduct implements IUseCase<Product> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string): Promise<Product> {
    return await this.productsRepository.delete(id);
  }
}
