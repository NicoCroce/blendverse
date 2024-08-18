import { ProductsService } from '../ProductsService';

export const useGetProducts = () => ProductsService.getProducts.useQuery();
