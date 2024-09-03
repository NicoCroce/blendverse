import { asClass } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';
import { container } from '@server/utils/Container';

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productController: asClass(ProductController).scoped(),
});

export const productController =
  container.resolve<ProductController>('productController');
