import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';
import { IUpdateStock } from '../Product.interfaces';

export class UpdateStock implements IUseCase<Product> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    input: { id, stock },
    requestContext,
  }: IUpdateStock): Promise<Product> {
    return this.productsRepository.updateStock({ id, stock, requestContext });
  }
}
