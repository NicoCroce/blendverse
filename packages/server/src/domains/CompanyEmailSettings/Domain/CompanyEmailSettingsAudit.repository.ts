import type { CompanyEmailRequestContext } from './CompanyEmailSettings.types';

export type AuditOutcome = 'accepted' | 'rejected';

export interface CompanyEmailSettingsAuditEvent {
  action: string;
  outcome: AuditOutcome;
  reasonCode?: string | null;
  settingsVersionBefore?: number | null;
  settingsVersionAfter?: number | null;
  termsVersionBefore?: number | null;
  termsVersionAfter?: number | null;
  changedCodes?: readonly string[];
  contentHashBefore?: string | null;
  contentHashAfter?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditQuery {
  requestContext: CompanyEmailRequestContext;
  page: number;
  limit: number;
  action?: string;
  outcome?: AuditOutcome;
}

export interface AuditEventView extends CompanyEmailSettingsAuditEvent {
  id: number;
  ownerId: number;
  actorUserId: number | null;
  createdAt: Date;
}

export interface PaginatedAuditEvents {
  data: AuditEventView[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
}

export interface CompanyEmailSettingsAuditRepository {
  record(
    event: CompanyEmailSettingsAuditEvent,
    requestContext: CompanyEmailRequestContext,
  ): Promise<void>;
  list(params: AuditQuery): Promise<PaginatedAuditEvents>;
}
