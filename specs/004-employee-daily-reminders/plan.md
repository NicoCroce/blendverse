# Implementation Plan: Employee Daily Reminders

**Branch**: `004-employee-daily-reminders` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-employee-daily-reminders/spec.md`

## Summary

Implementar recordatorios por email para empleados en MacroGest. Dos canales:

1. **Batch diario**: todos los días a las 9:00 AM (hora Argentina), cada empleado activo con email válido y al menos un pendiente recibe **un email individual con su lista** de hasta 4 pendientes: (a) documentos sin firmar (`firmado IS NULL`), (b) términos y condiciones sin aceptar (sin registro en `disclaimer_firmas`), (c) renovar contraseña (`renovar_clave = true`), (d) documentos sin visualizar (`visualizado IS NULL`). Sin pendientes → sin email (FR-008).
2. **Notificación en tiempo real**: cuando un documento se ingresa y queda asignado a un empleado, se envía un email inmediato (evento de ingreso), independiente del batch (FR-011..FR-016).

**Enfoque técnico**: Crear el dominio `EmployeeReminders` que orquesta casos de uso de dominios existentes vía inyección de dependencias (`cross-domain-relations`): reutiliza `GetAllActiveOwners` (Users), `GetEmployeesByCompany` (Disclaimer, aporta `renovar_clave` y `estado_firma`) y un nuevo `GetPendingDocumentsByEmployee` (Documents). El scheduler replica `DailyReport.scheduler` con `node-cron` `0 9 * * *` timezone `America/Argentina/Buenos_Aires`. Los emails usan la infraestructura existente (`MailNotificationService`) con dos templates nuevos. La notificación en tiempo real se materializa creando el punto de ingreso canónico `IngestDocument` en el dominio `Documents` (ver Technical Context y D1 en `research.md`). Sin UI. Sin cambios de data-model (`ultimo_login` queda fuera).

## Technical Context

**Language/Version**: TypeScript 6.x estricto

**Primary Dependencies**:

- `node-cron` (existente, `^4.6.0`) — scheduler
- `nodemailer` (existente) — envío de emails
- `sequelize` (existente) — ORM para queries
- `awilix` (existente) — inyección de dependencias
- `pino` (existente) — logging

**Storage**: MySQL (Sequelize v6). Sin nuevas tablas. Solo lecturas sobre modelos existentes (`documentos`, `usuarios`, `disclaimer_firmas`) + una escritura de ingreso de documento (`documentos`) para materializar el hook de notificación.

**Testing**: Vitest 2 (unit + integration)

**Target Platform**: Node.js backend (Express 5) + scheduler in-process

**Project Type**: Web service (backend API + scheduler + emails)

**Performance Goals**:

- SC-001: 100% de los empleados con pendientes recibe su email en ≤15 min tras las 9:00 AM.
- SC-005: la ejecución del batch no degrada el resto del sistema.

**Constraints**:

- Multi-tenant: batch por empresa (`id_propietario`), fallos aislados por empresa (FR-003) y por empleado (FR-003).
- Timezone: `America/Argentina/Buenos_Aires` explícito (FR-001).
- Envío SOLO con pendientes (FR-008); omisión de empleados sin email válido con log (FR-009).
- La notificación inmediata no bloquea el ingreso (FR-015) y no reintenta (assumption).

**Scale/Scope**:

- ~10-50 empresas activas (estimado inicial); varios empleados por empresa.
- 4 pendientes por empleado; 1 email por empleado con pendientes.
- 1 notificación inmediata por evento de ingreso (agrupando documentos nuevos del mismo empleado).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                                                                                                                                                                                         | Status  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| I. Arquitectura Hexagonal / DDD | Nuevo dominio `EmployeeReminders` con 5 capas + barriles puros (index público re-exporta `./Infrastructure/Routes`). Sigue la estructura de 003 (`DailyReport`).                                                                               | ✅ PASS |
| II. Multi-Tenant Obligatorio    | Toda query filtra por `ownerId`. El scheduler itera owners y crea `RequestContext` sintético por owner. Sin `id_propietario` en inputs de cliente.                                                                                             | ✅ PASS |
| III. TypeScript Estricto + Zod  | Sin `any`; DTOs de salida con interfaces tipadas; inputs solo sintéticos. Zod en procedures.                                                                                                                                                   | ✅ PASS |
| IV. Flujo de Agentes Orquestado | Back-only: `@blendverse-implement` → `@blendverse-back` → `@blendverse-tester` → `@blendverse-qa` → `@blendverse-reviewer`.                                                                                                                    | ✅ PASS |
| V. Tests por Regla de Negocio   | `@blendverse-tester` generará tests por regla: (1) `GetPendingDocumentsByEmployee` (#1/#4), (2) ensamblado de pendientes (renovar + términos), (3) `shouldSend`, (4) `IngestDocument` + notificación, (5) service multi-tenant, (6) scheduler. | ✅ PASS |
| VI. Conventional Commits        | Scope: `employee-reminders` (ej: `feat(employee-reminders): add daily reminders scheduler`).                                                                                                                                                   | ✅ PASS |
| VII. Aislamiento de Domains     | `EmployeeReminders` inyecta use cases de Documents/Disclaimer/Users vía DI (sin repos directos). `_ingestDocument` (Documents) inyecta `_notifyNewDocument` (Employee).                                                                        | ✅ PASS |

**Violaciones**: Ninguna.

## Project Structure

### Documentation (this feature)

```text
specs/004-employee-daily-reminders/
├── plan.md               # This file
├── research.md           # Phase 0 output
├── data-model.md         # Phase 1 output (DTOs + tablas)
├── quickstart.md         # Phase 1 output (guía de validación)
├── contracts/            # Phase 1 output (interfaces de casos de uso)
└── tasks.md              # Phase 2 output (no creado por /speckit.plan)
```

### Source Code (repository root)

```text
packages/server/src/
├── domains/
│   ├── EmployeeReminders/                          # NUEVO DOMINIO
│   │   ├── Domain/
│   │   │   ├── EmployeeReminder.entity.ts           # DTO de salida (no persistente)
│   │   │   ├── EmployeePendingSection.types.ts       # Tipos de pendientes por empleado
│   │   │   ├── EmployeeEmailSender.port.ts           # Puerto hexagonal para emails
│   │   │   └── index.ts
│   │   ├── Application/
│   │   │   ├── UseCases/
│   │   │   │   ├── GenerateDailyReminder.usecase.ts      # Orquestador por empleado
│   │   │   │   ├── SendEmployeeReminderEmail.usecase.ts  # Envía email de pendientes
│   │   │   │   ├── NotifyNewDocument.usecase.ts          # Notificación inmediata
│   │   │   │   └── index.ts
│   │   │   ├── employeeReminders.types.ts
│   │   │   ├── EmployeeReminders.service.ts               # owners→empleados, resiliencia
│   │   │   └── index.ts
│   │   ├── Infrastructure/
│   │   │   ├── Controllers/
│   │   │   │   ├── EmployeeReminders.controller.ts
│   │   │   │   └── index.ts
│   │   │   ├── Email/
│   │   │   │   ├── EmployeeEmailSender.implementation.ts
│   │   │   │   └── index.ts
│   │   │   ├── Scheduler/
│   │   │   │   ├── EmployeeReminders.scheduler.ts    # node-cron 0 9 * * * (Bs As)
│   │   │   │   └── index.ts
│   │   │   ├── Routes/
│   │   │   │   ├── EmployeeReminders.routes.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── employeeReminders.di.ts                   # Registro Awilix
│   │   └── index.ts                                # Barrel (./Infrastructure/Routes + .di)
│   │
│   ├── Documents/                                  # EXISTENTE — agregar métodos
│   │   ├── Domain/
│   │   │   ├── Document.repository.ts               # + getPendingDocumentsByEmployee
│   │   │   │                                          # + createDocuments
│   │   ├── Application/UseCases/
│   │   │   ├── GetPendingDocumentsByEmployee.usecase.ts   # NUEVO
│   │   │   ├── IngestDocument.usecase.ts                   # NUEVO (punto de ingreso)
│   │   │   └── ...
│   │   └── Infrastructure/Database/
│   │       └── DocumentsRepository.implementation.ts       # Implementar nuevos métodos
│   │
│   ├── Disclaimer/   # EXISTENTE — sin cambios (reusa _getEmployeesByCompany)
│   ├── Users/        # EXISTENTE — sin cambios (reusa _getAllActiveOwners)
│   └── ...
├── Infrastructure/
│   └── utils/
│       └── Email/
│           ├── Templates/
│           │   ├── employeeDailyReminder.template.ts   # NUEVO
│           │   ├── newDocumentNotification.template.ts # NUEVO
│           │   └── index.ts                            # registrar en emailTemplates
└── index.ts                                   # inicializar EmployeeRemindersScheduler
```

**Structure Decision**: Nuevo dominio `EmployeeReminders` que orquesta consultas de `Documents`, `Disclaimer` y `Users` vía DI. Scheduler en `Infrastructure/Scheduler/`. Sin entidades persistentes nuevas; DTOs de salida + una escritura de ingreso (`documentos`). El hook de notificación real-time nace en `Documents/Application/UseCases/IngestDocument.usecase.ts`.

## Implementation Phases

### Phase 1: Foundation (P1) — Dominio + Scheduler + email batch

**Objetivo**: scheduler que corre a las 9 AM, genera el reminder por empleado y envía el email individual.

1. **Crear dominio `EmployeeReminders`** con estructura de 5 capas (barriles limpios).
2. **DTOs de salida**: `EmployeeReminder.entity.ts` + `employeeReminders.types.ts` (pendientes, `shouldSend`, identidad del empleado, empresa).
3. **Puerto de email**: `Domain/EmployeeEmailSender.port.ts`.
4. **`GenerateDailyReminder.usecase.ts`**: por owner itera empleados (vía `_getEmployeesByCompany`) y por empleado consulta `_getPendingDocumentsByEmployee`; calcula `shouldSend` (≥1 pendiente). Reutiliza `renovar_clave` y `estado_firma` del record de empleado.
5. **`SendEmployeeReminderEmail.usecase.ts`**: si `shouldSend`, renderiza template y envía por el puerto.
6. **`EmployeeReminders.service.ts`**: `sendDailyReminders()` → `_getAllActiveOwners`, loop por owner con `RequestContext` sintético y loop por empleado con `try/catch`; retorna `{ sent, skipped, failed }`.
7. **`EmployeeReminders.scheduler.ts`**: cron `0 9 * * *` timezone `America/Argentina/Buenos_Aires`, con `init()`/`stop()`. Registro en `index.ts`.
8. **Template `employeeDailyReminder`**: solo secciones con pendientes; reutiliza `formatDateEs`/`emailFooter`. Registrado en `emailTemplates`.

**Entregable**: batch funcional: cada empleado con pendientes recibe su email; sin pendientes no envía; resiliencia por empresa y por empleado; log de omisiones.

### Phase 2: Notificación en tiempo real (P1) — hook de ingreso

**Objetivo**: email inmediato cuando un documento se ingresa y queda asignado a un empleado.

1. **`Document.repository.ts`** (Documents): agregar `getPendingDocumentsByEmployee({ employeeId, ownerId, requestContext })` (flags `isSignedPending`/`isUnviewed`) y `createDocuments({ documents, requestContext })` (insert de fila por documento, owner-scoped).
2. **`GetPendingDocumentsByEmployee.usecase.ts`** (Documents): expone la consulta por empleado (DI: `_getPendingDocumentsByEmployee`).
3. **`IngestDocument.usecase.ts`** (Documents): recibe la lista de documentos a ingresar (con `employeeId`, `tipo`, `titulo`, `archivo`, `extension`, segmentos opcionales). Persiste con `fecha_de_subida = now`. Si hay `employeeId` → invoca `_notifyNewDocument` en `try/catch` (FR-015); sin `employeeId` no notifica (FR-014).
4. **`NotifyNewDocument.usecase.ts`** (EmployeeReminders): recibe empleado + lista de `documentId`+`titulo`, arma UN email por empleado (FR-013) y lo envía por el puerto. Sin email válido → log + skip (FR-014); error → log sin relanzar (FR-015).
5. **Template `newDocumentNotification`** registrado en `emailTemplates`.

**Validación manual**: crear un documento asignado a un empleado → email inmediato; re-correr el batch al día siguiente → aparece como pendiente (convivencia FR-016).

### Phase 3: Integration (P2) — Registro global + controller + polish

1. **DI**: `employeeReminders.di.ts` registra service, use cases, scheduler, controller, `EmployeeEmailSender`. No re-registrar use cases de otros dominios.
2. **Actualizar barrels y `documents.di.ts`** (→ `_getPendingDocumentsByEmployee`, `_ingestDocument`).
3. **Registro global**: spread `employeeRemindersApp` en `register.ts`; rutas en `Router.ts` y `DocumentsRoutes.ts`.
4. **Controller manual trigger**: `EmployeeRemindersController.sendDailyReminders` (mutation) para testing/debug (replica `DailyReport.generateManual`).
5. **Index**: `employeeRemindersScheduler().init()` junto al scheduler del reporte diario.

**Entregable**: dominio registrado, accesible; scheduler y controller listos.

## Technical Decisions

### 1. ¿Por qué un nuevo dominio `EmployeeReminders` y no agregar lógica a `DailyReport`?

**Decisión**: dominio dedicado.

**Rationale**: `DailyReport` (003) es el reporte de **admins** (un email por empresa con 7 secciones); este feature es el **recordatorio individual por empleado** (un email por persona, misma hora de disparo). Son negocios distintos aunque comparten scheduler y queries. Se evita inflar `DailyReport` con dos audiencias opuestas.

**Alternativas**: agregar a `DailyReport` (mezcla audiencias), servicio standalone (rompe hexagonal).

### 2. ¿Cómo capturar el pendiente de documentos sin duplicar queries?

**Decisión**: un único `getPendingDocumentsByEmployee` devuelve por empleado los docs con `firmado IS NULL` O `visualizado IS NULL`, con flags `isUnsigned`/`isUnviewed`. `GenerateDailyReminder` separa ambas para #1 y #4. No se reutiliza `GetUnsignedDocuments` (003) porque agrega `requiere_firma` y es por empresa.

**Rationale**: fiel al spec (`firmado IS NULL`, `visualizado IS NULL`); una consulta para ambos pendientes.

**Alternativas**: consultas separadas, o reutilizar `GetUnsignedDocuments` y filtrar en memoria (semántica distinta, costoso). Se descartan.

### 3. ¿Cómo materializar el trigger de notificación de tiempo real?

Dado que `Documents` no tiene procedimiento de creación, se crea `IngestDocument` como punto único de ingreso (persistencia + `fecha_de_subida = now` + asignación `Usuario_id`) y de ahí se dispara `_notifyNewDocument`. Detalles en D1 de `research.md` y Risks.

### 4. ¿Cómo reutilizar los pendientes de la cuenta sin query nueva?

- **Renovar contraseña**: `renovar_clave` viene en `IEmployeeRecord` de `_getEmployeesByCompany`.
- **Términos sin aceptar**: `estado_firma` de `_getEmployeesByCompany` (Pendiente/Corrupto = sin aceptar).
- Solo los pendientes de documentos requieren query nueva (Documents).

### 5. ¿Qué pasa si un owner se procesa lento o falla?

Cada paso (owner/empleado) corre en `try/catch`; un fallo aísla solo a esa empresa y no bloquea a las demás (FR-003). Procesamiento secuencial; si crece el volumen se puede migrar a `Promise.all` por owner como mejora futura.

## Complexity Tracking

No hay violaciones de la constitución que justificar. El `cross-domain` entre Documents y EmployeeReminders está documentado en research.md (sección 5) y no rompe los principios VI/VII.

## Dependencies

### Existentes (sin instalación)

- `node-cron` (^4.6.0), `nodemailer`, `sequelize`, `awilix`, `pino`, `zod`.

### Nuevas dependencias

- Ninguna. Todo se resuelve con el stack actual.

## Risks and Mitigations

### Risk 1: No existe flujo de ingreso/re-asignación de documentos

**Mitigación**: crear `IngestDocument` como punto canónico. La re-asignación de un documento existente (documento nuevo para un segundo empleado) no tiene flujo propio hoy; se documenta como extension point: deberá invocar el mismo `_notifyNewDocument`. Alcance cubre la primera asignación (creación) — D1 de research.md.

### Risk 2: Fallo SMTP en la notificación inmediata

**Mitigación**: `_notifyNewDocument` se llama en `try/catch` dentro de `IngestDocument`; ante fallo se registra y el ingreso sigue. El documento queda pendiente y el batch lo cubre al día seguir (FR-015).

### Risk 3: Empleado sin email válido

**Mitigación**: se omite el envío y se registra con identidad del empleado y motivo (FR-009). Sin reintentos en la notificación inmediata (assumption).

### Risk 4: Crecimiento del volumen

**Mitigación**: procesamiento secuencial con aislamiento; `RequestContext` sintéticos por owner evitan colisiones. Si crece, migrar a worker/queue (igual que plan 003).

### Risk 5: Ciclo de dependencias Documents ↔ EmployeeReminders

**Mitigación**: no es un ciclo de resolución DI (research sección 5). Awilix `InjectionMode.CCLASSIC` resuelve a demanda; sin repos de otros dominios (Principio VII).

## Testing Strategy

### Unit Tests

1. **`GetPendingDocumentsByEmployee`**: doc sin firmar (`isUnsigned=true`), doc visualizado (`isUnviewed=false`), doc que cumple ambos, solo del propio empleado (el ajeno NO aparece).
2. **`GenerateDailyReminder`**: empleado con 4 pendientes → los 4 aparecen + `shouldSend=true`; sin pendientes → `shouldSend=false`.
3. **`SendEmployeeReminderEmail`**: solo envía si `shouldSend`; sin email → skip+log.
4. **`NotifyNewDocument`**: agrupa varios documentos en UN email; sin email → skip+log; error del puerto → no relanza.
5. **`IngestDocument`**: persiste e invoca notify; fallo de notify no bloquea la persistencia.
6. **`EmployeeRemindersService`**: 3 owners, falla B → A y C completan (resiliencia).
7. **`EmployeeRemindersScheduler`**: `init` idempotente (no duplica), cron y timezone correctos.

### Integration

- End-to-end del batch: scheduler → service → email (mock SMTP).
- Multi-tenant: cada owner lleva su `RequestContext`.

### QA

- `pnpm tsc`, `pnpm lint`, `pnpm test`.
- Estructura de 5 capas del dominio.

## Definition of Done

- [ ] Scheduler `0 9 * * *` America/Argentina/Buenos_Aires, inicializado al arrancar (FR-001/FR-010).
- [ ] Email individual por empleado solo con ≥1 pendiente (FR-002/FR-008).
- [ ] 4 pendientes correctos (FR-004/FR-005/FR-006/FR-007).
- [ ] Iteración por empresa + aislamiento de fallos (FR-003).
- [ ] Errores y omisiones logueados con identidad + motivo (FR-009).
- [ ] Notificación de tiempo real por evento de ingreso; agrupa multi-doc en uno (FR-011/FR-013).
- [ ] Notificación omitida sin email (FR-014) y fallo no bloquea (FR-015).
- [ ] Convivencia batch + notificación verificada (FR-016).
- [ ] `ingestDocument` tRPC documentado y testeado.
- [ ] Tests unit + integration passing; `tsc`/`lint` limpios.
- [ ] Documentación actualizada (plan, data-model, contracts).
