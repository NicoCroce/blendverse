import { TProductsRouter } from '@server/domains/Products';
import { createTRPCReact } from '@trpc/react-query';

export const _productsService = createTRPCReact<TProductsRouter>();
export const ProductsService = _productsService.products;
