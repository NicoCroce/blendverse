# Contracts: Company Email Settings

**Feature**: `company-email-settings` | **Date**: 2026-08-16

## Contract boundary

`contracts/operations.json` is the shared API contract: the new domain needs
tenant-scoped `get`, `update`, `publishTerms` and `getAudit` operations, with a
detail/edit screen. `publishTerms` and `getAudit` are domain-specific and must
not be silently dropped by scaffold tooling that only knows generic CRUD.

The following domain-specific procedures are required in addition to the
generator scaffold:

- `companyEmailSettings.get` — query the current snapshot.
- `companyEmailSettings.update` — atomic preferences update with optimistic
  concurrency.
- `companyEmailSettings.publishTerms` — explicit legal publication command.
- `companyEmailSettings.getAudit` — tenant-scoped audit query.

No procedure accepts `ownerId`, `id_empresa`, or `id_propietario`; all tenant
identity comes from the verified `RequestContext`.

## Stable catalog

```text
admin_license_created
employee_license_status_changed
employee_document_signed
admin_document_signed
employee_terms_reminder
admin_daily_report
employee_daily_reminder
employee_document_assigned
requester_document_manual
```

Each code has a fixed audience and trigger. Labels, descriptions and route copy
are presentation data and must not be persisted as integration keys.

## tRPC procedures

### `companyEmailSettings.get`

Protected query. Requires the existing `dashboard-access` permission. Returns a
complete snapshot containing `version`, the nine delivery rows, admin
recipients, report sections, `welcomeMessage`, current terms (`version`,
`publishedAt`, sanitized `content`, `contentHash`), diagnostics and `updatedAt`.

The response is either a complete valid snapshot or an error. Partial settings
must never be returned as authoritative.

### `companyEmailSettings.update`

Protected mutation. Input:

```text
{
  expectedVersion: number,
  delivery: Array<{ code: CatalogCode, enabled: boolean }>,
  adminRecipients: Array<{ email: string }>,
  reportSections: Array<{ code: ReportSectionCode, enabled: boolean }>,
  welcomeMessage: string | null,
}
```

Rules:

1. Every catalog code and section code appears exactly once.
2. Email addresses are trimmed, normalized case-insensitively, validated and
   deduplicated; invalid input rejects the whole update.
3. An active admin route requires at least one valid recipient.
4. An active daily report requires at least one selected section.
5. Message content is sanitized/validated before persistence; blank custom
   content is rejected. `null` restores the legacy/default behavior.
6. `expectedVersion` must match the current aggregate version. A mismatch
   returns `409 STALE_CONFIGURATION` and does not write anything.
7. Accepted and rejected attempts generate an audit event; rejected attempts do
   not change the aggregate.
8. `update` never publishes terms. It can update the editable welcome message,
   but legal publication is only performed by the separate `publishTerms`
   mutation.

Response: the complete saved snapshot plus `savedVersion` and `savedAt`.

### `companyEmailSettings.publishTerms`

Protected mutation with an inline confirmation in the UI. Input:

```text
{
  expectedVersion: number,
  content: string,
  confirmNewAcceptanceRequirement: true,
}
```

The server sanitizes and validates content, creates the next immutable terms
version, updates `current_terms_version_id`, increments aggregate version and
records the previous/new version references atomically. Existing acceptances
remain linked to their old version. A duplicate sanitized hash is rejected with
`DUPLICATE_TERMS_CONTENT`; no duplicate version or silent rewrite is allowed.

Response: complete snapshot with the new terms version.

### `companyEmailSettings.getAudit`

Protected query for security/admin tooling. Input is optional pagination and
filters by action/outcome; it never accepts an owner id. It returns actor,
action, result, timestamps, version references, reason codes, changed catalog
codes and hashes. It does not return full message, terms or recipient content.
This is an API for security/operations tooling only; this feature does not add
an audit-history view to the frontend.

## Welcome message capability matrix

All eight automatic email types support the institutional welcome message. The
manual requester email is the only catalog type excluded.

| Code                              | Runtime insertion point              | Content protected from modification         |
| --------------------------------- | ------------------------------------ | ------------------------------------------- |
| `admin_license_created`           | Before rendered `addLicense` body    | Subject and license facts                   |
| `employee_license_status_changed` | Before `licenseStatusChange`         | Status, dates and reason                    |
| `employee_document_signed`        | Before `documentSignedEmployee`      | Signature evidence                          |
| `admin_document_signed`           | Before `documentSignedAdmin`         | Document/signature facts                    |
| `employee_terms_reminder`         | Before reminder body                 | `terms_content` remains legal and untouched |
| `admin_daily_report`              | Before summary and selected sections | Report data and selected-section policy     |
| `employee_daily_reminder`         | Before pending sections              | Pending items                               |
| `employee_document_assigned`      | Before `newDocumentNotification`     | Document titles and assignments             |
| `requester_document_manual`       | No insertion                         | Manual email and PDF are excluded           |

The runtime point is a shared institutional-email decorator/adapter after a
template renders and immediately before `MailNotificationService.sendOne()`.
Each producer passes the catalog code. The decorator does not receive or alter
legal terms content; for `employee_terms_reminder` it only prepends the
institutional block before the legal body. This work is required in the
existing template/sender paths, not only in settings CRUD.

## Application ports

