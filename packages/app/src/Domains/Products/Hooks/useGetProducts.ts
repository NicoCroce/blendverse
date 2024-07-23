import { ProductsServices } from '../Services';

export const useGetProducts = () => ProductsServices.getProducts.useQuery();
