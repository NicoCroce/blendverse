import { ProductsService } from './Application';
import { ProductController } from './Infrastructure/Controllers/Product.controller';
import { ProductsRepositoryImplementation } from './Infrastructure/ProductsRepository.implementation.localDB';

const productRepository = new ProductsRepositoryImplementation();
const productsService = new ProductsService(productRepository);
export const productController = new ProductController(productsService);
