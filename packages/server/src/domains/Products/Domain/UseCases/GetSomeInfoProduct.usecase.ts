import { AppError, IUseCase } from '@server/Application';
import { ProductsRepository } from '../Products.repository';

export interface IGetSomeInfoProductInput {
  productId: string;
  params: string | string[];
}

export class GetSomeInfoProduct
  implements IUseCase<Record<string, unknown> | null>
{
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    productId,
    params,
  }: IGetSomeInfoProductInput): Promise<Record<string, unknown> | null> {
    const product = await this.productsRepository.getProductInfo(
      productId,
      params,
    );

    if (!product) {
      throw new AppError('No se encontró el producto');
    }

    return product;
  }
}
