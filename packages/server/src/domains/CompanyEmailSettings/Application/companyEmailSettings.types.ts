import { z } from 'zod';
import type { IRequestContext } from '@server/Application';
import {
  EMAIL_CATALOG_CODES,
  REPORT_SECTION_CODES,
  type CompanyEmailSettingsSnapshot,
  type DeliveryPolicy,
  type EmailCatalogCode,
} from '../Domain';

export const emailCatalogCodeSchema = z.enum(EMAIL_CATALOG_CODES);
export const reportSectionCodeSchema = z.enum(REPORT_SECTION_CODES);

export const updateCompanyEmailSettingsSchema = z.object({
  expectedVersion: z.number().int().positive(),
  delivery: z.array(
    z.object({ code: emailCatalogCodeSchema, enabled: z.boolean() }),
  ),
  adminRecipients: z.array(z.object({ email: z.string().max(320) })),
  reportSections: z.array(
    z.object({ code: reportSectionCodeSchema, enabled: z.boolean() }),
  ),
  welcomeMessage: z.string().nullable(),
});

export const publishTermsSchema = z.object({
  expectedVersion: z.number().int().positive(),
  content: z.string(),
  confirmNewAcceptanceRequirement: z.literal(true),
});

export const auditQuerySchema = z
  .object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(100).optional().default(50),
    action: z.string().max(80).optional(),
    outcome: z.enum(['accepted', 'rejected']).optional(),
  })
  .optional();

export type UpdateCompanyEmailSettingsInput = z.infer<
  typeof updateCompanyEmailSettingsSchema
>;
export type PublishTermsInput = z.infer<typeof publishTermsSchema>;
export type AuditQueryInput = z.infer<typeof auditQuerySchema>;

export type GetCompanyEmailSettingsInput = IRequestContext & {
  input?: undefined;
};
export type UpdateCompanyEmailSettingsRequest = IRequestContext & {
  input: UpdateCompanyEmailSettingsInput;
};
export type PublishTermsRequest = IRequestContext & {
  input: PublishTermsInput;
};
export type GetAuditRequest = IRequestContext & { input?: AuditQueryInput };

export interface DeliveryPolicyRequest extends IRequestContext {
  input: { code: EmailCatalogCode };
}

export type ResolveDeliveryRequest = DeliveryPolicyRequest;

export interface CompanyEmailSettingsServiceResult {
  snapshot: CompanyEmailSettingsSnapshot;
  savedVersion?: number;
  savedAt?: Date;
}

export type ResolveEmailDeliveryPolicyResult = DeliveryPolicy;
