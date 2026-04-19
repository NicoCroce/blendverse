import { useLocation } from 'react-router-dom';
import {
  AUTH_ROUTE,
  CHANGE_PASSWORD_PUBLIC,
  RENEW_PASSWORD,
  RESTORE_PASSWORD,
} from '@app/Domains/Auth/Auth.routes';

const publicPages = new Set([
  AUTH_ROUTE,
  RESTORE_PASSWORD,
  CHANGE_PASSWORD_PUBLIC,
  RENEW_PASSWORD,
]);

export const usePublicPages = () => {
  const { pathname } = useLocation();
  return publicPages.has(pathname);
};
