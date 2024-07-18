import { productController } from '../../product.app';

export const ProductRoutes = {
  list: productController.getProducts(),
  create: productController.createProduct(),
  delete: productController.deleteProduct(),
  updateStock: productController.updateStock(),
};
