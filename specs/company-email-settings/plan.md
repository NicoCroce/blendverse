# Implementation Plan: Company Email Settings

**Branch**: `005-company-email-settings` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/company-email-settings/spec.md` and visual direction from [frontend-design.md](./frontend-design.md).

## Summary

Crear el dominio `CompanyEmailSettings` para que cada empresa controle, de forma
tenant-scoped, el catálogo de nueve comunicaciones, los destinatarios
administrativos, las siete secciones del reporte matutino, el mensaje de inicio
y las versiones de términos y condiciones. La configuración se lee y actualiza
como un agregado versionado, con validación completa antes de persistir,
concurrencia optimista, auditoría de cambios aceptados y rechazados, y backfill
de los valores actuales.

La política de entrega será consumida por los disparadores existentes
(`SendEmailService`, `DailyReport`, `EmployeeReminders` y `Disclaimer`) mediante
casos de uso inyectados; ningún disparador leerá las tablas directamente. El
frontend será una vista de administración única: una torre de control con rail
de rutas origen → destino, no un CRUD genérico.

## Technical Context

**Language/Version**: TypeScript 6.x estricto, Node.js >=22.6, React 19.

**Primary Dependencies**: Express 5, tRPC 11, Zod 4, Sequelize 6/MySQL,
Awilix 13, Pino 10, Nodemailer 8, React Hook Form 7, TanStack Query 5,
React Router 7, Tailwind CSS 4 y Radix UI existentes. Se agregará
`sanitize-html` al server para la allowlist de contenido; no se implementará un
parser HTML propio.

**Storage**: MySQL mediante Sequelize. Nuevas tablas para el agregado de
configuración, destinatarios, secciones, versiones de términos y auditoría;
alteración compatible de `disclaimer_firmas` para enlazar aceptaciones a una
versión.

**Testing**: Vitest 2 para reglas de negocio unitarias e integración, React
Testing Library para estados y formularios, y Playwright para el flujo
administrador desktop/mobile. Quality gates: `pnpm tsc`, `pnpm lint`,
`pnpm test` y `pnpm test:e2e` (script root existente, configurado por
`playwright.config.ts`/`playwright.config.js`).

**Target Platform**: Backend Express/tRPC y SPA React/Vite del monorepo.

**Project Type**: Web application full-stack en modular monolith.

**Performance Goals**: Lectura de configuración en una consulta del agregado
con sus colecciones; actualización en una transacción. El guardado debe tener
una respuesta p95 menor a 500 ms fuera de SMTP y la política de envío no debe
agregar consultas por destinatario a cada email.

**Constraints**: `ownerId` solo proviene de `RequestContext`; no se acepta
`ownerId`/`id_propietario` del cliente. Validación y sanitización preceden a
cualquier escritura. Un conflicto de versión devuelve 409 sin modificar datos.
El horario `0 9 * * *` de `America/Argentina/Buenos_Aires` no se edita en esta
feature.

**Scale/Scope**: Todas las empresas activas existentes, nueve tipos de email,
siete secciones del reporte, hasta decenas de destinatarios por empresa y una
pantalla administrativa responsive. El alcance no incorpora un proveedor SMTP,
un scheduler nuevo ni un editor legal libre de sanitización.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación                                                                                                                                                                                                                                    | Status  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| I. Arquitectura Hexagonal / DDD | Nuevo dominio persistente con `Domain/`, `Application/`, `Infrastructure/` y `[domain].di.ts`; los controllers tRPC permanecen exclusivamente en `Infrastructure/Controllers`, conforme a la constitución actual. No se agrega `Presentation/`. | ✅ PASS |
| II. Multi-Tenant Obligatorio    | Repositorios filtran por `RequestContext.values.ownerId`; el contrato no contiene `ownerId` del cliente. Casos multi-tenant obligatorios.                                                                                                       | ✅ PASS |
| III. TypeScript Estricto + Zod  | Inputs Zod en `Application/[domain].types.ts`; frontend deriva outputs con `inferRouterOutputs`; sin `any`.                                                                                                                                     | ✅ PASS |
| IV. Flujo de Agentes Orquestado | Feature Speckit: implement → back/front → tester → qa → reviewer, con artefactos de memoria al implementar.                                                                                                                                     | ✅ PASS |
| V. Tests por Regla de Negocio   | Tests concretos para invariantes, tenant isolation, versionado, sanitización, gates de envío y estados UX.                                                                                                                                      | ✅ PASS |
| VI. Conventional Commits        | Scope recomendado: `company-email-settings`.                                                                                                                                                                                                    | ✅ PASS |
| VII. Aislamiento de Dominios    | El nuevo dominio expone use cases de política; los consumidores los inyectan. No se importan repositorios ajenos.                                                                                                                               | ✅ PASS |

**Violaciones**: Ninguna.

## Existing Code Findings

- El catálogo actual está documentado en `docs/email-notifications.md` y en
  `Infrastructure/utils/Email/Templates/index.ts`: `addLicense`,
  `licenseStatusChange`, `documentSignedEmployee`, `documentSignedAdmin`,
  `disclaimerReminder`, `dailyReport`, `employeeDailyReminder`,
  `newDocumentNotification` y el envío manual inline de documentos.
- `SendEmailService` resuelve admins con `GetAdmins`, actualmente basado en
  `users_roles.id_rol = 1`; no existe una lista externa por empresa. El backfill
  debe importar exactamente esos emails válidos y deduplicados para no cambiar
  el comportamiento vigente.
- `DailyReport` genera siempre las siete secciones y `EmployeeReminders` genera
  pendientes por empleado. Ambos deberán consultar la política antes de generar
  datos para una sección o enviar un mensaje.
- `OwnersysModel.texto_disclaimer` es el texto legacy y
  `DisclaimerAcceptanceModel` no tiene versión. Las aceptaciones actuales deben
  vincularse a la versión inicial importada; no se debe forzar una reaceptación.
- No se encontró un dominio de auditoría reutilizable. Se agrega un registro de
  auditoría acotado a esta configuración, sin guardar el contenido completo.
- La protección frontend actual usa `dashboard-access` y el backend usa
  `protectedProcedure` sin autorización de dominio. El nuevo dominio debe hacer
  la verificación también en Application, no confiar en el menú.

## Architecture and Data Flow

```text
Admin SPA
  └─ tRPC companyEmailSettings.get/update/publishTerms/getAudit
       └─ Controller (Zod + protectedProcedure)
            └─ Application policy/use cases
                 ├─ CompanyEmailSettings aggregate + invariants
                 ├─ repository port ── Sequelize repositories (tenant + transaction)
                 └─ audit port ─────── audit table

