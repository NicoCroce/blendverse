import { AppError, type RequestContext } from '@server/Application';
import { OwnersysModel } from '@server/domains/Ownersyss/Infrastructure/Database/Ownersys.model';
import { UserModel } from '@server/domains/Users/Infrastructure/Database/Users.model';
import { Users_RolesModel } from '@server/domains/Permissions/Infrastructure/Database/Users_Roles.model';
import { sequelize } from '@server/Infrastructure/Database';
import { type Transaction } from 'sequelize';
import {
  CompanyEmailSettings,
  EMAIL_CATALOG_CODES,
  EMAIL_CATALOG_METADATA,
  REPORT_SECTION_CODES,
  type AuditQuery,
  type CompanyEmailSettingsAuditEvent,
  type CompanyEmailSettingsAuditRepository,
  type CompanyEmailSettingsDraft,
  type CompanyEmailSettingsSnapshot,
  type DeliveryPolicy,
  type EmailCatalogCode,
  type ICompanyEmailSettingsRepository,
  type PaginatedAuditEvents,
  type CompanyEmailRequestContext,
} from '../../Domain';
import {
  contentHash,
  sanitizeTermsContent,
} from '../../Domain/value-objects/EmailContent.value';
import { CompanyEmailAuditEventModel } from './CompanyEmailAuditEvent.model';
import { CompanyEmailDeliverySettingModel } from './CompanyEmailDeliverySetting.model';
import { CompanyEmailRecipientModel } from './CompanyEmailRecipient.model';
import { CompanyEmailReportSectionModel } from './CompanyEmailReportSection.model';
import { CompanyEmailSettingsModel } from './CompanyEmailSettings.model';
import { CompanyTermsVersionModel } from './CompanyTermsVersion.model';

