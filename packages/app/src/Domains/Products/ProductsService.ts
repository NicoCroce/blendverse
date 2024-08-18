import { TProductsRouter } from '@server/domains/Products';
import { createTRPCReact } from '@trpc/react-query';

export const ProductsService = createTRPCReact<TProductsRouter>();
