import { asClass, createContainer, InjectionMode } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productController: asClass(ProductController).scoped(),
});

export { container };
