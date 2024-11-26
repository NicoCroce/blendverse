import { createTRPCReact } from '@trpc/react-query';
import { TAuthRouter } from '@server/domains/Auth';
import { TPermissionsRouter } from '@server/domains/Permissions';

export const _authService = createTRPCReact<TAuthRouter>();
export const AuthService = _authService.auth;

export const _permissionsService = createTRPCReact<TPermissionsRouter>();
export const PermissionsService = _permissionsService.permissions;
