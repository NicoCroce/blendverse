import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';
import { IGetProducts } from '../../Product.interfaces';

export class GetProducts implements IUseCase<Product[]> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(input: IGetProducts): Promise<Product[]> {
    return this.productsRepository.getProducts(input);
  }
}
