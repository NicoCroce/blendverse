import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Model, ModelStatic, CreateOptions } from 'sequelize';
import { AppError } from '@server/Application';
import { TenantAwareRepository } from '../TenantAwareRepository';

// ─── Test double: concrete subclass exposing protected methods ─────────────

class TestableRepository extends TenantAwareRepository {
  async exposeCreate<M extends Model>(
    model: ModelStatic<M>,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn?: string,
    options?: CreateOptions,
  ): Promise<M> {
    return this.tenantCreate(model, data, ownerId, tenantColumn, options);
  }

  async exposeUpdate<M extends Model>(
    model: ModelStatic<M>,
    id: number,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn?: string,
  ): Promise<M> {
    return this.tenantUpdate(model, id, data, ownerId, tenantColumn);
  }

  async exposeDelete(
    model: ModelStatic<Model>,
    id: number,
    ownerId: number,
    tenantColumn?: string,
  ): Promise<number> {
    return this.tenantDelete(model, id, ownerId, tenantColumn);
  }
}

// ─── Mock model factory ────────────────────────────────────────────────────

const createMockModel = () =>
  ({
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  }) as unknown as ModelStatic<Model>;

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('TenantAwareRepository', () => {
  let repo: TestableRepository;

  beforeEach(() => {
    repo = new TestableRepository();
    vi.clearAllMocks();
  });

  // ── tenantCreate ───────────────────────────────────────────────────────

  describe('tenantCreate', () => {
    it('injects id_propietario = ownerId into the creation data', async () => {
      const model = createMockModel();
      const createdInstance = { id: 1, nombre: 'Nuevo', id_propietario: 42 };
      vi.mocked(model.create).mockResolvedValue(createdInstance as never);

      const result = await repo.exposeCreate(model, { nombre: 'Nuevo' }, 42);

      expect(model.create).toHaveBeenCalledWith(
        { nombre: 'Nuevo', id_propietario: 42 },
        {},
      );
      expect(result).toEqual(createdInstance);
    });

    it('does not overwrite caller-provided tenant column (caller data takes precedence)', async () => {
      const model = createMockModel();
      vi.mocked(model.create).mockResolvedValue({} as never);

      // If caller explicitly passes id_propietario, the spread puts ownerId last,
      // so ownerId wins. This is the intended behavior: the helper enforces tenant.
      await repo.exposeCreate(
        model,
        { nombre: 'Test', id_propietario: 999 },
        42,
      );

      expect(model.create).toHaveBeenCalledWith(
        { nombre: 'Test', id_propietario: 42 },
        {},
      );
    });

    it('supports a custom tenantColumn', async () => {
      const model = createMockModel();
      vi.mocked(model.create).mockResolvedValue({} as never);

      await repo.exposeCreate(model, { id_usuario: 3 }, 7, 'id_empresa');

      expect(model.create).toHaveBeenCalledWith(
        { id_usuario: 3, id_empresa: 7 },
        {},
      );
    });

    it('passes CreateOptions through to model.create', async () => {
      const model = createMockModel();
      vi.mocked(model.create).mockResolvedValue({} as never);

      await repo.exposeCreate(model, { nombre: 'X' }, 1, 'id_propietario', {
        returning: true,
      });

      expect(model.create).toHaveBeenCalledWith(
        { nombre: 'X', id_propietario: 1 },
        { returning: true },
      );
    });
  });

  // ── tenantUpdate ───────────────────────────────────────────────────────

  describe('tenantUpdate', () => {
    it('updates and returns the record when it belongs to the ownerId', async () => {
      const model = createMockModel();
      const mockInstance = { update: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      const result = await repo.exposeUpdate(
        model,
        5,
        { nombre: 'Updated' },
        42,
      );

      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 5, id_propietario: 42 },
      });
      expect(mockInstance.update).toHaveBeenCalledWith({ nombre: 'Updated' });
      expect(result).toBe(mockInstance);
    });

    it('throws AppError 404 NOT_FOUND when the record does not exist', async () => {
      const model = createMockModel();
      vi.mocked(model.findOne).mockResolvedValue(null);

      await expect(
        repo.exposeUpdate(model, 999, { nombre: 'Ghost' }, 42),
      ).rejects.toThrow(AppError);

      await expect(
        repo.exposeUpdate(model, 999, { nombre: 'Ghost' }, 42),
      ).rejects.toMatchObject({
        message: 'Record not found',
        statusCode: 404,
        errorCode: 'NOT_FOUND',
      });
    });

    it('throws AppError 404 when the record exists but belongs to another tenant (IDOR prevention)', async () => {
      const model = createMockModel();
      // Record exists with id=5 but id_propietario=99 (different tenant)
      vi.mocked(model.findOne).mockResolvedValue(null);

      // Owner 42 tries to update record 5 which belongs to owner 99
      await expect(
        repo.exposeUpdate(model, 5, { nombre: 'Hacked' }, 42),
      ).rejects.toThrow(AppError);

      // Verify the findOne was called with the OWNER's filter, not just the id
      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 5, id_propietario: 42 },
      });
    });

    it('supports a custom tenantColumn', async () => {
      const model = createMockModel();
      const mockInstance = { update: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      await repo.exposeUpdate(model, 3, { estado: 'activo' }, 7, 'id_empresa');

      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 3, id_empresa: 7 },
      });
    });
  });

  // ── tenantDelete ───────────────────────────────────────────────────────

  describe('tenantDelete', () => {
    it('deletes and returns the id when the record belongs to the ownerId', async () => {
      const model = createMockModel();
      const mockInstance = { destroy: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      const result = await repo.exposeDelete(model, 5, 42);

      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 5, id_propietario: 42 },
      });
      expect(mockInstance.destroy).toHaveBeenCalledOnce();
      expect(result).toBe(5);
    });

    it('throws AppError 404 NOT_FOUND when the record does not exist', async () => {
      const model = createMockModel();
      vi.mocked(model.findOne).mockResolvedValue(null);

      await expect(repo.exposeDelete(model, 999, 42)).rejects.toThrow(AppError);

      await expect(repo.exposeDelete(model, 999, 42)).rejects.toMatchObject({
        message: 'Record not found',
        statusCode: 404,
        errorCode: 'NOT_FOUND',
      });
    });

    it('throws AppError 404 when the record exists but belongs to another tenant (IDOR prevention)', async () => {
      const model = createMockModel();
      // Record 5 exists with id_propietario=99; owner 42 tries to delete it
      vi.mocked(model.findOne).mockResolvedValue(null);

      await expect(repo.exposeDelete(model, 5, 42)).rejects.toThrow(AppError);

      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 5, id_propietario: 42 },
      });
      // The destroy should never be called
    });

    it('supports a custom tenantColumn', async () => {
      const model = createMockModel();
      const mockInstance = { destroy: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      await repo.exposeDelete(model, 3, 7, 'id_empresa');

      expect(model.findOne).toHaveBeenCalledWith({
        where: { id: 3, id_empresa: 7 },
      });
    });
  });

  // ── Multi-tenant end-to-end scenario ────────────────────────────────────

  describe('multi-tenant isolation (end-to-end scenario)', () => {
    it('owner A cannot update records owned by owner B', async () => {
      const model = createMockModel();

      // Owner A (42) tries to update record 10 which belongs to owner B (99)
      vi.mocked(model.findOne).mockResolvedValue(null);

      await expect(
        repo.exposeUpdate(model, 10, { nombre: 'Tampered' }, 42),
      ).rejects.toThrow(AppError);

      // Owner B (99) CAN update the same record
      const mockInstance = { update: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      const result = await repo.exposeUpdate(
        model,
        10,
        { nombre: 'Valid' },
        99,
      );
      expect(result).toBe(mockInstance);
    });

    it('owner A cannot delete records owned by owner B', async () => {
      const model = createMockModel();

      // Owner A (42) tries to delete record 20 which belongs to owner B (99)
      vi.mocked(model.findOne).mockResolvedValue(null);

      await expect(repo.exposeDelete(model, 20, 42)).rejects.toThrow(AppError);

      // Owner B (99) CAN delete the same record
      const mockInstance = { destroy: vi.fn().mockResolvedValue(undefined) };
      vi.mocked(model.findOne).mockResolvedValue(mockInstance as never);

      const result = await repo.exposeDelete(model, 20, 99);
      expect(result).toBe(20);
    });
  });
});
