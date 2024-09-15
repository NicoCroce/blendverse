import { AppError, IUseCase } from '@server/Application';
import { ProductsRepository } from '../Product.repository';
import { IGetInfo } from '../../Product.interfaces';

export class GetSomeInfoProduct
  implements IUseCase<Record<string, unknown> | null>
{
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(input: IGetInfo): Promise<Record<string, unknown> | null> {
    const product = await this.productsRepository.getProductInfo(input);

    if (!product) {
      throw new AppError('No se encontró el producto');
    }

    return product;
  }
}
