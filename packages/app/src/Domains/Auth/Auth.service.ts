import { createTRPCReact } from '@trpc/react-query';
import { TAuthRouter } from '@server/domains/Auth';

export const _authService = createTRPCReact<TAuthRouter>();
export const AuthService = _authService.auth;