export class CompanyEmailSettingsRepositoryImplementation
  implements
    ICompanyEmailSettingsRepository,
    CompanyEmailSettingsAuditRepository
{
  private ownerId(requestContext: CompanyEmailRequestContext): number {
    const ownerId = requestContext.values.ownerId;
    if (!Number.isInteger(ownerId) || ownerId < 1) {
      throw new AppError('Empresa no encontrada', 404, 'NOT_FOUND');
    }
    return ownerId;
  }

  async ensure(
    requestContext: RequestContext,
  ): Promise<CompanyEmailSettingsSnapshot> {
    const ownerId = this.ownerId(requestContext);
    const transaction = await sequelize.transaction();
    try {
      const [settings, created] = await CompanyEmailSettingsModel.findOrCreate({
        where: { owner_id: ownerId },
        defaults: {
          owner_id: ownerId,
          version: 1,
          welcome_message: null,
          current_terms_version_id: null,
        },
        transaction,
      });

      const ownersys = await OwnersysModel.findOne({
        where: { id: ownerId },
        transaction,
      });
      if (!ownersys)
        throw new AppError('Empresa no encontrada', 404, 'NOT_FOUND');

      const legacyTerms = sanitizeTermsContent(ownersys.texto_disclaimer ?? '');
      const [terms] = await CompanyTermsVersionModel.findOrCreate({
        where: { owner_id: ownerId, version_number: 1 },
        defaults: {
          owner_id: ownerId,
          version_number: 1,
          content_html: legacyTerms,
          content_hash: contentHash(legacyTerms),
          published_at: new Date(),
          published_by: null,
        },
        transaction,
      });

      if (!settings.current_terms_version_id) {
        await settings.update(
          { current_terms_version_id: terms.id },
          { transaction },
        );
      }

      await CompanyEmailDeliverySettingModel.bulkCreate(
        EMAIL_CATALOG_CODES.map((code) => ({
          owner_id: ownerId,
          code,
          audience: EMAIL_CATALOG_METADATA[code].audience,
          trigger: EMAIL_CATALOG_METADATA[code].trigger,
          enabled: true,
        })),
        { transaction, ignoreDuplicates: true },
      );
      await CompanyEmailReportSectionModel.bulkCreate(
        REPORT_SECTION_CODES.map((code) => ({
          owner_id: ownerId,
          code,
          enabled: true,
        })),
        { transaction, ignoreDuplicates: true },
      );

      if (created) {
        const legacyAdmins = await UserModel.findAll({
          where: { id_propietario: ownerId },
          attributes: ['email'],
          include: [
            {
              model: Users_RolesModel,
              as: 'UsersRoles',
              where: { id_rol: 1 },
              attributes: [],
            },
          ],
          transaction,
        });
        const recipients = new Map<string, string>();
        for (const admin of legacyAdmins) {
          const email = admin.email.trim();
          if (email && email.includes('@'))
            recipients.set(email.toLowerCase(), email);
        }
        await CompanyEmailRecipientModel.bulkCreate(
          [...recipients.entries()].map(([normalized_email, email]) => ({
            owner_id: ownerId,
            email,
            normalized_email,
            source: 'lazy_provision',
          })),
          { transaction, ignoreDuplicates: true },
        );
      }

      if (created) {
        await this.recordInTransaction(
          {
            action: 'lazy_provision',
            outcome: 'accepted',
            settingsVersionAfter: 1,
            termsVersionAfter: terms.version_number,
            metadata: { source: 'runtime' },
          },
          requestContext,
          transaction,
        );
      }
      await transaction.commit();
      return this.snapshot(ownerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async get(
    requestContext: RequestContext,
  ): Promise<CompanyEmailSettingsSnapshot> {
    return this.snapshot(this.ownerId(requestContext));
  }

  async update({
    requestContext,
    expectedVersion,
    draft,
  }: {
    requestContext: RequestContext;
    expectedVersion: number;
    draft: CompanyEmailSettingsDraft;
  }): Promise<CompanyEmailSettingsSnapshot> {
    const ownerId = this.ownerId(requestContext);
    await this.ensure(requestContext);
    const transaction = await sequelize.transaction();
    try {
      const current = await CompanyEmailSettingsModel.findOne({
        where: { owner_id: ownerId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!current)
        throw new AppError('Configuración no encontrada', 404, 'NOT_FOUND');
      const nextVersion = current.version + 1;
      const [updated] = await CompanyEmailSettingsModel.update(
        { version: nextVersion, welcome_message: draft.welcomeMessage },
        { where: { owner_id: ownerId, version: expectedVersion }, transaction },
      );
      if (updated !== 1)
        throw new AppError(
          'La configuración fue modificada; recargue antes de guardar',
          409,
          'STALE_CONFIGURATION',
        );

      await CompanyEmailDeliverySettingModel.destroy({
        where: { owner_id: ownerId },
        transaction,
        force: true,
      });
      await CompanyEmailDeliverySettingModel.bulkCreate(
        draft.delivery.map((item) => ({
          owner_id: ownerId,
          code: item.code,
          audience: EMAIL_CATALOG_METADATA[item.code].audience,
          trigger: EMAIL_CATALOG_METADATA[item.code].trigger,
          enabled: item.enabled,
        })),
        { transaction },
      );
      await CompanyEmailReportSectionModel.destroy({
        where: { owner_id: ownerId },
        transaction,
        force: true,
      });
      await CompanyEmailReportSectionModel.bulkCreate(
        draft.reportSections.map((item) => ({ ...item, owner_id: ownerId })),
        { transaction },
      );
      await CompanyEmailRecipientModel.destroy({
        where: { owner_id: ownerId },
        transaction,
        force: true,
      });
      await CompanyEmailRecipientModel.bulkCreate(
        draft.adminRecipients.map((item) => ({
          owner_id: ownerId,
          email: item.email,
          normalized_email: item.email.trim().toLowerCase(),
          source: 'manual',
        })),
        { transaction },
      );
      await this.recordInTransaction(
        {
          action: 'settings_updated',
          outcome: 'accepted',
          settingsVersionBefore: current.version,
          settingsVersionAfter: nextVersion,
          changedCodes: draft.delivery.map(({ code }) => code),
          metadata: {
            recipients: draft.adminRecipients.length,
            sections: draft.reportSections.filter(({ enabled }) => enabled)
              .length,
          },
        },
        requestContext,
        transaction,
      );
      await transaction.commit();
      return this.snapshot(ownerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async publishTerms({
    requestContext,
    expectedVersion,
    sanitizedContent,
  }: {
    requestContext: RequestContext;
    expectedVersion: number;
    sanitizedContent: string;
  }): Promise<CompanyEmailSettingsSnapshot> {
    const ownerId = this.ownerId(requestContext);
    await this.ensure(requestContext);
    const transaction = await sequelize.transaction();
    try {
      const current = await CompanyEmailSettingsModel.findOne({
        where: { owner_id: ownerId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!current)
        throw new AppError('Configuración no encontrada', 404, 'NOT_FOUND');
      const previousTerms = current.current_terms_version_id
        ? await CompanyTermsVersionModel.findOne({
            where: { id: current.current_terms_version_id, owner_id: ownerId },
            transaction,
          })
        : null;
      const hash = contentHash(sanitizedContent);
      if (
        await CompanyTermsVersionModel.findOne({
          where: { owner_id: ownerId, content_hash: hash },
          transaction,
        })
      ) {
        throw new AppError(
          'El contenido de términos ya fue publicado',
          400,
          'DUPLICATE_TERMS_CONTENT',
        );
      }
      const latest = await CompanyTermsVersionModel.findOne({
        where: { owner_id: ownerId },
        order: [['version_number', 'DESC']],
        transaction,
      });
      const terms = await CompanyTermsVersionModel.create(
        {
          owner_id: ownerId,
          version_number: (latest?.version_number ?? 0) + 1,
          content_html: sanitizedContent,
          content_hash: hash,
          published_at: new Date(),
          published_by: requestContext.values.userId || null,
        },
        { transaction },
      );
      const [updated] = await CompanyEmailSettingsModel.update(
        { version: current.version + 1, current_terms_version_id: terms.id },
        { where: { owner_id: ownerId, version: expectedVersion }, transaction },
      );
      if (updated !== 1)
        throw new AppError(
          'La configuración fue modificada; recargue antes de publicar',
          409,
          'STALE_CONFIGURATION',
        );
      await this.recordInTransaction(
        {
          action: 'terms_published',
          outcome: 'accepted',
          settingsVersionBefore: current.version,
          settingsVersionAfter: current.version + 1,
          termsVersionBefore: previousTerms?.version_number ?? null,
          termsVersionAfter: terms.version_number,
          contentHashBefore: previousTerms?.content_hash ?? null,
          contentHashAfter: hash,
        },
        requestContext,
        transaction,
      );
      await transaction.commit();
      return this.snapshot(ownerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async resolvePolicy({
    requestContext,
    code,
  }: {
    requestContext: RequestContext;
    code: EmailCatalogCode;
  }): Promise<DeliveryPolicy> {
    const snapshot = await this.ensure(requestContext);
    const delivery = snapshot.deliveries.find((item) => item.code === code);
    if (!delivery)
      throw new AppError(
        'Tipo de email no reconocido',
        400,
        'VALIDATION_ERROR',
      );
    const isAdmin = delivery.audience === 'admin';
    const diagnostics = [...snapshot.diagnostics];
    if (isAdmin && delivery.enabled && snapshot.recipients.length === 0)
      diagnostics.push('admin_route_without_recipients');
    return {
      code,
      enabled: delivery.enabled,
      recipients: isAdmin ? snapshot.recipients.map(({ email }) => email) : [],
      selectedSections: snapshot.reportSections
        .filter(({ enabled }) => enabled)
        .map(({ code: sectionCode }) => sectionCode),
      welcomeMessage: snapshot.welcomeMessage,
      diagnostics,
    };
  }

  async record(
    event: CompanyEmailSettingsAuditEvent,
    requestContext: RequestContext,
  ): Promise<void> {
    const { ownerId, userId } = requestContext.values;
    this.ownerId(requestContext);
    await CompanyEmailAuditEventModel.create({
      owner_id: ownerId,
      actor_user_id: userId || null,
      action: event.action,
      outcome: event.outcome,
      reason_code: event.reasonCode ?? null,
      settings_version_before: event.settingsVersionBefore ?? null,
      settings_version_after: event.settingsVersionAfter ?? null,
      terms_version_before: event.termsVersionBefore ?? null,
      terms_version_after: event.termsVersionAfter ?? null,
      changed_codes: event.changedCodes ? [...event.changedCodes] : null,
      content_hash_before: event.contentHashBefore ?? null,
      content_hash_after: event.contentHashAfter ?? null,
      metadata: event.metadata ?? null,
    });
  }

  async list(params: AuditQuery): Promise<PaginatedAuditEvents> {
    const ownerId = this.ownerId(params.requestContext);
    const where: Record<string, unknown> = { owner_id: ownerId };
    if (params.action) where.action = params.action;
    if (params.outcome) where.outcome = params.outcome;
    const offset = (params.page - 1) * params.limit;
    const { rows, count } = await CompanyEmailAuditEventModel.findAndCountAll({
      where,
      limit: params.limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return {
      data: rows.map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        actorUserId: row.actor_user_id,
        action: row.action,
        outcome: row.outcome,
        reasonCode: row.reason_code,
        settingsVersionBefore: row.settings_version_before,
        settingsVersionAfter: row.settings_version_after,
        termsVersionBefore: row.terms_version_before,
        termsVersionAfter: row.terms_version_after,
        changedCodes: row.changed_codes ?? undefined,
        contentHashBefore: row.content_hash_before,
        contentHashAfter: row.content_hash_after,
        metadata: row.metadata ?? undefined,
        createdAt: row.created_at,
      })),
      meta: {
        page: params.page,
        limit: params.limit,
        totalItems: count,
        totalPages: Math.ceil(count / params.limit),
      },
    };
  }

  private async recordInTransaction(
    event: CompanyEmailSettingsAuditEvent,
    requestContext: RequestContext,
    transaction: Transaction,
  ): Promise<void> {
    const { userId } = requestContext.values;
    await CompanyEmailAuditEventModel.create(
      {
        owner_id: this.ownerId(requestContext),
        actor_user_id: userId || null,
        action: event.action,
        outcome: event.outcome,
        reason_code: event.reasonCode ?? null,
        settings_version_before: event.settingsVersionBefore ?? null,
        settings_version_after: event.settingsVersionAfter ?? null,
        terms_version_before: event.termsVersionBefore ?? null,
        terms_version_after: event.termsVersionAfter ?? null,
        changed_codes: event.changedCodes ? [...event.changedCodes] : null,
        content_hash_before: event.contentHashBefore ?? null,
        content_hash_after: event.contentHashAfter ?? null,
        metadata: event.metadata ?? null,
      },
      { transaction },
    );
  }

  private async snapshot(
    ownerId: number,
  ): Promise<CompanyEmailSettingsSnapshot> {
    const settings = await CompanyEmailSettingsModel.findOne({
      where: { owner_id: ownerId },
    });
    if (!settings)
      throw new AppError('Configuración no encontrada', 404, 'NOT_FOUND');
    const [deliveries, recipients, sections] = await Promise.all([
      CompanyEmailDeliverySettingModel.findAll({
        where: { owner_id: ownerId },
        order: [['id', 'ASC']],
      }),
      CompanyEmailRecipientModel.findAll({
        where: { owner_id: ownerId },
        order: [['id', 'ASC']],
      }),
      CompanyEmailReportSectionModel.findAll({
        where: { owner_id: ownerId },
        order: [['id', 'ASC']],
      }),
    ]);
    const currentTerms = settings.current_terms_version_id
      ? await CompanyTermsVersionModel.findOne({
          where: { id: settings.current_terms_version_id, owner_id: ownerId },
        })
      : null;
    const diagnostics: string[] = [];
    if (
      deliveries.some(
        (delivery) => delivery.enabled && delivery.audience === 'admin',
      ) &&
      recipients.length === 0
    )
      diagnostics.push('admin_route_without_recipients');
    if (
      deliveries.some(
        (delivery) =>
          delivery.code === 'admin_daily_report' && delivery.enabled,
      ) &&
      !sections.some((section) => section.enabled)
    )
      diagnostics.push('daily_report_without_sections');
    const snapshot = CompanyEmailSettings.create({
      id: settings.id,
      ownerId,
      version: settings.version,
      welcomeMessage: settings.welcome_message,
      deliveries: deliveries.map(({ code, audience, trigger, enabled }) => ({
        code: code as EmailCatalogCode,
        audience: audience as 'admin' | 'employee' | 'requester',
        trigger,
        enabled,
      })),
      recipients: recipients.map(({ id, email, normalized_email, source }) => ({
        id,
        email,
        normalizedEmail: normalized_email,
        source,
      })),
      reportSections: sections.map(({ code, enabled }) => ({
        code: code as never,
        enabled,
      })),
      currentTerms: currentTerms
        ? {
            id: currentTerms.id,
            version: currentTerms.version_number,
            publishedAt: currentTerms.published_at,
            publishedBy: currentTerms.published_by,
            content: currentTerms.content_html,
            contentHash: currentTerms.content_hash,
          }
        : null,
      diagnostics,
      updatedAt: settings.updated_at,
    });
    return snapshot.values;
  }
}
