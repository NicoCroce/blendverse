import { container } from '../../product.app';
import { ProductController } from '../Controllers/Product.controller';

const productController =
  container.resolve<ProductController>('productController');

const {
  getProducts,
  createProduct,
  deleteProduct,
  updateStock,
  getProduct,
  getStock,
  getSomeInfoProduct,
  sobrecarga,
} = productController;

export const ProductRoutes = {
  products: {
    getAll: getProducts,
    create: createProduct,
    delete: deleteProduct,
    updateStock: updateStock,
    get: getProduct,
    getStock: getStock,
    getInfo: getSomeInfoProduct,
    sobrecarga: sobrecarga,
  },
};
