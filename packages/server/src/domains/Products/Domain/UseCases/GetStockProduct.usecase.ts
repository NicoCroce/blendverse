import { IUseCase } from '@server/Application';
import { ProductsRepository } from '../Product.repository';

export class GetStockProduct implements IUseCase<number | null> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string): Promise<number | null> {
    return (await this.productsRepository.getProduct(id))?.values.stock || null;
  }
}