Business trigger ──► delivery-policy use case ──► existing template/sender
  Certificates/Documents/Disclaimer/DailyReport/EmployeeReminders
```

`getAudit` termina en el API tenant-scoped de tooling de seguridad/operaciones;
no tiene una vista frontend en esta feature.

The new domain owns the communication policy and terms versions. The existing
`Disclaimer` domain keeps ownership of acceptance behavior and stores the
published terms version id. It obtains the current version through the
`CompanyEmailSettings` use case, preserving domain isolation and avoiding a
repository import.

## Phase 0 — Research and decisions

Completed in [research.md](./research.md). It resolves persistence, migration,
catalog mapping, authorization, content policy, concurrency, terms versioning,
and reuse of the existing schedulers/email adapters. There are no remaining
`NEEDS CLARIFICATION` items.

## Phase 1 — Design and contracts

Completed by [data-model.md](./data-model.md),
[contracts/interfaces.md](./contracts/interfaces.md), and
[contracts/operations.json](./contracts/operations.json). The shared contract
declares `get`, `update`, `publishTerms` and `getAudit`; scaffold tooling must
preserve the two domain-specific operations instead of silently reducing the
contract to generic CRUD. `detail/edit` remain the only frontend views; audit
is an API for security/operations tooling and has no UI in this feature.

## Phase 2 — Backend foundation and persistence

1. Adapt the operations-contract reader/generator boundary to preserve
   domain-specific API names in `apiOperations`. The scaffold still generates
   only the standard `get`/`update` skeletons, while `publishTerms` and
   `getAudit` remain explicit domain procedures; neither operation may be
   silently discarded from the shared contract.
2. Add the `CompanyEmailSettings` domain with pure Domain entities/value
   objects, Application DTOs/use cases, repository/audit ports, Infrastructure
   Sequelize models/repositories, controllers/routes and `[domain].di.ts`.
3. Add the SQL migration described in `data-model.md`. Because MySQL DDL can
   commit implicitly, implement it as staged, idempotent and resumable work
   tracked by `company_email_migration_state`, not as a falsely all-or-nothing
   DDL transaction. The repository has no migration CLI or migration script:
   the operational executor is a database operator/deployment process running
   the SQL file through the existing MySQL access mechanism used for
   `001_disclaimer.sql`.
4. Backfill every existing company: all nine types active, all seven report
   sections active, current role-1 admin emails as recipients, and an initial
   terms version imported from `sis_propietarios.texto_disclaimer`.
5. Link every existing `disclaimer_firmas` row to that initial terms version;
   replace the one-row-per-user/company uniqueness with one-row-per-user/
   company/version while retaining historical rows.
6. Register the domain in `domains/register.ts` and
   `Infrastructure/Routes/Router.ts`; keep controllers under
   `Infrastructure/Controllers`, export only the public route barrel from the
   domain root, and import DI directly from `[domain].di.ts`.
7. Use lazy provisioning for companies created after the backfill. The first
   `get`, policy resolution or scheduled/manual owner run calls
   `EnsureCompanyEmailSettings` and materializes defaults under the unique owner
   key. Do not add a company-creation hook that the current codebase does not
   expose.

The operator command file for this staged migration is
`specs/company-email-settings/pendiente.sql`. It is deliberately outside the
runtime migration directory so it cannot be auto-executed; it contains the
preflight, DDL, backfill, acceptance-linking, constraint and validation commands
for the manual MySQL process. The implementation must keep
`packages/server/src/migrations/002_company_email_settings.sql` behaviorally
aligned with it.

The canonical context construction is the existing class signature:
`new RequestContext(userId, requestId, ownerId, xAppClient?)`. Scheduled
execution uses `new RequestContext(0, requestId, 0)` for the system enumerator
and `new RequestContext(0, requestId, owner.id)` for each company. Manual tRPC
triggers use the authenticated `ctx.requestContext` and stay scoped to its
verified owner.

## Phase 3 — Application behavior and integrations

1. Enforce the existing `dashboard-access` permission in the new use cases and
   verify the current user belongs to the tenant represented by the verified
   token. Return the same access-denied/not-found shape for foreign tenants.
2. Implement `get` as a complete snapshot and `update` as one optimistic,
   transactional aggregate update. Validate the whole proposed state before
   opening the write transaction. `update` never publishes terms.
3. Implement explicit `publishTerms`: create a monotonic version, store the
   sanitized content and SHA-256 hash, advance the aggregate version, and leave
   prior acceptances untouched. Reject an equal sanitized hash with
   `DUPLICATE_TERMS_CONTENT`.
4. Expose delivery-policy use cases. Update `SendEmailService`,
   `DailyReport`, `EmployeeReminders` and `Disclaimer` to consult policy by
   catalog code. For the report, do not query or render sections that are not
   selected. For admin messages, resolve only the custom recipient list.
5. Add the institutional welcome decorator at the runtime boundary after each
   supported template renders and immediately before
   `MailNotificationService.sendOne()`. Apply it to all eight automatic codes;
   for `employee_terms_reminder` prepend only an institutional block and leave
   legal terms untouched. Exclude `requester_document_manual`. Update all
   producer paths (`SendEmail.service.ts`, `DisclaimerEmail.service.ts`,
   `SendReportEmail`, `SendEmployeeReminderEmail` and `NotifyNewDocument`) and
   their template contracts; this is the missing integration task beyond CRUD.
6. Keep the manual document email independent from the admin recipient list,
   but gate it with its own catalog code. Keep the existing 9 AM schedule and
   SMTP adapter unchanged.
7. Make scheduled and manual contexts explicit: schedulers use a system
   context `new RequestContext(0, requestId, 0)` only to enumerate owners, then
   create one synthetic `new RequestContext(0, requestId, owner.id)` per
   company for policy/data. Manual tRPC triggers use the authenticated context
   and run only for its current owner; they never accept or iterate an owner id.
8. Update `docs/email-notifications.md` with the policy gate and the new source
   of recipients after implementation.

## Phase 4 — Frontend tower of control

1. Add `packages/app/src/Domains/CompanyEmailSettings/` with service, inferred
   entity types, route constants/router, hooks, page and domain components.
2. Add the route under the existing Admin router and a menu entry guarded by
   `dashboard-access`; the server remains the authority.
3. Build one vertical view with a desktop context rail and a readable main
   column: operational summary, delivery routes, admin recipients, morning
   report, and content tabs. Keep logic in a page hook and presentation in
   components.
4. Apply the visual contract: `ink-950`, `indigo-900`, `violet-500`,
   `ice-100`, `slate-400`, `amber-400`; Sora/Manrope/IBM Plex Mono stacks;
   route lines illuminate only when active; amber is reserved for real risk.
   Tokens must be feature-scoped CSS variables or existing semantic tokens, not
   repeated raw color literals.
5. Use `useDevice()` to mount either the desktop rail layout or the compact
   mobile header. Never render two responsive trees hidden with CSS. On mobile,
   stack each route as origin → destination → state and preserve the decision
   order.
6. Implement loading skeletons, contextual recipient empty state, query error
   with retry, persistent unsaved banner, saving lock/spinner, conflict reload
   action, visible success version/timestamp, and inline terms publication
   confirmation. Use existing wrappers from `@app/Application/Components`.
   Do not add an audit-history screen; `getAudit` is consumed by security/
   operations tooling only.

## Phase 5 — Verification and rollout

1. Run migration on a copy of production data through the deployment team's
   configured MySQL client/access mechanism. No `pnpm db:migrate`, Sequelize
   CLI, or other repository migration command exists today; do not document or
   depend on one.
2. To resume, query `company_email_migration_state`, rerun the idempotent SQL
   section for its current stage, and continue owner batches after
   `last_owner_id`. Commit each owner batch before advancing the marker; rerun
   a partially attempted batch safely by its owner key. Only after all owners
   validate, run the constraints/finalization sections and mark `completed`.
3. Compare pre/post effective recipients and email enablement for every company.
4. Run backend, frontend and Playwright rule-based tests from
   [quickstart.md](./quickstart.md).
5. If deployment supports it, enable policy reads in shadow/diagnostic mode;
   compare intended recipients and sections before enforcing gates. Then
   enforce gates and monitor audit/diagnostic events.
6. Verify no template sends before policy resolution and no partial settings
   snapshot is visible after failures.

## Project Structure

### Documentation

```text
specs/company-email-settings/
├── spec.md
├── frontend-design.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── interfaces.md
│   └── operations.json
├── pendiente.sql
└── tasks.md             # Phase 2 / speckit.tasks; not created here
```

### Source Code

```text
packages/server/src/domains/CompanyEmailSettings/
├── Domain/
│   ├── CompanyEmailSettings.entity.ts
│   ├── CompanyEmailSettings.repository.ts
│   ├── CompanyEmailSettings.types.ts
│   ├── CompanyEmailSettingsAudit.repository.ts
│   ├── value-objects/
│   │   ├── EmailAddress.value.ts
│   │   ├── EmailContent.value.ts
│   │   └── EmailCatalog.value.ts
│   └── specs/
├── Application/
│   ├── UseCases/
│   │   ├── GetCompanyEmailSettings.usecase.ts
│   │   ├── UpdateCompanyEmailSettings.usecase.ts
│   │   ├── PublishTermsVersion.usecase.ts
│   │   ├── ResolveEmailDeliveryPolicy.usecase.ts
│   │   └── GetCompanyEmailSettingsAudit.usecase.ts
│   ├── companyEmailSettings.types.ts
│   └── CompanyEmailSettings.service.ts
├── Infrastructure/
│   ├── Controllers/CompanyEmailSettings.controller.ts
│   ├── Database/
│   │   ├── CompanyEmailSettings.model.ts
│   │   ├── CompanyEmailDeliverySetting.model.ts
│   │   ├── CompanyEmailRecipient.model.ts
│   │   ├── CompanyEmailReportSection.model.ts
│   │   ├── CompanyTermsVersion.model.ts
│   │   ├── CompanyEmailAuditEvent.model.ts
│   │   └── CompanyEmailSettingsRepository.implementation.ts
│   └── Routes/CompanyEmailSettings.routes.ts
├── companyEmailSettings.di.ts
└── index.ts

