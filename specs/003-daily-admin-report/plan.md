# Implementation Plan: Daily Admin Report

**Branch**: `003-daily-admin-report` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-daily-admin-report/spec.md`

## Summary

Implementar un sistema de reporte diario automático que se envía por email a los administradores de cada empresa a las 9:00 AM (hora Argentina). El reporte incluye 7 secciones: empleados de licencia hoy, licencias pendientes de aprobación, documentos sin firmar, términos y condiciones sin aceptar, vacaciones próximas (15 días), licencias que vencen esta semana, y resumen estadístico.

**Enfoque técnico**: Crear un nuevo dominio `DailyReport` que orquesta casos de uso de dominios existentes (Certificates, Documents, Disclaimer, Users, Permissions) vía inyección de dependencias (patrón cross-domain-relations). El scheduler usa `node-cron` con timezone `America/Argentina/Buenos_Aires`. El email se genera con templates HTML en `EmailsTemplates.ts` y se envía usando `MailNotificationService.send()` existente.

## Technical Context

**Language/Version**: TypeScript 6.x estricto

**Primary Dependencies**:

- `node-cron` (nuevo) — scheduler ligero in-process
- `nodemailer` (existente) — envío de emails
- `sequelize` (existente) — ORM para queries
- `awilix` (existente) — inyección de dependencias
- `pino` (existente) — logging

**Storage**: MySQL (Sequelize v6) — sin nuevas tablas, solo queries de lectura sobre modelos existentes

**Testing**: Vitest 2 (unit + integration)

**Target Platform**: Node.js backend server (Express 5)

**Project Type**: Web service (backend API + scheduler)

**Performance Goals**:

- SC-001: 100% de empresas activas reciben reporte en ≤15 min después de 9:00 AM
- SC-005: Sin degradación del rendimiento del servidor principal

**Constraints**:

- Multi-tenant: reporte independiente por empresa (`id_propietario`)
- Timezone: `America/Argentina/Buenos_Aires` explícito
- Resiliencia: fallo en una empresa no bloquea las demás (FR-012)

**Scale/Scope**:

- ~10-50 empresas activas (estimado inicial)
- 7 secciones de reporte por empresa
- 1 email por empresa (batch a todos los admins de esa empresa)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                       | Verificación requerida                                                                                                             | Status  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- |
| I. Arquitectura Hexagonal / DDD | Nuevo dominio `DailyReport` con 5 capas (Domain, Application, Infrastructure, Presentation, DI). Sigue estructura existente.       | ✅ PASS |
| II. Multi-Tenant Obligatorio    | Toda query filtra por `ownerId`. El scheduler itera sobre todos los owners activos y crea un `RequestContext` por cada uno.        | ✅ PASS |
| III. TypeScript Estricto + Zod  | DTOs de salida definidos con interfaces TypeScript (no hay input de cliente, solo salida). Sin `any`.                              | ✅ PASS |
| IV. Flujo de Agentes Orquestado | Back-only: `@blendverse-implement` → `@blendverse-back` → `@blendverse-tester` → `@blendverse-qa` → `@blendverse-reviewer`.        | ✅ PASS |
| V. Tests por Regla de Negocio   | `@blendverse-tester` generará tests para: (1) cada use case de sección, (2) orquestador del reporte, (3) scheduler initialization. | ✅ PASS |
| VI. Conventional Commits        | Scope: `daily-report` (ej: `feat(daily-report): add scheduler and report generation`).                                             | ✅ PASS |
| VII. Aislamiento de Dominios    | `DailyReport` importa casos de uso de otros dominios vía DI (no repositorios directos). Patrón `cross-domain-relations`.           | ✅ PASS |

**Violaciones**: Ninguna.

## Project Structure

### Documentation (this feature)

```text
specs/003-daily-admin-report/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (DTOs de salida)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (interfaces de use cases)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/server/src/
├── domains/
│   ├── DailyReport/                          # NUEVO DOMINIO
│   │   ├── Domain/
│   │   │   ├── DailyReport.entity.ts         # DTO de salida (no persistente)
│   │   │   ├── DailyReport.types.ts          # Interfaces de secciones
│   │   │   ├── DailyReport.repository.ts     # Puerto abstracto (si aplica)
│   │   │   └── index.ts
│   │   ├── Application/
│   │   │   ├── UseCases/
│   │   │   │   ├── GetEmployeesOnLeaveToday.usecase.ts
│   │   │   │   ├── GetPendingLicenses.usecase.ts
│   │   │   │   ├── GetUnsignedDocuments.usecase.ts
│   │   │   │   ├── GetPendingDisclaimerAcceptances.usecase.ts
│   │   │   │   ├── GetUpcomingVacations.usecase.ts
│   │   │   │   ├── GetExpiringLicenses.usecase.ts
│   │   │   │   ├── GetStatisticalSummary.usecase.ts
│   │   │   │   ├── GenerateDailyReport.usecase.ts  # Orquestador
│   │   │   │   └── index.ts
│   │   │   ├── dailyReport.types.ts          # Input/Output types
│   │   │   ├── DailyReport.service.ts        # Orquesta use cases
│   │   │   └── index.ts
│   │   ├── Infrastructure/
│   │   │   ├── Controllers/
│   │   │   │   ├── DailyReport.controller.ts # tRPC procedures (manual trigger)
│   │   │   │   └── index.ts
│   │   │   ├── Scheduler/
│   │   │   │   ├── DailyReport.scheduler.ts  # node-cron job
│   │   │   │   └── index.ts
│   │   │   ├── Routes/
│   │   │   │   ├── DailyReport.routes.ts     # tRPC router
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── dailyReport.di.ts                 # Awilix registration
│   │   └── index.ts                          # Barrel export
│   │
│   ├── Certificates/                         # EXISTENTE — agregar métodos
│   │   ├── Domain/
│   │   │   ├── Certificate.repository.ts     # Agregar: getEmployeesOnLeaveToday, getPendingLicenses, getUpcomingVacations, getExpiringLicenses
│   │   │   └── ...
│   │   └── Infrastructure/
│   │       └── Database/
│   │           └── CertificateRepository.implementation.ts  # Implementar nuevos métodos
│   │
│   ├── Documents/                            # EXISTENTE — agregar métodos
│   │   ├── Domain/
│   │   │   ├── Document.repository.ts        # Agregar: getUnsignedDocuments
│   │   │   └── ...
│   │   └── Infrastructure/
│   │       └── Database/
│   │           └── DocumentRepository.implementation.ts  # Implementar nuevos métodos
│   │
│   ├── Disclaimer/                           # EXISTENTE — agregar métodos
│   │   ├── Domain/
│   │   │   ├── Disclaimer.repository.ts      # Agregar: getEmployeesWithoutDisclaimerAcceptance
│   │   │   └── ...
│   │   └── Infrastructure/
│   │       └── Database/
│   │           └── DisclaimerRepository.implementation.ts  # Implementar nuevos métodos
│   │
│   ├── Users/                                # EXISTENTE — agregar métodos
│   │   ├── Domain/
│   │   │   ├── User.repository.ts            # Agregar: getAllActiveOwners (distinct id_propietario)
│   │   │   └── ...
│   │   └── Infrastructure/
│   │       └── Database/
│   │           └── UsersRepository.implementation.ts  # Implementar nuevos métodos
│   │
│   └── Permissions/                          # EXISTENTE — sin cambios (getAdmins ya existe)
│
├── Infrastructure/
│   └── utils/
│       └── Email/
│           └── EmailsTemplates.ts            # Agregar: dailyReport template
│
└── index.ts                                  # Inicializar scheduler al arrancar
```

**Structure Decision**: Nuevo dominio `DailyReport` que orquesta casos de uso de dominios existentes vía DI. El scheduler vive en `Infrastructure/Scheduler/` del dominio `DailyReport`. No se crean nuevas entidades persistentes, solo DTOs de salida.

## Implementation Phases

### Phase 1: Foundation (P1)

**Objetivo**: Scheduler + estructura básica del dominio + envío de email con template básico.

1. **Instalar `node-cron`**: `pnpm add node-cron` en `packages/server`.
2. **Crear dominio `DailyReport`**: estructura de carpetas con 5 capas.
3. **Definir DTOs de salida**: `DailyReport.entity.ts` y `DailyReport.types.ts` con interfaces para las 7 secciones.
4. **Definir puerto `DailyReportEmailSender`**: interfaz en `Domain/DailyReportEmailSender.port.ts` para abstraer el envío de emails (arquitectura hexagonal).
5. **Implementar scheduler**: `DailyReport.scheduler.ts` con `node-cron` configurado a las 9:00 AM `America/Argentina/Buenos_Aires`.
6. **Agregar método `getAllActiveOwners()`**: en `UsersRepository` para obtener todos los `id_propietario` distintos.
7. **Implementar `GetAllActiveOwners.usecase.ts`**: caso de uso que llama al repositorio de usuarios.
8. **Implementar `GenerateDailyReportStub.usecase.ts`**: orquestador stub que genera un reporte básico con placeholders para las 7 secciones (sin datos reales). Esto permite entregar Phase 1 sin depender de los use cases de secciones que se implementan en Phases 2-3.
9. **Implementar `SendReportEmail.usecase.ts`**: usa el puerto `DailyReportEmailSender` para enviar el email (no depende directamente de infraestructura).
10. **Implementar `DailyReport.service.ts`**: servicio que coordina la iteración sobre owners y el envío de emails.
11. **Implementar `DailyReportEmailSender.implementation.ts`**: implementación del puerto en Infrastructure que usa `MailNotificationService`.
12. **Agregar template HTML en `EmailsTemplates.ts`**: `dailyReport()` con estructura básica (placeholder para las 7 secciones).
13. **Inicializar scheduler en `index.ts`**: llamar a `DailyReportScheduler.init()` después de `registerDI()`.

**Entregable**: Scheduler corre a las 9 AM, genera un email básico (con placeholders) y lo envía a los admins de cada empresa.

### Phase 2: Foundational (DI + Registration)

**Objetivo**: Configurar DI y registro global del dominio.

1. **Configurar DI en `dailyReport.di.ts`**: registrar use cases, service, controller, scheduler, y el puerto `DailyReportEmailSender` con su implementación.
2. **Crear barrel exports**: `Domain/index.ts`, `Application/index.ts`, `Infrastructure/index.ts`, y root `index.ts`.
3. **Registro global**: actualizar `register.ts` y `Router.ts` para incluir `DailyReport`.
4. **Implementar `DailyReport.controller.ts`**: tRPC procedure para trigger manual (testing/debug).
5. **Implementar `DailyReport.routes.ts`**: tRPC router del dominio.

**Entregable**: Dominio `DailyReport` completamente registrado en el contenedor DI y accesible vía tRPC.

### Phase 3: Main Sections (P2)

**Objetivo**: Implementar las 4 secciones principales + resiliencia.

1. **Sección 1: Empleados de licencia hoy**:
   - Agregar método `getEmployeesOnLeaveToday()` en `CertificateRepository`.
   - Implementar `GetEmployeesOnLeaveToday.usecase.ts`.
   - Query: `startDate <= hoy <= endDate AND status = 'aprobado'`.

2. **Sección 2: Licencias pendientes de aprobación**:
   - Agregar método `getPendingLicenses()` en `CertificateRepository`.
   - Implementar `GetPendingLicenses.usecase.ts`.
   - Query: `status = 'pendiente'`.

3. **Sección 3: Documentos sin firmar**:
   - Agregar método `getUnsignedDocuments()` en `DocumentRepository`.
   - Implementar `GetUnsignedDocuments.usecase.ts`.
   - Query: `requireSign = true AND signed IS NULL`.

4. **Sección 4: Términos y condiciones sin aceptar**:
   - Agregar método `getEmployeesWithoutDisclaimerAcceptance()` en `DisclaimerRepository`.
   - Implementar `GetPendingDisclaimerAcceptances.usecase.ts`.
   - Query: empleados activos que NO tienen registro en `DisclaimerAcceptance` para su empresa.

5. **Resiliencia multi-tenant**:
   - Implementar manejo de errores por empresa en `DailyReport.service.ts`.
   - Si una empresa falla, continuar con las demás (FR-012).
   - Logging de errores con `ownerId` y motivo (FR-013).

6. **Actualizar template HTML**: agregar las 4 secciones al template `dailyReport()`.

7. **Reemplazar `GenerateDailyReportStub` por `GenerateDailyReport` completo**: ahora que existen los 4 use cases de secciones principales, el orquestador puede inyectarlos y generar el reporte real.

**Entregable**: Reporte completo con las 4 secciones principales + resiliencia multi-tenant.

### Phase 4: Additional Sections (P3)

**Objetivo**: Implementar las 3 secciones restantes + resumen estadístico.

1. **Sección 5: Vacaciones próximas (15 días)**:
   - Agregar método `getUpcomingVacations()` en `CertificateRepository`.
   - Implementar `GetUpcomingVacations.usecase.ts`.
   - Query: `tipo_certificados.id = 1 AND description LIKE '%vacaciones%' AND startDate BETWEEN hoy AND hoy+15 dias AND status = 'aprobado'`.

2. **Sección 6: Licencias que vencen esta semana**:
   - Agregar método `getExpiringLicenses()` en `CertificateRepository`.
   - Implementar `GetExpiringLicenses.usecase.ts`.
   - Query: `endDate BETWEEN hoy AND hoy+7 dias AND status = 'aprobado'`.

3. **Sección 7: Resumen estadístico**:
   - Implementar `GetStatisticalSummary.usecase.ts`.
   - Totales: empleados activos, licencias en curso, licencias pendientes, documentos sin firmar, términos pendientes.
   - Reutilizar métodos de las secciones anteriores para contar.

4. **Actualizar template HTML**: agregar las 3 secciones restantes al template `dailyReport()`.

5. **Actualizar `GenerateDailyReport`**: inyectar los 3 use cases restantes para generar el reporte completo con las 7 secciones.

**Entregable**: Reporte completo con las 7 secciones.

## Technical Decisions

### 1. ¿Por qué `node-cron` y no un sistema de colas distribuido (Bull, RabbitMQ)?

**Decisión**: Usar `node-cron` para el scheduler.

**Rationale**:

- El spec asume que el servidor está corriendo continuamente (no hay mecanismo de catch-up).
- `node-cron` es ligero, in-process, y suficiente para un solo job diario.
- No hay necesidad de distribución ni retry complejo en esta primera versión.
- Si el número de empresas crece significativamente (>100), se puede migrar a un sistema de colas en el futuro.

**Alternativas consideradas**:

- **Bull/BullMQ**: más robusto (retries, delayed jobs, distributed), pero overkill para un solo job diario.
- **RabbitMQ/Celery**: requiere infraestructura adicional, no justificado para este caso.
- **Cron externo (sistema operativo)**: menos portable, más difícil de monitorear.

### 2. ¿Por qué HTML strings en `EmailsTemplates.ts` y no un template engine (Handlebars, Pug)?

**Decisión**: Usar HTML strings con interpolación de variables (patrón existente).

**Rationale**:

- Consistencia con el patrón existente en `EmailsTemplates.ts` (todos los templates actuales son HTML strings).
- Simplicidad: no requiere dependencias adicionales ni build step.
- Suficiente para el nivel de complejidad del template (tablas, listas, formato básico).
- Los templates son mantenibles y legibles para este caso de uso.

**Alternativas consideradas**:

- **Handlebars/Mustache**: más potente (loops, condicionales), pero requiere dependencias adicionales y no justificado para este caso.
- **React Email/JSX**: más declarativo, pero requiere build step y es overkill.
- **Pug/Sass**: requiere compilación, no justificado.

### 3. ¿Por qué un nuevo dominio `DailyReport` y no agregar lógica a un dominio existente?

**Decisión**: Crear un nuevo dominio `DailyReport`.

**Rationale**:

- El reporte es cross-domain: necesita datos de Certificates, Documents, Disclaimer, Users.
- No encaja naturalmente en ningún dominio existente (no es "Certificate", no es "Document", etc.).
- Sigue el principio de single responsibility: el dominio `DailyReport` es responsable de generar y enviar el reporte diario.
- Facilita el testing y el mantenimiento (código cohesivo).
- El scheduler vive en este dominio porque es parte de la lógica de "cuándo" generar el reporte.

**Alternativas consideradas**:

- **Agregar a `Certificates`**: no encaja, porque el reporte incluye documentos, términos, etc.
- **Agregar a `Application/Services`**: rompe el principio de que `Application/` global es transversal, no contiene lógica de negocio.
- **Crear un servicio standalone fuera de dominios**: rompe la arquitectura hexagonal.

### 4. ¿Por qué DTOs de salida y no entidades persistentes?

**Decisión**: Usar DTOs de salida (no persistentes) para las secciones del reporte.

**Rationale**:

- El spec no requiere persistir el reporte (solo se envía por email).
- Los DTOs son más simples y no requieren migraciones de base de datos.
- Si en el futuro se necesita persistir, se puede agregar una entidad `DailyReport` con tabla propia.

### 5. ¿Cómo manejar el multi-tenant en el scheduler?

**Decisión**: Iterar sobre todos los `id_propietario` activos y crear un `RequestContext` por cada uno.

**Rationale**:

- El scheduler no tiene un `RequestContext` asociado (no hay usuario autenticado).
- Necesitamos generar un reporte independiente por empresa.
- Creamos un `RequestContext` sintético con `ownerId` para cada empresa.
- Esto permite reutilizar los casos de uso existentes que esperan un `RequestContext`.

**Implementación**:

```typescript
const owners = await this._getAllActiveOwners.execute({
  requestContext: systemContext,
});
for (const owner of owners) {
  try {
    const ownerContext = RequestContext.create(owner.id);
    const report = await this._generateReport.execute({
      requestContext: ownerContext,
    });
    await this._sendReportEmail.execute({
      report,
      requestContext: ownerContext,
    });
  } catch (error) {
    logger.error(
      { ownerId: owner.id, error },
      'Failed to generate/send report for owner',
    );
    // Continuar con el siguiente owner (FR-012)
  }
}
```

### 6. ¿Cómo identificar las vacaciones?

**Decisión**: Usar `tipo_certificados.id = 1` AND `description LIKE '%vacaciones%'`.

**Rationale**:

- El spec indica que las vacaciones se identifican por ambos criterios (FR-009).
- Esto es consistente con la estructura de datos existente.
- Si en el futuro hay otros tipos de vacaciones con diferente ID, se puede ajustar la query.

### 7. ¿Dónde inicializar el scheduler?

**Decisión**: En `packages/server/src/index.ts`, después de `registerDI()`.

**Rationale**:

- El scheduler necesita acceso al contenedor DI para resolver dependencias.
- Debe inicializarse después de que todos los dominios estén registrados.
- Debe inicializarse antes de `app.listen()` para que esté activo cuando el servidor empiece a aceptar requests.

**Implementación**:

```typescript
const { registerDI } = await import('./Infrastructure/di/register.js');
const { InstanceMainRouter } = await import('./Infrastructure/Routes/Router.js');
const { DailyReportScheduler } = await import('./domains/DailyReport/Infrastructure/Scheduler');

