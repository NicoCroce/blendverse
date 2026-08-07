/**
 * Denominaciones de rol que tienen privilegios administrativos.
 * Fuente de verdad: tabla `roles` (denominaciones reales en la BD).
 */
export const ADMIN_ROLES: ReadonlySet<string> = new Set([
  'Administrador',
  'Full Admin',
]);

/**
 * Determina si una denominación de rol corresponde a un administrador.
 */
export const isAdminRole = (roleName?: string | null): boolean =>
  !!roleName && ADMIN_ROLES.has(roleName);
