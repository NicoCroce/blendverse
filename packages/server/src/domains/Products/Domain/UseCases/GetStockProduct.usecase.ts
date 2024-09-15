import { IUseCase } from '@server/Application';
import { ProductsRepository } from '../Product.repository';
import { IGetStock } from '../../Product.interfaces';

export class GetStockProduct implements IUseCase<number | null> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(input: IGetStock): Promise<number | null> {
    return (
      (await this.productsRepository.getProduct(input))?.values.stock || null
    );
  }
}
