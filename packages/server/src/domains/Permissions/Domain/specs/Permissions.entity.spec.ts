import { describe, expect, it } from 'vitest';
import { Permissions } from '../Permissions.entity';

describe('Permissions entity', () => {
  it('creates a permission with name and description', () => {
    const perm = Permissions.create({
      name: 'users:read',
      description: 'Can read users',
    });

    expect(perm.values.name).toBe('users:read');
    expect(perm.values.description).toBe('Can read users');
  });

  it('toJSON returns the same object as values', () => {
    const perm = Permissions.create({ name: 'x', description: 'y' });
    expect(perm.toJSON()).toEqual(perm.values);
  });
});
