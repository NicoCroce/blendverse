import {
  createContext,
  router,
  trpcExpress,
} from '@server/Infrastructure/trpc';
import { ProductRoutes } from './ProductRoutes';
import { Express } from 'express';
import { PRODUCTS_URL_PATH } from '../../products.config';

const ProductsRouter = router(ProductRoutes);

const InstanceProductsRouter = (app: Express) => {
  app.use(
    PRODUCTS_URL_PATH,
    trpcExpress.createExpressMiddleware({
      router: ProductsRouter,
      createContext,
    }),
  );
};

export type TProductsRouter = typeof ProductsRouter;
export { InstanceProductsRouter };