```typescript
interface CompanyEmailSettingsRepository {
  get(requestContext: RequestContext): Promise<CompanyEmailSettingsSnapshot>;
  update(params: {
    requestContext: RequestContext;
    expectedVersion: number;
    draft: CompanyEmailSettingsDraft;
  }): Promise<CompanyEmailSettingsSnapshot>;
  publishTerms(params: {
    requestContext: RequestContext;
    expectedVersion: number;
    sanitizedContent: string;
  }): Promise<CompanyEmailSettingsSnapshot>;
}

interface CompanyEmailSettingsAuditRepository {
  record(event: CompanyEmailSettingsAuditEvent): Promise<void>;
  list(params: AuditQuery): Promise<PaginatedAuditEvents>;
}
```

Los tipos reales viven en `Application/companyEmailSettings.types.ts` y se
derivan de Zod para inputs de controller. El snippet define la frontera, no una
implementación.

## Delivery-policy port

Los productores existentes deben inyectar un caso de uso equivalente a:

```text
resolveDelivery({ requestContext, code })
  → { enabled: boolean, recipients: string[], selectedSections, welcomeMessage }
```

El resolver valida el owner, lee una snapshot y devuelve solo destinatarios
permitidos para el código. Los códigos admin usan la lista configurada; los
códigos employee usan el destinatario de negocio ya resuelto por el productor;
el envío requester usa el usuario actual. Un código desactivado devuelve
`enabled: false` y prohíbe llamar al sender.

Daily report debe pedir secciones antes de ejecutar las queries. El resolver
nunca puede devolver un destinatario de otro owner.

## Provisioning and execution contexts

The chosen provisioning strategy is lazy. `get` and policy resolution call an
`EnsureCompanyEmailSettings` use case when the owner has no root row. It
materializes defaults, current legacy terms and valid role-1 recipients under
`UNIQUE(owner_id)` in an idempotent transaction, and records `lazy_provision`.
No company-create hook is required.

Scheduled jobs use the existing pattern:

```text
system scheduler context: new RequestContext(0, requestId, 0)
  └─ for each active owner
       ownerContext = new RequestContext(0, requestId, owner.id)
       └─ resolveDelivery(ownerContext, catalogCode)
```

The canonical constructor is
`new RequestContext(userId, requestId, ownerId, xAppClient?)`. The scheduler
uses the three-argument form above; an authenticated request may carry the
optional `xAppClient` value.

The internal scheduler path is the only path allowed to use `userId=0`; it
does not perform the interactive `dashboard-access` check. Manual tRPC triggers
(`dailyReport.generateManual` and `employeeReminders.sendDailyReminders`) use
the authenticated `ctx.requestContext` and are scoped to that current owner;
they never iterate over or accept another owner id. Certificate, document and
disclaimer business events likewise pass their authenticated request context.

## Terms acceptance integration

`Disclaimer` mantiene su API externa pero cambia su contrato interno:

```text
getCurrentTerms(requestContext) → { version, content, contentHash }
sign({ password, termsVersion, ip, userAgent })
getStatus({ requestContext }) → status for current version only
```

El `termsVersion` mostrado es obligatorio al firmar. Si está desactualizado, la
aceptación se rechaza y el cliente debe recargar. Las filas anteriores quedan
disponibles para historial.

## Error contract

| Condition                             | Code/status                 | Client action                          |
| ------------------------------------- | --------------------------- | -------------------------------------- |
| Missing/invalid admin permission      | `FORBIDDEN` / 403           | No revelar settings                    |
| Invalid recipient/content/combination | `VALIDATION_ERROR` / 400    | Conservar snapshot y mostrar errores   |
| Stale aggregate version               | `STALE_CONFIGURATION` / 409 | Recargar y revisar                     |
| Database/transaction failure          | `PERSISTENCE_ERROR` / 500   | Conservar snapshot; retry explícito    |
| No admin recipients at runtime        | Diagnostic event, no send   | Mostrar riesgo; no fallback silencioso |

Foreign-tenant access is represented as `NOT_FOUND` with the same response
shape as a missing settings aggregate. Since the procedures do not accept an
owner id, this also prevents IDOR-by-identifier probing.

El server usa `AppError`; Application/Domain no lanzan `TRPCError`.

Recipients removed by `update` are hard-deleted. The repository enforces
`UNIQUE(owner_id, normalized_email)` over the complete active table, so a later
re-add creates a new row without a soft-deleted uniqueness collision.

## Frontend contract

- Service: `createTRPCReact<TCompanyEmailSettingsRouter>()`.
- Outputs: `inferRouterOutputs`, nunca interfaces duplicadas.
- El page hook posee query, draft, dirty state, mutations, conflict e
  invalidación; los componentes son presentacionales.
- Cada mutation button usa el wrapper `Button` con `isLoading`.
- Estados de query: error → loading → empty/ready; no snapshot parcial en error.
- El rail muestra origen, destino, audiencia, trigger y `Activo`/`Inactivo`, no
  solo color.
- Desktop/mobile montan árboles distintos mediante `useDevice()`; mobile
  conserva origen → destino → estado.

## Audit contract

Acciones mínimas: `settings_updated`, `terms_published`, `recipient_changed`,
`delivery_changed`, `report_sections_changed`, `welcome_message_changed`,
`migration_backfill` y `access_rejected`.

Cada intento accepted/rejected de estado, recipient, sección o contenido
registra tenant, actor, acción, timestamp, outcome y reason. Content changes
usan hashes y referencias de versión, no el texto completo.
