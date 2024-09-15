import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Product.repository';
import { ICreateProduct } from '../../Product.interfaces';

export class CreateProduct implements IUseCase<Product> {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute({
    name,
    description,
    stock,
    price,
    requestContext,
  }: ICreateProduct): Promise<Product> {
    const product = new Product('', name, description, stock, price);
    return this.productsRepository.createProduct({
      product,
      requestContext,
    });
  }
}