registerDI(app);
InstanceMainRouter(app);

// Inicializar scheduler
const scheduler = app.container.resolve<DailyReportScheduler>('dailyReportScheduler');
scheduler.init();

relateModels();
connect();

app.listen(port, () => { ... });
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No hay violaciones. Todos los principios de la constitución se cumplen.

## Dependencies

### Nuevas dependencias

- `node-cron`: scheduler ligero in-process. Instalar en `packages/server`.
- `@types/node-cron`: tipos TypeScript para `node-cron`. Instalar en `packages/server` como devDependency.

### Dependencias existentes (sin cambios)

- `nodemailer`: envío de emails.
- `sequelize`: ORM para queries.
- `awilix`: inyección de dependencias.
- `pino`: logging.
- `zod`: validación de schemas (aunque no se usa en este feature porque no hay input de cliente).

## Risks and Mitigations

### Risk 1: El servidor está caído a las 9 AM

**Mitigación**: El spec asume que no hay mecanismo de catch-up. El reporte se enviará al día siguiente. Si se necesita catch-up en el futuro, se puede agregar un mecanismo de "última ejecución" en base de datos.

### Risk 2: Una empresa tiene muchos empleados y la consulta es lenta

**Mitigación**: Cada empresa se procesa de forma independiente y secuencial. Si una consulta tarda, retrasa el envío de esa empresa pero no de las demás (FR-012). Si el número de empresas crece significativamente (>100), se puede optimizar con procesamiento paralelo en el futuro.

