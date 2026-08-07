import { describe, expect, it } from 'vitest';
import { ADMIN_ROLES, isAdminRole } from '../Roles.constants';

describe('Roles.constants', () => {
  describe('ADMIN_ROLES', () => {
    it('includes the real admin denominations from the roles table', () => {
      expect(ADMIN_ROLES).toContain('Administrador');
      expect(ADMIN_ROLES).toContain('Full Admin');
    });

    it('does not include non-admin roles', () => {
      expect(ADMIN_ROLES).not.toContain('Default');
      expect(ADMIN_ROLES).not.toContain('admin');
    });
  });

  describe('isAdminRole', () => {
    it('returns true for Administrador', () => {
      expect(isAdminRole('Administrador')).toBe(true);
    });

    it('returns true for Full Admin', () => {
      expect(isAdminRole('Full Admin')).toBe(true);
    });

    it('returns false for a non-admin role', () => {
      expect(isAdminRole('Default')).toBe(false);
    });

    it('returns false for null, empty string and undefined', () => {
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole('')).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
    });
  });
});
