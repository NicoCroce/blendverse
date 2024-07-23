import { createBrowserRouter } from 'react-router-dom';
import { App } from '@app/App';
import { USERS_ROUTER } from '@app/Domains/Users/UsersRoutes';
import { PRODUCTS_ROUTER } from '@app/Domains/Products/ProductsRoutes';

export const Router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [...USERS_ROUTER, ...PRODUCTS_ROUTER],
  },
]);
