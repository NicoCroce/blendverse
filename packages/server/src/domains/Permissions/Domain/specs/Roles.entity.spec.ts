import { describe, expect, it } from 'vitest';
import { Roles } from '../Roles.entity';

describe('Roles entity', () => {
  const baseProps = {
    name: 'Full Admin',
    description: 'Full access role',
    permissions: ['users:read', 'users:write'],
    hierarchy: 1,
  };

  it('creates a role with all fields', () => {
    const role = Roles.create(baseProps);
    const v = role.values;

    expect(v.name).toBe('Full Admin');
    expect(v.description).toBe('Full access role');
    expect(v.permissions).toEqual(['users:read', 'users:write']);
    expect(v.hierarchy).toBe(1);
  });

  it('toJSON returns the same object as values', () => {
    const role = Roles.create(baseProps);
    expect(role.toJSON()).toEqual(role.values);
  });
});
