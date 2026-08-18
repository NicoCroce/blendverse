import { Route } from 'react-router-dom';
import { ChangePasswordPage } from './Pages';
import { USERS_CHANGE_PASSWORD } from './Users.routes';

export const UsersRouter = [
  <Route
    key="change-password"
    path={USERS_CHANGE_PASSWORD}
    element={<ChangePasswordPage />}
  />,
];
