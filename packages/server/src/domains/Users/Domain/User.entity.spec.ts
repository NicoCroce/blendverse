import { describe, expect, it } from 'vitest';
import { User } from './User.entity';

describe('User entity', () => {
  it('creates a user with required fields', () => {
    const user = User.create({ mail: 'test@example.com', name: 'Test User' });
    const v = user.values;

    expect(v.mail).toBe('test@example.com');
    expect(v.name).toBe('Test User');
  });

  it('optional fields are undefined when not provided', () => {
    const user = User.create({ mail: 'test@example.com', name: 'Test' });

    expect(user.values.id).toBeUndefined();
    expect(user.values.renewPassword).toBe(false);
    expect(user.values.userImage).toBeUndefined();
    expect(user.values.ownerId).toBeUndefined();
    expect(user.values.companyLogo).toBeUndefined();
    expect(user.values.companyName).toBeUndefined();
    expect(user.values.rol).toBeUndefined();
    expect(user.password).toBeNull();
  });

  it('creates a user with all optional fields', () => {
    const user = User.create({
      id: 5,
      mail: 'admin@example.com',
      name: 'Admin',
      password: 'hashedPassword123',
      renewPassword: true,
      userImage: 'img.png',
      ownerId: 99,
      companyLogo: 'logo.png',
      companyName: 'Acme',
      rol: 'Full Admin',
    });

    const v = user.values;
    expect(v.id).toBe(5);
    expect(v.renewPassword).toBe(true);
    expect(v.userImage).toBe('img.png');
    expect(v.ownerId).toBe(99);
    expect(v.companyLogo).toBe('logo.png');
    expect(v.companyName).toBe('Acme');
    expect(v.rol).toBe('Full Admin');
  });

  it('exposes id and mail getters directly', () => {
    const user = User.create({
      id: 3,
      mail: 'x@x.com',
      name: 'Xuser',
      password: 'passwordOK1',
    });
    expect(user.id).toBe(3);
    expect(user.mail).toBe('x@x.com');
    expect(user.password).toBe('passwordOK1');
  });

  it('toJSON returns the same object as values', () => {
    const user = User.create({ id: 1, mail: 'a@b.com', name: 'ABuser' });
    expect(user.toJSON()).toEqual(user.values);
  });
});
