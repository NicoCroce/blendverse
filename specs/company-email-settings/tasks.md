---
description: 'Task list for Company Email Settings implementation'
---

# Tasks: Company Email Settings

**Sources**: `spec.md`, `plan.md`, `data-model.md`, `contracts/`, `frontend-design.md`, `research.md`, `quickstart.md`, and Constitution v3.0.0.

## Review Workload Forecast

Estimated changed lines: 1,100–1,700. 400-line budget risk: High. Chained PRs recommended: Yes. Decision needed before apply: Yes. Chain strategy: pending.

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

| Unit | Deliverable                                                     | Focused verification           | Runtime harness                         | Rollback boundary           |
| ---- | --------------------------------------------------------------- | ------------------------------ | --------------------------------------- | --------------------------- |
| PR1  | Contract, staged migration, domain, lazy provisioning and `get` | migration/resume + `pnpm test` | MySQL copy with two owners              | migration/domain files only |
| PR2  | `update`, policy, contexts and existing triggers                | policy/integration Vitest      | scheduler, manual trigger and SMTP sink | update/policy adapters      |
| PR3  | Frontend tower and content/terms flows                          | Testing Library + Playwright   | desktop/mobile admin flow               | app domain and Admin route  |
| PR4  | `getAudit`, audit wiring, docs and rollout                      | full quality gates             | quickstart sections 1–13                | audit/docs/rollout changes  |

## Phase 1: Setup

- [ ] T001 Add `sanitize-html` to `packages/server/package.json` and `pnpm-lock.yaml`; verify the dependency resolves without changing unrelated packages. **Deps**: none.
- [ ] T002 Adapt the operations-contract reader/generator boundary in `.opencode/scripts/` and `.opencode/skills/back-ddd-generator/` so `get`, `update`, `publishTerms` and `getAudit` remain in `apiOperations` while only CRUD scaffolding is generated. **Deps**: none.
- [ ] T003 [P] Create the backend domain structure under `packages/server/src/domains/CompanyEmailSettings/` with `Domain/`, `Application/`, `Infrastructure/Controllers/`, `Infrastructure/Database/`, `Infrastructure/Routes/`, specs, `companyEmailSettings.di.ts` and a route-only public barrel; verify no `Presentation/` directory or infrastructure-wide export is introduced. **Deps**: none.
- [ ] T004 [P] Create the frontend skeleton under `packages/app/src/Domains/CompanyEmailSettings/` with service, inferred entity, routes, router, hooks, components, pages and specs; verify it compiles without defining manual server DTOs. **Deps**: none.

## Phase 2: Foundational — migration, domain and execution context

