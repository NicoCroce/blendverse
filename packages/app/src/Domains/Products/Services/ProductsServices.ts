import { TProductsRouter } from '@server/domains/Products';
import { createTRPCReact } from '@trpc/react-query';

export const ProductsServices = createTRPCReact<TProductsRouter>();
