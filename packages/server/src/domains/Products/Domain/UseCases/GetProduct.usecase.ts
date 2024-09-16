import { AppError, IUseCase } from '@server/Application';
import { ProductsRepository } from '../Product.repository';
import { Product } from '../Product.entity';
import { IGetProduct } from '../Product.interfaces';

export class GetProduct implements IUseCase<Product | null> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    input: id,
    requestContext,
  }: IGetProduct): Promise<Product | null> {
    const product = await this.productsRepository.getProduct({
      id,
      requestContext,
    });
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
  }
}
