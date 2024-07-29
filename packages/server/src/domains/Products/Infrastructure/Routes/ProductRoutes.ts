import { productController } from '../../product.app';

export const ProductRoutes = {
  getProducts: productController.getProducts(),
  createProduct: productController.createProduct(),
  deleteProduct: productController.deleteProduct(),
  updateStock: productController.updateStock(),
  getProduct: productController.getProduct(),
  getStock: productController.getStock(),
  getInfo: productController.getSomeInfoProduct(),
};
