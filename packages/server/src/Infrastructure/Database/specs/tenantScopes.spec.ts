import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Model, ModelStatic } from 'sequelize';
import { addTenantScope } from '../tenantScopes';

const createMockModel = () =>
  ({
    addScope: vi.fn(),
  }) as unknown as ModelStatic<Model>;

describe('addTenantScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a dynamic scope named "tenant" with id_propietario = ownerId', () => {
    const model = createMockModel();

    addTenantScope(model, 42);

    expect(model.addScope).toHaveBeenCalledOnce();
    expect(model.addScope).toHaveBeenCalledWith(
      'tenant',
      { where: { id_propietario: 42 } },
      { override: true },
    );
  });

  it('uses a custom tenantColumn when provided', () => {
    const model = createMockModel();

    addTenantScope(model, 7, 'id_empresa');

    expect(model.addScope).toHaveBeenCalledWith(
      'tenant',
      { where: { id_empresa: 7 } },
      { override: true },
    );
  });

  it('overrides any existing "tenant" scope (defence-in-depth safety net)', () => {
    const model = createMockModel();

    addTenantScope(model, 10);
    addTenantScope(model, 20);

    expect(model.addScope).toHaveBeenCalledTimes(2);
    expect(model.addScope).toHaveBeenLastCalledWith(
      'tenant',
      { where: { id_propietario: 20 } },
      { override: true },
    );
  });

  it('applies the scope to the correct model instance (not a shared state)', () => {
    const modelA = createMockModel();
    const modelB = createMockModel();

    addTenantScope(modelA, 1);
    addTenantScope(modelB, 2);

    expect(modelA.addScope).toHaveBeenCalledWith(
      'tenant',
      { where: { id_propietario: 1 } },
      { override: true },
    );
    expect(modelB.addScope).toHaveBeenCalledWith(
      'tenant',
      { where: { id_propietario: 2 } },
      { override: true },
    );
  });
});
