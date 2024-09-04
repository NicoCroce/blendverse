import { productController } from '../../product.app';

const {
  getProducts,
  createProduct,
  deleteProduct,
  updateStock,
  getProduct,
  getStock,
  getSomeInfoProduct,
  sobrecarga,
  sobrecargaParams,
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
    sobrecargaParams,
  },
};
