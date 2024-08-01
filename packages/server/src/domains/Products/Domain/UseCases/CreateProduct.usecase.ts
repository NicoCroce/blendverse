import { IUseCase } from '@server/Application';
import { Product } from '../Product.entity';
import { ProductsRepository } from '../Products.repository';

export interface ICreateProductInput {
  name: string;
  description: string;
  stock: number;
  price: number;
}

export class CreateProduct implements IUseCase<Product> {
  constructor(private readonly productRepository: ProductsRepository) {}

  async execute({
    name,
    description,
    stock,
    price,
  }: ICreateProductInput): Promise<Product> {
    const newProduct = new Product('', name, description, stock, price);
    return await this.productRepository.create(newProduct);
  }
}
