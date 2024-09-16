import { AppError, IUseCase } from '@server/Application';
import { ProductsRepository } from '../Product.repository';
import { IGetSomeInfoProduct } from '../Product.interfaces';

export class GetSomeInfoProduct
  implements IUseCase<Record<string, unknown> | null>
{
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    input: { id, params },
    requestContext,
  }: IGetSomeInfoProduct): Promise<Record<string, unknown> | null> {
    const product = await this.productsRepository.getProductInfo({
      id,
      params,
      requestContext,
    });

    if (!product) {
      throw new AppError('No se encontró el producto');
    }

    return product;
  }
}