- [ ] T005 Create `company_email_migration_state` and staged migration helpers in `packages/server/src/migrations/002_company_email_settings.sql`, mirroring every operator command in `specs/company-email-settings/pendiente.sql`; verify stages are `pending`, `schema_ready`, `owners_backfilled`, `acceptances_linked`, `constraints_hardened` and `completed`. **Deps**: T003.
- [ ] T006 Implement the idempotent schema stage in `002_company_email_settings.sql`: new tables/indexes, nullable `disclaimer_firmas.terms_version_id`, owner uniques and audit storage; verify each DDL substep can be rerun after an implicit MySQL commit. **Deps**: T005.
- [ ] T007 Implement the resumable owners stage in `002_company_email_settings.sql`: ascending owner batches with independent transactions, version-1 terms from `texto_disclaimer`, nine active deliveries, seven active sections and valid deduplicated role-1 recipients; verify `last_owner_id` advances only after a committed batch. **Deps**: T006.
- [ ] T008 Implement the acceptances stage in `002_company_email_settings.sql`; link every existing `disclaimer_firmas` row to its owner’s imported terms version 1, preserve acceptance metadata and verify no mass re-acceptance is required. **Deps**: T007.
- [ ] T009 Implement the constraints and completion stages in `002_company_email_settings.sql`; replace the legacy acceptance unique key, enforce `terms_version_id NOT NULL`, validate counts/hashes and mark `completed` only after every owner is consistent. **Deps**: T008.
- [ ] T010 [P] Add migration integration tests in `packages/server/src/migrations/specs/company-email-settings-migration.spec.ts` for interruption after DDL, interruption after an owner batch, rerun/resume, duplicate prevention, acceptance linkage and final constraints; verify incomplete runs never report `completed`. **Deps**: T005-T009.
- [ ] T011 [P] Define stable catalog/section constants and pure value objects under `packages/server/src/domains/CompanyEmailSettings/Domain/` for email normalization, content allowlists/limits, versions and aggregate invariants; verify all nine catalog codes and seven section codes are exhaustive. **Deps**: T001, T003.
- [ ] T012 Define repository/audit ports and Zod-derived application types in `Domain/CompanyEmailSettings.repository.ts`, `Domain/CompanyEmailSettingsAudit.repository.ts` and `Application/companyEmailSettings.types.ts`; verify no input accepts `ownerId`, `id_empresa` or `id_propietario`. **Deps**: T011.
- [ ] T013 Implement Sequelize models and tenant-scoped repository adapters under `packages/server/src/domains/CompanyEmailSettings/Infrastructure/Database/`; verify every read, write, unique lookup and audit query uses `RequestContext.values.ownerId`, with transactional collection replacement primitives. **Deps**: T006, T012.
- [ ] T014 Wire `dashboard-access`, generic foreign-tenant errors, Awilix registrations and route registration in `companyEmailSettings.di.ts`, `packages/server/src/domains/register.ts` and `packages/server/src/Infrastructure/Routes/Router.ts`; verify controller dependencies resolve by exact DI key. **Deps**: T003, T012-T013.
- [ ] T015 Implement `EnsureCompanyEmailSettings` under `Application/UseCases/` and its repository provisioning path; verify lazy, idempotent creation for new owners materializes root version 1, nine deliveries, seven sections, legacy terms and valid admin recipients under `UNIQUE(owner_id)` and records `lazy_provision`. **Deps**: T011-T014.
- [ ] T016 Define scheduler/manual context adapters in the relevant `DailyReport`, `EmployeeReminders` and application service areas; verify schedulers enumerate owners with `RequestContext(0, requestId, 0)` then use one synthetic owner context, while manual tRPC triggers use only authenticated context and never accept an owner id. **Deps**: T014-T015.

## Phase 3: User Story 1 — Consultar configuración (P1) — MVP

**Goal**: expose a complete tenant snapshot, including lazy defaults, through `companyEmailSettings.get` and the initial tower view.

**Independent test**: an authorized admin reads configured and unprovisioned tenants; an employee or foreign tenant receives the same generic denial and no partial snapshot.

