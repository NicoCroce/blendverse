import { _productsService } from '../Products.service';

export const useCacheProducts = () =>
  _productsService.useUtils().products.getAll;
