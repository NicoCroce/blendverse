import { router } from '@server/Infrastructure/trpc';
import { ProductRoutes } from './ProductRoutes';

const ProductsRouter = router(ProductRoutes);
export type TProductsRouter = typeof ProductsRouter;