- [ ] T017 [P] [US1] Add application/integration tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/GetCompanyEmailSettings.usecase.spec.ts` for `get`, defaults, lazy provisioning, permission denial, foreign-tenant denial and complete snapshot shape; verify concrete A/B data never crosses. **Deps**: T010, T014-T016.
- [ ] T018 [US1] Implement `GetCompanyEmailSettings.usecase.ts`, service and `companyEmailSettings.get` procedure in `Infrastructure/Controllers/CompanyEmailSettings.controller.ts`; verify the response contains version, nine routes, recipients, seven sections, welcome message, sanitized current terms, diagnostics and `updatedAt`. **Deps**: T017.
- [ ] T019 [US1] Call `EnsureCompanyEmailSettings` from `get` and expose the same provisioning guard for policy/jobs without accepting a client owner; verify concurrent first reads produce one root and one `lazy_provision` event. **Deps**: T015, T018.
- [ ] T020 [US1] Implement `CompanyEmailSettings.service.ts`, inferred `CompanyEmailSettings.entity.ts`, `useGetCompanyEmailSettings.ts` and cache helpers under `packages/app/src/Domains/CompanyEmailSettings/`; verify outputs use `inferRouterOutputs` and query errors never expose partial data. **Deps**: T004, T018.
- [ ] T021 [US1] Build the initial summary and delivery-route presentation in `Pages/CompanyEmailSettings.page.tsx` and `Components/`; verify every route shows audience, origin, destination, trigger, `Activo/Inactivo`, recipients, current terms version and operational diagnostics. **Deps**: T020.

## Phase 4: User Story 6 — Guardar cambios atómicamente (P1)

**Goal**: implement `companyEmailSettings.update` as the complete optimistic preferences write; it MUST NOT publish terms.

**Independent test**: one save changes routes, recipients, sections and welcome message atomically; a stale second save returns 409 and `update` leaves the legal terms version unchanged.

- [ ] T022 [P] [US6] Add RED/application tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/UpdateCompanyEmailSettings.usecase.spec.ts` for complete draft validation, all routes/sections exactly once, invalid content, empty admin combinations, persistence rollback, accepted/rejected audit and `update` not publishing terms. **Deps**: T012-T014.
- [ ] T023 [US6] Implement `UpdateCompanyEmailSettings.usecase.ts`, Zod input and `companyEmailSettings.update` controller in `Infrastructure/Controllers/CompanyEmailSettings.controller.ts`; verify full validation/sanitization occurs before writing and response returns saved snapshot, `savedVersion` and `savedAt`. **Deps**: T022.
- [ ] T024 [US6] Implement update transaction mapping in `CompanyEmailSettingsRepository.implementation.ts`; verify conditional `owner_id/version` update, collection replacement, audit success/rejection and `STALE_CONFIGURATION` 409 leave the last valid snapshot intact. **Deps**: T013, T023.
- [ ] T025 [US6] Implement the frontend draft/save hook under `packages/app/src/Domains/CompanyEmailSettings/Hooks/`; verify dirty state, cache invalidation, `expectedVersion`, retry/conflict reload, save lock and no duplicate mutation on repeated clicks. **Deps**: T020, T023.
- [ ] T026 [US6] Add concrete two-session and controlled-persistence-failure integration tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/`; verify no partial settings, no terms publication, and no emails use an uncommitted draft. **Deps**: T023-T025.

## Phase 5: User Story 2 — Activar/desactivar envíos (P1)

**Goal**: apply one tenant-scoped delivery policy to every catalog code and existing producer.

**Independent test**: disable each code for company A, trigger its event, then re-enable it; only A’s enabled events send and company B is unchanged.

- [ ] T027 [P] [US2] Add policy tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/ResolveEmailDeliveryPolicy.usecase.spec.ts` for all nine codes, disabled no-send, admin recipients, employee/requester recipients, no-recipient diagnostics and owner isolation; verify disabled policy prevents any sender call. **Deps**: T018, T024.
- [ ] T028 [US2] Implement `ResolveEmailDeliveryPolicy.usecase.ts` and DI exposure; verify it ensures lazy provisioning, returns `enabled`, permitted recipients, selected sections and welcome message, and never resolves another owner’s recipients. **Deps**: T015, T027.
- [ ] T029 [US2] Update `packages/server/src/Application/Services/SendEmail.service.ts` and Certificates/Documents producer paths to gate license, signature, assignment and manual requester codes; verify each producer passes the stable catalog code and manual mail remains requester-scoped, not admin-list-scoped. **Deps**: T028.
- [ ] T030 [US2] Update `packages/server/src/domains/Disclaimer/`, `DailyReport/` and `EmployeeReminders/` producer/scheduler/manual paths; verify policy is resolved with a per-owner scheduler context, authenticated manual context, fixed 9 AM timezone, and no external owner iteration. **Deps**: T016, T028.
- [ ] T031 [US2] Update `docs/email-notifications.md` with all nine codes, policy gate, runtime context rules, recipient source, no-recipient diagnostic and requester exception; verify documentation matches every producer. **Deps**: T029-T030.

