import { _productsService } from '../ProductsService';

export const useCacheProducts = () =>
  _productsService.useUtils().products.getAll;
