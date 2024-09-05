import { asClass } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductsController } from './Infrastructure/Controllers/Product.controller';
import { container } from '@server/utils/Container';
import {
  CreateProduct,
  DeleteProduct,
  GetAllProducts,
  GetProduct,
  GetSomeInfoProduct,
  GetStockProduct,
  UpdateStock,
} from './Domain';

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productsController: asClass(ProductsController).scoped(),
  _createProduct: asClass(CreateProduct).scoped(),
  _deleteProduct: asClass(DeleteProduct).scoped(),
  _getAllProducts: asClass(GetAllProducts).scoped(),
  _updateStock: asClass(UpdateStock).scoped(),
  _getStock: asClass(GetStockProduct).scoped(),
  _getProduct: asClass(GetProduct).scoped(),
  _getInfo: asClass(GetSomeInfoProduct).scoped(),
});

export const productsController =
  container.resolve<ProductsController>('productsController');
