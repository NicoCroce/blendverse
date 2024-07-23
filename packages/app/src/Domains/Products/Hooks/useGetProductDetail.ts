import { ProductsServices } from '../Services';

export const useGetProductDetail = (id: string | undefined) => {
  const cacheProductsList = ProductsServices.useUtils().getProducts;

  return (
    cacheProductsList.getData()?.find((product) => product.id === id) || null
  );
};
