import { ProductsService } from '../ProductsService';

export const useGetProducts = () => ProductsService.getAll.useQuery();
