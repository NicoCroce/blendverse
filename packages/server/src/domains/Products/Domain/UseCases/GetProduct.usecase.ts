import { AppError, IUseCase } from '@server/Application';
import { ProductsRepository } from '../Products.repository';
import { Product } from '../Product.entity';

export class GetProduct implements IUseCase<Product | null> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(id: string): Promise<Product | null> {
    const product = await this.productsRepository.getProduct(id);
    if (!product) throw new AppError('Producto no encontrado', 404);
    return product;
  }
}
