import { Route } from 'react-router-dom';
import { ProductsListPage } from './Pages';
import { ProductsDetailPage } from './Pages/ProductsDetail.page';

export const PRODUCTS_ROUTE = '/products';
export const PRODUCTS_DETAIL_ROUTE = `${PRODUCTS_ROUTE}/:id`;

export const ProductsRouter = [
  <Route key="products" path={PRODUCTS_ROUTE} element={<ProductsListPage />} />,
  <Route
    key="products-detail"
    path={PRODUCTS_DETAIL_ROUTE}
    element={<ProductsDetailPage />}
  />,
];
