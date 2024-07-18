import { RouteObject } from 'react-router-dom';
import { UsersListPage } from './Pages/UsersList.page';

export const USERS_ROUTE = '/users';

export const USERS_ROUTER: RouteObject[] = [
  {
    path: USERS_ROUTE,
    element: <UsersListPage />,
  },
];
