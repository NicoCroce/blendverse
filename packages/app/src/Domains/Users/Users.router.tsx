import { Route } from 'react-router-dom';
import {
  ChangePasswordPage,
  UsersListPage,
  UsersNewPage,
  UserUpdatePage,
} from './Pages';
import { UsersDetailSearch } from './Components';
import {
  USERS_ROUTE,
  USERS_SEARCH_DETAIL_ROUTE,
  USERS_NEW_ROUTE,
  USERS_UPDATE,
  USERS_CHANGE_PASSWORD,
} from './Users.routes';

export const UsersRouter = [
  <Route key="users" path={USERS_ROUTE} element={<UsersListPage />}>
    <Route
      key="users-detail"
      path={USERS_SEARCH_DETAIL_ROUTE}
      element={<UsersDetailSearch />}
    />
  </Route>,
  <Route key="users-new" path={USERS_NEW_ROUTE} element={<UsersNewPage />} />,
  <Route key="user-update" path={USERS_UPDATE} element={<UserUpdatePage />} />,
  <Route
    key="change-password"
    path={USERS_CHANGE_PASSWORD}
    element={<ChangePasswordPage />}
  />,
];
