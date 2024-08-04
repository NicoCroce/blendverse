import { RouteObject } from 'react-router-dom';
import { UsersListPage } from './Pages/UsersList.page';
import { UsersNewPage } from './Pages/UsersNewPage';
import { UsersDetailSearch } from './Pages/UsersDetailSearch';

export const USERS_ROUTE = '/users';
export const USERS_NEW_ROUTE = `${USERS_ROUTE}/new`;
export const USERS_SEARCH_DETAIL_ROUTE = `${USERS_ROUTE}/searchDetail/:id`;

export const USERS_ROUTER: RouteObject[] = [
  {
    path: USERS_ROUTE,
    element: <UsersListPage />,
    children: [
      {
        path: USERS_SEARCH_DETAIL_ROUTE,
        element: <UsersDetailSearch />,
      },
    ],
  },
  {
    path: USERS_NEW_ROUTE,
    element: <UsersNewPage />,
  },
];