## Phase 6: User Story 3 — Gestionar destinatarios (P1)

**Goal**: manage external/internal admin recipients with normalization, hard delete and no application access.

**Independent test**: add, duplicate, reject and hard-delete a recipient in A, trigger admin mail, re-add it, and verify only the current A row is used.

- [ ] T032 [P] [US3] Add domain/application tests in `packages/server/src/domains/CompanyEmailSettings/**/specs/` for trim/lowercase, invalid email, duplicate email, external address, active-admin-without-recipient, all routes disabled and tenant isolation; verify rejected drafts preserve the prior snapshot. **Deps**: T011-T013, T022.
- [ ] T033 [US3] Implement recipient collection replacement in `CompanyEmailSettingsRepository.implementation.ts`; verify removals are transactional hard deletes, no `deleted_at` exists, `UNIQUE(owner_id, normalized_email)` permits a later re-add, and audit stores only hashes/counts. **Deps**: T024, T032.
- [ ] T034 [US3] Build recipient chips/editor/empty state under `packages/app/src/Domains/CompanyEmailSettings/Components/Recipients/`; verify add/remove, full email display, validation feedback and amber risk state use project wrappers and loading behavior. **Deps**: T025, T033.
- [ ] T035 [US3] Add integration coverage for external delivery plus hard-delete/re-add in `packages/server/src/domains/CompanyEmailSettings/Infrastructure/specs/`; verify the external address receives enabled admin mail but gains no User, token, permission or settings access. **Deps**: T028-T033.

## Phase 7: User Story 4 — Configurar reporte matutino (P1)

**Goal**: persist seven selected sections and avoid querying/rendering unselected data.

**Independent test**: select only `statistical_summary` and `pending_licenses`, run manual/cron report, and verify only those sections execute and render.

- [ ] T036 [P] [US4] Add section-rule tests in `packages/server/src/domains/CompanyEmailSettings/**/specs/` for exhaustive codes, active-report-without-section rejection, disabled-report preservation and selected-empty semantics; verify concrete unselected use cases are not called. **Deps**: T011, T022.
- [ ] T037 [US4] Refactor `packages/server/src/domains/DailyReport/` orchestration/template to resolve policy and sections before data use cases; verify unselected sections are neither queried nor rendered, selected-empty sections retain current semantics, and schedule/timezone remain fixed. **Deps**: T028, T030, T036.
- [ ] T038 [US4] Build morning-report controls under `packages/app/src/Domains/CompanyEmailSettings/Components/MorningReport/`; verify selection copy, disabled-report behavior, no schedule control and validation messages are accessible. **Deps**: T025, T036.
- [ ] T039 [US4] Add manual/cron report integration tests in `packages/server/src/domains/DailyReport/specs/`; verify exact selected-section output, no fallback data, correct owner context and no report send when the route is disabled. **Deps**: T016, T037.

## Phase 8: User Story 5 — Welcome message y términos (P1)

**Goal**: compose the institutional welcome message at runtime for eight automatic emails and publish legal terms through a separate operation.

**Independent test**: save a welcome message with `update`, generate all eight automatic emails and the requester manual email, then publish terms with `publishTerms`; verify the welcome preamble and legal version boundaries.

