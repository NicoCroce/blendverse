import { ProductsServices } from '../Services';

export const useCreateProduct = () => {
  const cacheProductsList = ProductsServices.useUtils().getProducts;

  return ProductsServices.createProduct.useMutation({
    onMutate: async ({ name, stock, description }) => {
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
