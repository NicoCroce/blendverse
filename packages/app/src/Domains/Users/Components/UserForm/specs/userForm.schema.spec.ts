import { describe, it, expect } from 'vitest';
import { formSchemaDefinition } from '../userForm.schema';

const validBase = {
  name: 'Alice',
  mail: 'alice@test.com',
  password: 'password123',
  rePassword: 'password123',
};

describe('formSchemaDefinition — new user (editData = null)', () => {
  const schema = formSchemaDefinition(null);

  it('passes with valid input', () => {
    expect(schema.safeParse(validBase).success).toBe(true);
  });

  it('fails when name is shorter than 2 chars', () => {
    expect(schema.safeParse({ ...validBase, name: 'A' }).success).toBe(false);
  });

  it('fails when email is invalid', () => {
    expect(
      schema.safeParse({ ...validBase, mail: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('fails when email is empty', () => {
    expect(schema.safeParse({ ...validBase, mail: '' }).success).toBe(false);
  });

  it('fails when password is shorter than 8 chars', () => {
    expect(
      schema.safeParse({ ...validBase, password: 'short', rePassword: 'short' })
        .success,
    ).toBe(false);
  });

  it('fails when passwords do not match', () => {
    const result = schema.safeParse({ ...validBase, rePassword: 'different!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.flatMap((e) => e.path);
      expect(paths).toContain('rePassword');
    }
  });

  it('accepts optional role and profile fields', () => {
    expect(
      schema.safeParse({ ...validBase, role: 'admin', profile: 'basic' })
        .success,
    ).toBe(true);
  });

  it('accepts optional street field', () => {
    expect(
      schema.safeParse({ ...validBase, street: '123 Main St' }).success,
    ).toBe(true);
  });
});

describe('formSchemaDefinition — edit user (editData provided)', () => {
  const mockUser = { id: 1, name: 'Alice', mail: 'alice@test.com' };
  const schema = formSchemaDefinition(mockUser as never);

  it('passes with empty passwords when editing', () => {
    expect(
      schema.safeParse({
        name: 'Alice',
        mail: 'alice@test.com',
        password: '',
        rePassword: '',
      }).success,
    ).toBe(true);
  });

  it('does NOT require passwords to match when editing', () => {
    expect(
      schema.safeParse({
        name: 'Alice',
        mail: 'alice@test.com',
        password: 'abc',
        rePassword: 'xyz',
      }).success,
    ).toBe(true);
  });

  it('still fails with invalid email when editing', () => {
    expect(
      schema.safeParse({
        name: 'Alice',
        mail: 'bad-email',
        password: '',
        rePassword: '',
      }).success,
    ).toBe(false);
  });
});