packages/server/src/domains/Disclaimer/                 # versioned acceptance adapter
packages/server/src/Application/Services/SendEmail.service.ts
packages/server/src/domains/{DailyReport,EmployeeReminders}/ # policy consumers
packages/server/src/Infrastructure/utils/Email/
├── InstitutionalWelcome.decorator.ts                  # eight automatic codes
└── Templates/                                          # capability-aware inputs
packages/server/src/migrations/002_company_email_settings.sql
# Manual operator mirror: specs/company-email-settings/pendiente.sql

packages/app/src/Domains/CompanyEmailSettings/
├── CompanyEmailSettings.entity.ts
├── CompanyEmailSettings.service.ts
├── CompanyEmailSettings.routes.ts
├── CompanyEmailSettings.router.tsx
├── Hooks/
├── Components/
└── Pages/CompanyEmailSettings.page.tsx

packages/app/src/Domains/Admin/{Admin.router.tsx,MenuAdmin.tsx}
packages/app/src/Infrastructure/Routes.tsx
docs/email-notifications.md
```

**Structure Decision**: Nuevo dominio `CompanyEmailSettings` para el agregado
persistente y la política de entrega; `Disclaimer` conserva la conducta de
aceptación y consume el puerto de versión actual. El backend mantiene la
separación Domain/Application/Infrastructure/DI y el frontend usa un módulo de
dominio propio montado dentro del área Admin. El barrel público del dominio
solo expone sus rutas; el registro Awilix se importa desde `[domain].di.ts` y no
se exporta `Infrastructure` completo. No se agregan repositorios de otros
dominios al nuevo dominio.

## Contract and Domain Decisions

- `get` y `update` son las operaciones CRUD-like compartidas por generators.
  `publishTerms` y `getAudit` son comandos/consultas específicos y quedan
  definidos en `contracts/interfaces.md`, porque el generador no debe inventar
  operaciones legales ni de auditoría.
- La entrada no recibe empresa. `expectedVersion` es obligatorio en update y
  publish; el `ownerId` siempre se obtiene del contexto autenticado.
- Una actualización de preferencias, destinatarios, secciones y mensaje de
  inicio es una única transacción. Publicar términos es una acción explícita y
  separada, también transaccional, porque cambia el estado legal y requiere
  confirmación inline.
- Los códigos del catálogo son constantes compartidas en el contrato; los
  nombres visibles y los textos de UI no se usan como claves de persistencia.

## Complexity Tracking

No hay violaciones de la constitución. La complejidad adicional (versiones,
auditoría y tablas normalizadas) es necesaria para cumplir aislamiento,
concurrencia, historial legal y destinatarios externos sin convertir la
configuración en un JSON opaco ni mezclarla con `Ownersyss`.

## Risks and Mitigations

| Riesgo                                                             | Mitigación                                                                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Backfill importa admins incompletos por el rol legacy `id_rol = 1` | Snapshot previo/posterior, deduplicación case-insensitive y diagnóstico de empresas sin destinatarios.                                        |
| Un disparador olvida aplicar la política                           | Adaptador único `ResolveEmailDeliveryPolicy` y pruebas por cada código del catálogo; no permitir acceso directo al sender desde consumidores. |
| Sanitización insuficiente en emails/previews                       | Allowlist server-side, hash del contenido sanitizado, límites de tamaño y pruebas con payloads XSS.                                           |
| Dos administradores sobrescriben cambios                           | `version`/`expectedVersion`, update condicionado y respuesta 409 con recarga explícita.                                                       |
| Publicación de términos durante una aceptación                     | La aceptación captura `termsVersionId` de la versión que se mostró; el publish no actualiza filas históricas.                                 |
| Error parcial entre configuración y auditoría                      | Escrituras aceptadas en una transacción; evento rechazado se registra con una transacción de auditoría separada antes de devolver el error.   |
| Reporte consulta datos no seleccionados                            | El orquestador decide las secciones antes de ejecutar cada use case, no filtra únicamente al renderizar.                                      |
| DDL deja la migración a mitad por commits implícitos               | Tabla de progreso y etapas reanudables; cada lote de owners es idempotente y la etapa final valida conteos/constraints.                       |
| Tenant creado después del backfill no tiene configuración          | Provisioning lazy con `UNIQUE(owner_id)` y defaults materializados en el primer get/policy/trigger.                                           |
| Recipient removido queda bloqueado por una unique histórica        | Hard delete transaccional; la unique completa `(owner_id, normalized_email)` representa solo filas activas.                                   |

## Testing Strategy

### Backend

- Domain: normalización de email, límites/allowlist de contenido, invariantes de
  destinatarios y secciones, nueve códigos y versionado monotónico.
- Application: permiso/tenant, lectura default/backfill, actualización atómica,
  conflicto 409, publicación de términos, auditoría accepted/rejected y
  política por cada trigger.
- Integration: aislamiento entre dos empresas, recipient list externa sin
  acceso, migración/backfill, aceptación vinculada a versión inicial y nueva,
  reportes que omiten queries de secciones desactivadas, y todos los
  consumidores de email.
- No se agregan tests propios para modelos Sequelize, barrels, DI o rutas sin
  lógica, conforme al Principio V.

### Frontend

- Hooks/mutations: invalidación de cache, `isPending`, conflicto, retry y
  no-duplicación de guardados.
- Components/page: rutas agrupadas por audiencia, summary sin depender de
  color, chips/empty recipient, editor counters/preview, confirmación legal,
  loading/error/empty/saving/success y responsive desktop/mobile.
- Playwright: admin autorizado, usuario sin permiso, dos empresas, cambios sin
  guardar, publicación de términos y navegación móvil sin doble árbol React.

## Definition of Done

- [ ] Migración y backfill idempotentes, con aceptaciones históricas vinculadas a la versión inicial.
- [ ] `pendiente.sql` ejecutado y validado por etapas; la migración runtime permanece alineada con el archivo operativo.
- [ ] Todas las queries y escrituras son tenant-scoped desde `RequestContext`.
- [ ] `get`, `update`, `publishTerms`, `getAudit` y política de entrega documentados y testeados.
- [ ] Los nueve triggers respetan estado, audiencia y destinatarios vigentes.
- [ ] Reporte matutino solo consulta/renderiza secciones elegidas; mantiene horario fijo.
- [ ] Contenido validado/sanitizado y términos versionados sin pérdida de historial.
- [ ] Concurrencia optimista y auditoría accepted/rejected funcionando.
- [ ] Frontend implementa la torre de control, rail origen→destino, tokens, estados UX y responsive definidos.
- [ ] `pnpm tsc`, `pnpm lint` y `pnpm test` pasan; Playwright cubre quickstart.
- [ ] `AGENTS.md`, `docs/email-notifications.md` y artefactos de esta feature actualizados.
