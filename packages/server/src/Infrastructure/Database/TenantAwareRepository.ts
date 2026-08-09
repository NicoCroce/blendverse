import { Model, ModelStatic, FindOptions, CreateOptions } from 'sequelize';
import { AppError } from '@server/Application';

/**
 * Abstract base class for multi-tenant repositories.
 *
 * Provides guarded write helpers (`tenantCreate`, `tenantUpdate`, `tenantDelete`)
 * that enforce tenant isolation. `tenantUpdate` and `tenantDelete` verify that
 * the target record belongs to the calling tenant before mutating — if the
 * record does not exist OR belongs to another tenant, a 404 `AppError` is
 * thrown, preventing IDOR attacks.
 *
 * Read operations (`findAll`, `findOne`) are left to the caller since they
 * don't benefit from abstraction — the `where: { id_propietario: ownerId }`
 * filter is clearer when written inline.
 *
 * Models that use a column name other than `id_propietario` (e.g.
 * `DisclaimerAcceptanceModel` which uses `id_empresa`) can pass a custom
 * `tenantColumn` override to each helper.
 */
export abstract class TenantAwareRepository {
  // ─── Write helpers ───────────────────────────────────────────────────────

  /**
   * Create a row in `model`, automatically injecting `id_propietario`.
   */
  protected async tenantCreate<M extends Model>(
    model: ModelStatic<M>,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn = 'id_propietario',
    options: CreateOptions = {},
  ): Promise<M> {
    return model.create(
      {
        ...data,
        [tenantColumn]: ownerId,
      } as unknown as M['_creationAttributes'],
      options,
    );
  }

  /**
   * Update a row by `id` **only if** it belongs to `ownerId`.
   *
   * Throws `AppError('Record not found', 404)` when:
   * - no row with that `id` exists, OR
   * - the row exists but belongs to a different tenant.
   *
   * Returns the updated model instance.
   */
  protected async tenantUpdate<M extends Model>(
    model: ModelStatic<M>,
    id: number,
    data: Record<string, unknown>,
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<M> {
    const existing = await model.findOne({
      where: { id, [tenantColumn]: ownerId },
    } as FindOptions);

    if (!existing) {
      throw new AppError('Record not found', 404, 'NOT_FOUND');
    }

    await existing.update(data as Partial<M>);
    return existing;
  }

  /**
   * Delete a row by `id` **only if** it belongs to `ownerId`.
   *
   * Throws `AppError('Record not found', 404)` when:
   * - no row with that `id` exists, OR
   * - the row exists but belongs to a different tenant.
   *
   * Returns the deleted row's `id`.
   */
  protected async tenantDelete(
    model: ModelStatic<Model>,
    id: number,
    ownerId: number,
    tenantColumn = 'id_propietario',
  ): Promise<number> {
    const existing = await model.findOne({
      where: { id, [tenantColumn]: ownerId },
    } as FindOptions);

    if (!existing) {
      throw new AppError('Record not found', 404, 'NOT_FOUND');
    }

    await existing.destroy();
    return id;
  }
}
