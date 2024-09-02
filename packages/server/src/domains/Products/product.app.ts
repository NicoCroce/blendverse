import { asClass } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';
import { container } from '@server/Infrastructure/trpc/TrpcInstance';

export class Data {
  private userId: string | number | null;

  constructor() {
    this.userId = null;
  }

  setUserId(id: string | number | null) {
    this.userId = id;
  }

  get userIdSored() {
    return this.userId;
  }
}

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productController: asClass(ProductController).scoped(),
  userId: asClass(Data).scoped(),
});

console.log('🔴🔴🔴🔴 Muestra el container: => ', container);

export { container };
