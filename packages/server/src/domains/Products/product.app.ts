import { asClass } from 'awilix';
import { ProductsRepositoryImplementation } from './Infrastructure';
import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';
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
import { GetSobrecarga } from './Domain/UseCases/GetSobrecarga';

container.register({
  productsRepository: asClass(ProductsRepositoryImplementation).scoped(),
  productsService: asClass(ProductsService).scoped(),
  productController: asClass(ProductController).scoped(),
  _createProduct: asClass(CreateProduct).scoped(),
  _deleteProduct: asClass(DeleteProduct).scoped(),
  _getAllProducts: asClass(GetAllProducts).scoped(),
  _updateStock: asClass(UpdateStock).scoped(),
  _getStock: asClass(GetStockProduct).scoped(),
  _getProduct: asClass(GetProduct).scoped(),
  _getInfo: asClass(GetSomeInfoProduct).scoped(),
  _getSobrecarga: asClass(GetSobrecarga).scoped(),
});

export const productController =
  container.resolve<ProductController>('productController');
