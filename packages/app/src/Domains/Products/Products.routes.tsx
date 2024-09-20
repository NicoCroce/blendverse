import { Route } from 'react-router-dom';
import { NewProduct, ProductsDetailPage, ProductsListPage } from './Pages';

export const PRODUCTS_ROUTE = '/products';
export const PRODUCTS_DETAIL_ROUTE = `${PRODUCTS_ROUTE}/:id`;
export const PRODUCTS_NEW_ROUTE = `${PRODUCTS_ROUTE}/new-product`;

export const ProductsRouter = [
  <Route key="products" path={PRODUCTS_ROUTE} element={<ProductsListPage />} />,
  <Route
    key="products-detail"
    path={PRODUCTS_DETAIL_ROUTE}
    element={<ProductsDetailPage />}
  />,
  <Route
    key="products-new"
    path={PRODUCTS_NEW_ROUTE}
    element={<NewProduct />}
  />,
];