- [ ] T040 [P] [US5] Add decorator tests in `packages/server/src/Infrastructure/utils/Email/specs/InstitutionalWelcome.decorator.spec.ts` for `admin_license_created`, `employee_license_status_changed`, `employee_document_signed`, `admin_document_signed`, `employee_terms_reminder`, `admin_daily_report`, `employee_daily_reminder` and `employee_document_assigned`; verify insertion is before the rendered body, requester exclusion and legal `terms_content` preservation. **Deps**: T011, T024, T028.
- [ ] T041 [US5] Implement `InstitutionalWelcome.decorator.ts` under `packages/server/src/Infrastructure/utils/Email/` at the boundary after template rendering and immediately before `MailNotificationService.sendOne()`; verify null means unchanged, sanitized content is used, the eight capability codes are explicit, requester is unchanged, and subject/facts/legal body are protected. **Deps**: T040.
- [ ] T042 [US5] Wire the decorator and catalog code through `SendEmail.service.ts`, `DisclaimerEmail.service.ts`, `SendReportEmail`, `SendEmployeeReminderEmail` and `NotifyNewDocument`; verify every compatible producer decorates exactly once and `requester_document_manual` never receives it. **Deps**: T041.
- [ ] T043 [US5] Add runtime integration tests across all eight automatic producers plus `requester_document_manual` in their existing domain `specs/` folders; verify the decorator runs after template output and before `sendOne`, including the terms-reminder legal-body case. **Deps**: T042.
- [ ] T044 [P] [US5] Add terms tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/PublishTermsVersion.usecase.spec.ts` for confirmation, sanitization, monotonic version, SHA-256, duplicate hash, stale version, prior acceptance history and separation from `update`; verify `update` cannot create a legal version. **Deps**: T012, T022, T029.
- [ ] T045 [US5] Implement `PublishTermsVersion.usecase.ts` and `companyEmailSettings.publishTerms` in `Infrastructure/Controllers/CompanyEmailSettings.controller.ts`; verify explicit confirmation, own expectedVersion, atomic current-version advance, immutable prior version and `DUPLICATE_TERMS_CONTENT`. **Deps**: T044.
- [ ] T046 [US5] Update `packages/server/src/domains/Disclaimer/` models/use cases to obtain current terms cross-domain, require the displayed `termsVersion`, preserve historical rows and reject stale acceptance; verify backfilled version-1 acceptance and in-flight version capture. **Deps**: T008, T045.
- [ ] T047 [US5] Build welcome/terms editors and safe preview under `packages/app/src/Domains/CompanyEmailSettings/Components/Content/`; verify `update` saves only the welcome message, `publishTerms` has separate confirmation, counters/errors are accessible, and no audit-history UI is added. **Deps**: T025, T041, T045.

## Phase 9: User Story 7 — Estados, permisos y responsive (P1)

**Goal**: complete the accessible desktop/mobile tower of control with actionable state feedback.

**Independent test**: exercise loading, empty, query error, save, conflict, success and unsaved navigation at desktop/mobile widths without rendering a second hidden React tree.

- [ ] T048 [P] [US7] Add React Testing Library tests under `packages/app/src/Domains/CompanyEmailSettings/**/specs/` for skeletons, `EmptyScreenError` retry, contextual recipient empty, saving lock, visible success version/time, validation/conflict and focus/status text; verify no partial snapshot is shown. **Deps**: T020, T025, T034, T038, T047.
- [ ] T049 [US7] Complete the page hook and tower components in `Pages/CompanyEmailSettings.page.tsx` and `Components/`; verify summary, route rail, recipients, report and content zones use wrappers, `Button isLoading`, dirty banner, amber risk semantics and no audit UI. **Deps**: T034, T038, T047.
- [ ] T050 [US7] Implement desktop rail/mobile header branches with `useDevice()` and feature-scoped tokens; verify origin → destination → state order, WCAG contrast/focus, reduced-motion behavior, typography direction and exactly one responsive tree mount. **Deps**: T049.
- [ ] T051 [US7] Register routes/menu in `packages/app/src/Infrastructure/Routes.tsx` and `packages/app/src/Domains/Admin/{Admin.router.tsx,MenuAdmin.tsx}`; verify navigation is guarded by `dashboard-access` but direct server access remains authoritative and no `getAudit` UI route exists. **Deps**: T014, T050.
- [ ] T052 [US7] Add Playwright coverage for authorized/unauthorized users, two tenants, lazy first access, unsaved navigation, update/publishTerms confirmation and desktop/mobile rendering; verify no duplicate tree, no cross-tenant data and no audit screen. **Deps**: T051.

## Phase 10: User Story 8 — Auditor cambios (P2, API-only)

**Goal**: expose accepted/rejected tenant-scoped audit history for security/operations tooling, without frontend UI.

**Independent test**: perform accepted/rejected updates, publication, access denial, lazy provisioning and migration in two tenants; query `companyEmailSettings.getAudit` and verify scoped metadata without sensitive content.

- [ ] T053 [P] [US8] Add API contract/integration tests in `packages/server/src/domains/CompanyEmailSettings/Application/specs/GetCompanyEmailSettingsAudit.usecase.spec.ts` for pagination/filters, accepted/rejected actions, actor/owner/version/hash references, foreign-tenant denial and absence of full emails/content; verify no frontend audit view is required. **Deps**: T014, T024, T045.
- [ ] T054 [US8] Implement `GetCompanyEmailSettingsAudit.usecase.ts` and `companyEmailSettings.getAudit` protected procedure in `Infrastructure/Controllers/CompanyEmailSettings.controller.ts`; verify API-only exposure, `dashboard-access`, owner filter, generic foreign-tenant response and no recipient/content payloads. **Deps**: T053.
- [ ] T055 [US8] Wire audit events for settings, deliveries, recipients, sections, welcome message, terms, access rejection, `migration_backfill` and `lazy_provision`; verify accepted writes share the transaction, rejected attempts are recorded safely, and no audit route/component is added to the app. **Deps**: T010, T015, T024, T033, T045, T054.

## Phase 11: Polish and rollout

- [ ] T056 [P] Reconcile `docs/email-notifications.md`, `contracts/interfaces.md`, `contracts/operations.json` and runtime catalog documentation; verify all four operations, nine codes, eight decorator capabilities, requester exclusion and API-only audit scope are consistent. **Deps**: T031, T042, T054.
- [ ] T057 Execute `specs/company-email-settings/pendiente.sql` against a MySQL copy and run the staged migration snapshot/resume validation, then execute `pnpm tsc`, `pnpm lint`, `pnpm test` and `pnpm test:e2e`; verify quickstart sections 1–13 pass with concrete data, including scheduler/manual contexts and lazy provisioning. **Deps**: T010, T026, T035, T039, T043, T046, T052, T055.
- [ ] T058 Validate shadow/diagnostic policy mode if available, compare intended recipients/sections and verify no sender runs before policy resolution, no partial snapshot is served, and no requester manual email receives the welcome decorator. **Deps**: T029-T030, T042-T043, T057.

## Dependencies and execution order

Setup T001–T004 precedes foundational T005–T016. US1 establishes `get` and lazy provisioning; US6 must finish the shared atomic `update` before recipient, report and content stories. US2 then wires policy and contexts into every trigger; US3/US4 can proceed in parallel after T028/T024. US5 depends on update/policy and owns the decorator plus separate `publishTerms`. US7 depends on all editable frontend pieces. US8 is API-only and depends on every mutation/audit source. T056–T058 are final gates.

Parallel opportunities: T003/T004; T011/T012 after the contract boundary; T017/T022/T027/T032/T036/T040/T044/T048/T053 when their dependencies are complete; and T056 after all runtime integrations. Parallel tasks must not edit the same file.

## Implementation strategy

MVP is T001–T021: resumable migration, domain foundation, authorization, lazy defaults, `get` and the first tower snapshot. Deliver next T022–T031 for atomic update and all delivery gates, then T032–T047 for recipients/report/welcome/terms, T048–T052 for responsive UX, and T053–T058 for API audit, documentation and rollout verification. Do not enable runtime sends before T030/T042 and do not expose terms editing before T046.