### Risk 3: Error SMTP al enviar el email

**Mitigación**: `MailNotificationService.send()` ya maneja errores de envío por lote (acumula resultados y errores). El scheduler captura errores por empresa y continúa con las demás (FR-012, FR-013).

### Risk 4: Los datos de licencias, documentos y términos están desactualizados

**Mitigación**: El spec asume que los datos están actualizados y son consistentes. No se requiere validación de integridad de datos como parte de esta feature.

## Testing Strategy

### Unit Tests

1. **Use cases de secciones**: testear cada use case con datos de prueba (mock de repositorio).
2. **Orquestador `GenerateDailyReport`**: testear que itera sobre todos los owners y genera reporte por cada uno.
3. **Scheduler**: testear que se inicializa correctamente y que el cron job está configurado con el timezone correcto.

### Integration Tests

1. **End-to-end del reporte**: testear que el scheduler dispara el job, genera el reporte y lo envía por email (mock de SMTP).
2. **Multi-tenant**: testear que cada empresa recibe su reporte independiente.
3. **Resiliencia**: testear que si una empresa falla, las demás reciben su reporte.

### QA Validation

1. **TypeScript check**: `pnpm tsc` sin errores.
2. **ESLint**: `pnpm lint` sin errores.
3. **Vitest**: `pnpm test` con todos los tests pasando.
4. **Estructura de carpetas**: verificar que el dominio `DailyReport` sigue la estructura de 5 capas.

## Definition of Done

- [ ] Scheduler configurado a las 9:00 AM `America/Argentina/Buenos_Aires`.
- [ ] Scheduler se inicializa al arrancar el servidor.
- [ ] Reporte se genera por cada empresa activa.
- [ ] Las 7 secciones del reporte están implementadas y correctas.
- [ ] Email se envía a todos los admins de cada empresa.
- [ ] Template HTML es responsive y legible.
- [ ] Resiliencia multi-tenant: fallo en una empresa no bloquea las demás.
- [ ] Logging de errores con `ownerId` y motivo.
- [ ] Controller tRPC para trigger manual (testing/debug).
- [ ] Tests unitarios e integration pasando.
- [ ] TypeScript check y ESLint sin errores.
- [ ] Documentación actualizada (este plan, data-model.md, contracts/).
