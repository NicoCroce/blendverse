import { RouteObject } from 'react-router-dom';
import { ProductsListPage } from './Pages';
import { ProductsDetailPage } from './Pages/ProductsDetail.page';

export const PRODUCTS_ROUTE = '/products';
export const PRODUCTS_DETAIL_ROUTE = `${PRODUCTS_ROUTE}/:id`;

export const PRODUCTS_ROUTER: RouteObject[] = [
  {
    path: PRODUCTS_ROUTE,
    element: <ProductsListPage />,
  },
  {
    path: PRODUCTS_DETAIL_ROUTE,
    element: <ProductsDetailPage />,
  },
];
