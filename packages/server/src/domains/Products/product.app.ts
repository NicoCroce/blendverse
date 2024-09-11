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
  productsRepository: asClass(ProductsRepositoryImplementation),
  productsService: asClass(ProductsService),
  productsController: asClass(ProductsController),
  _createProduct: asClass(CreateProduct),
  _deleteProduct: asClass(DeleteProduct),
  _getAllProducts: asClass(GetAllProducts),
  _updateStock: asClass(UpdateStock),
  _getStock: asClass(GetStockProduct),
  _getProduct: asClass(GetProduct),
  _getInfo: asClass(GetSomeInfoProduct),
});

export const productsController =
  container.resolve<ProductsController>('productsController');
