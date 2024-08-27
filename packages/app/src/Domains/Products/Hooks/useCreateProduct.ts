import { ProductsService } from '../ProductsService';
import { useCacheProducts } from './useCacheProducts';

export const useCreateProduct = () => {
  const cacheProductsList = useCacheProducts();

  return ProductsService.create.useMutation({
    onMutate: async ({ name, stock, description, price }) => {
      cacheProductsList.cancel();
      const preservedState = cacheProductsList.getData();
      type TData = typeof preservedState;

      const setState = (state: TData): TData => [
        ...(state || []),
        {
          id: String(state?.length),
          name,
          stock,
          description,
          price,
        },
      ];

      cacheProductsList.setData(undefined, setState);
      return { preservedState };
    },
    onError: (_err, _variables, context) => {
      cacheProductsList.setData(undefined, context?.preservedState);
    },
    onSuccess: () => cacheProductsList.invalidate(),
  });
};
