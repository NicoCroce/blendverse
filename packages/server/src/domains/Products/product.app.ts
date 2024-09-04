import { asClass } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';
import { container } from '@server/utils/Container';
import { GetSobrecarga } from './Domain/UseCases/GetSobrecarga';

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productController: asClass(ProductController).scoped(),
  getSobrecarga: asClass(GetSobrecarga).scoped(),
});

export const productController =
  container.resolve<ProductController>('productController');
