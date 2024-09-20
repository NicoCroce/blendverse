import { ProductsService } from '../Products.service';

export const useGetProducts = () => ProductsService.getAll.useQuery();
