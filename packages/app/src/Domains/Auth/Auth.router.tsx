import { Route } from 'react-router-dom';
import { ChangePasswordPublicPage, LoginPage } from './Pages';
import {
  AUTH_ROUTE,
  CHANGE_PASSWORD_PUBLIC,
  RENEW_PASSWORD,
  RESTORE_PASSWORD,
} from './Auth.routes';
import { RestorePasswordPage } from './Pages/RestorePassword.page';

export const AuthRouter = [
  <Route key="auth" path={AUTH_ROUTE} element={<LoginPage />} />,
  <Route
    key="restore-password"
    path={RESTORE_PASSWORD}
    element={<RestorePasswordPage />}
  />,
  <Route
    key="change-password"
    path={CHANGE_PASSWORD_PUBLIC}
    element={<ChangePasswordPublicPage />}
  />,
  <Route
    key="change-password-alias"
    path={RENEW_PASSWORD}
    element={<ChangePasswordPublicPage />}
  />,
];
