import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';

export interface IUpdateStockInput {
  id: string;
  stock: number;
}

export class UpdateStock implements IUseCase<Product> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({ id, stock }: IUpdateStockInput): Promise<Product> {
    return await this.productsRepository.updateStock(id, stock);
  }
}
