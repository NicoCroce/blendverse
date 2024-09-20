import { ProductsService } from '../Products.service';
import { useCacheProducts } from './useCacheProducts';

export const useDeleteProduct = () => {
  //**  Accedo a los datos almacenados en tRPC. */
  const cacheProductsList = useCacheProducts();

  return ProductsService.delete.useMutation({
    onMutate: async (id) => {
      cacheProductsList.cancel();
      const preservedState = cacheProductsList.getData();
      const newState = preservedState?.filter((product) => product.id !== id);

      cacheProductsList.setData(undefined, newState);
      return { preservedState };
    },
    onError: (_err, _variables, context) => {
      cacheProductsList.setData(undefined, context?.preservedState);
    },
    onSuccess: () => {
      cacheProductsList.invalidate();
    },
  });
};
