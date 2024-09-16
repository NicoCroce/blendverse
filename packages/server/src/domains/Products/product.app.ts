import { asClass } from 'awilix';
import { ProductsService } from './Application';
import {
  ProductsController,
  ProductsRepositoryImplementation,
} from './Infrastructure';
import { container } from '@server/utils/Container';
import {
  CreateProduct,
  DeleteProduct,
  GetProducts,
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
  _getAllProducts: asClass(GetProducts),
  _updateStock: asClass(UpdateStock),
  _getStock: asClass(GetStockProduct),
  _getProduct: asClass(GetProduct),
  _getInfo: asClass(GetSomeInfoProduct),
});

export const productsController =
  container.resolve<ProductsController>('productsController');
