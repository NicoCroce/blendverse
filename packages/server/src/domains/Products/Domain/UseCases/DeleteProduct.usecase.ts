import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';
import { IDeleteProduct } from '../Product.interfaces';

export class DeleteProduct implements IUseCase<Product> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    input: id,
    requestContext,
  }: IDeleteProduct): Promise<Product> {
    return this.productsRepository.deleteProduct({ id, requestContext });
  }
}
