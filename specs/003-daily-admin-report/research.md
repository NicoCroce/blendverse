# Research: Daily Admin Report

**Feature**: `003-daily-admin-report` | **Date**: 2026-08-05

## Research Tasks

### 1. node-cron — API y configuración de timezone

**Decisión**: Usar `node-cron` con timezone `America/Argentina/Buenos_Aires`.

**Rationale**:

- `node-cron` soporta timezones nativamente vía opción `timezone` en `schedule()`.
- API simple: `cron.schedule(expression, callback, options)`.
- Expression para las 9:00 AM diario: `'0 9 * * *'`.
- No requiere dependencias adicionales (como `moment-timezone`).

**Ejemplo de uso**:

```typescript
import cron from 'node-cron';

cron.schedule(
  '0 9 * * *',
  () => {
    console.log('Running daily report job');
  },
  {
    timezone: 'America/Argentina/Buenos_Aires',
  },
);
```

**Alternativas consideradas**:

- **`cron` (npm)**: más maduro pero API más verbosa.
- **`agenda`**: requiere MongoDB, overkill.
- **`node-schedule`**: similar a `node-cron` pero menos mantenido.

**Conclusión**: `node-cron` es la opción más simple y adecuada para este caso.

---

### 2. Patrón de inicialización del scheduler en Express

**Decisión**: Inicializar el scheduler en `index.ts` después de `registerDI()`.

**Rationale**:

- El scheduler necesita acceso al contenedor DI para resolver dependencias.
- Debe inicializarse después de que todos los dominios estén registrados.
- Debe inicializarse antes de `app.listen()` para que esté activo cuando el servidor empiece a aceptar requests.

**Patrón existente en el proyecto**:

- `index.ts` ya tiene un patrón de inicialización asíncrona:
  ```typescript
  (async () => {
    const { registerDI } = await import('./Infrastructure/di/register.js');
    const { InstanceMainRouter } = await import('./Infrastructure/Routes/Router.js');

    registerDI(app);
    InstanceMainRouter(app);
    relateModels();
    connect();

    app.listen(port, () => { ... });
  })();
  ```

**Implementación propuesta**:

```typescript
(async () => {
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
})();
```

**Alternativas consideradas**:

- **Inicializar en `registerDI()`**: no es responsabilidad del registro DI.
- **Inicializar en un middleware**: se ejecutaría en cada request, no es lo que queremos.
- **Inicializar en un dominio existente (ej: `Certificates`)**: rompe single responsibility.

**Conclusión**: Inicializar en `index.ts` después de `registerDI()` es el patrón más limpio.

---

### 3. Patrón cross-domain-relations — Cómo orquestar casos de uso de múltiples dominios

**Decisión**: Usar inyección de dependencias para inyectar casos de uso de otros dominios en el dominio `DailyReport`.

**Rationale**:

- El dominio `DailyReport` necesita datos de Certificates, Documents, Disclaimer, Users.
- No puede importar repositorios de otros dominios (Pr. VII).
- Debe usar casos de uso exportados por otros dominios vía DI.

**Patrón existente en el proyecto**:

- `SendEmailService` ya usa este patrón:
  ```typescript
  export class SendEmailService {
    constructor(
      private readonly _getAdmins: GetAdmins, // Use case de Permissions
      private readonly _getUser: GetUser, // Use case de Users
      private readonly mailNotificationService: MailNotificationService,
    ) {}
  }
  ```

**Implementación propuesta**:

```typescript
export class GenerateDailyReport implements IUseCase<DailyReport> {
  constructor(
    private readonly _getEmployeesOnLeaveToday: GetEmployeesOnLeaveToday,
    private readonly _getPendingLicenses: GetPendingLicenses,
    private readonly _getUnsignedDocuments: GetUnsignedDocuments,
    private readonly _getPendingDisclaimerAcceptances: GetPendingDisclaimerAcceptances,
    private readonly _getUpcomingVacations: GetUpcomingVacations,
    private readonly _getExpiringLicenses: GetExpiringLicenses,
    private readonly _getStatisticalSummary: GetStatisticalSummary,
    private readonly _getAllActiveOwners: GetAllActiveOwners,
  ) {}

  async execute({ requestContext }: IGenerateDailyReport): Promise<DailyReport> {
    // Orquestar todos los use cases
    const [employeesOnLeave, pendingLicenses, ...] = await Promise.all([
      this._getEmployeesOnLeaveToday.execute({ requestContext }),
      this._getPendingLicenses.execute({ requestContext }),
      ...
    ]);

    return DailyReport.create({ ... });
  }
}
```

**Conclusión**: El patrón cross-domain-relations es el correcto y ya está establecido en el proyecto.

---

### 4. Queries de base de datos — Cómo implementar cada sección

#### Sección 1: Empleados de licencia hoy

**Query**:

```sql
SELECT c.*, u.nombre, u.apellido, ct.name as type_name
FROM certificados c
JOIN usuarios u ON c.id_usuario = u.id
JOIN tipo_certificados ct ON c.id_tipo_certificado = ct.id
WHERE c.id_propietario = :ownerId
  AND c.estado = 'aprobado'
  AND c.fecha_inicio <= :today
  AND c.fecha_fin >= :today
  AND c.deleted_at IS NULL
```

**Método de repositorio**: `getEmployeesOnLeaveToday({ requestContext })`.

**Consideraciones**:

- Usar `Op.lte` y `Op.gte` de Sequelize para las comparaciones de fechas.
- Incluir `UserModel` y `CertificateTypesModel` para obtener nombre del empleado y tipo de licencia.
- Filtrar por `deletedAt IS NULL` (paranoid mode).

---

#### Sección 2: Licencias pendientes de aprobación

**Query**:

```sql
SELECT c.*, u.nombre, u.apellido, ct.name as type_name,
       DATEDIFF(:today, c.created_at) as days_since_request
FROM certificados c
JOIN usuarios u ON c.id_usuario = u.id
JOIN tipo_certificados ct ON c.id_tipo_certificado = ct.id
WHERE c.id_propietario = :ownerId
  AND c.estado = 'pendiente'
  AND c.deleted_at IS NULL
ORDER BY c.created_at ASC
```

**Método de repositorio**: `getPendingLicenses({ requestContext })`.

**Consideraciones**:

- Calcular `days_since_request` en la query o en el use case.
- Ordenar por `created_at ASC` para mostrar las más antiguas primero.

---

#### Sección 3: Documentos sin firmar

**Query**:

```sql
SELECT d.*, u.nombre, u.apellido
FROM documentos d
JOIN usuarios u ON d.id_usuario = u.id
WHERE d.id_propietario = :ownerId
  AND d.requiere_firma = true
  AND d.fecha_firma IS NULL
  AND d.deleted_at IS NULL
```

**Método de repositorio**: `getUnsignedDocuments({ requestContext })`.

**Consideraciones**:

- El campo `view` indica si el empleado vio el documento (fecha de visualización o null).
- Mostrar estado "Visto" si `view` tiene fecha, "No visto" si es null.

---

#### Sección 4: Términos y condiciones sin aceptar

**Query**:

```sql
SELECT u.id, u.nombre, u.apellido, u.email
FROM usuarios u
WHERE u.id_propietario = :ownerId
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM disclaimer_acceptances da
    WHERE da.id_usuario = u.id
      AND da.id_empresa = :ownerId
  )
```

**Método de repositorio**: `getEmployeesWithoutDisclaimerAcceptance({ requestContext })`.

**Consideraciones**:

- Usar `NOT EXISTS` o `LEFT JOIN ... WHERE da.id IS NULL`.
- Filtrar solo empleados activos (`deletedAt IS NULL`).

---

#### Sección 5: Vacaciones próximas (15 días)

**Query**:

```sql
SELECT c.*, u.nombre, u.apellido, ct.name as type_name,
       s.nombre as segment_name
FROM certificados c
JOIN usuarios u ON c.id_usuario = u.id
JOIN tipo_certificados ct ON c.id_tipo_certificado = ct.id
LEFT JOIN user_segments us ON us.id_usuario = u.id
LEFT JOIN segments s ON s.id = us.id_segmento
WHERE c.id_propietario = :ownerId
  AND c.id_tipo_certificado = 1
  AND ct.description LIKE '%vacaciones%'
  AND c.estado = 'aprobado'
  AND c.fecha_inicio BETWEEN :today AND :todayPlus15Days
  AND c.deleted_at IS NULL
```

**Método de repositorio**: `getUpcomingVacations({ requestContext })`.

**Consideraciones**:

- Usar `Op.between` para el rango de fechas.
- Incluir `SegmentModel` para obtener el sector/segmento del empleado.
- Si un empleado tiene múltiples segmentos, mostrar el primero encontrado.

---

#### Sección 6: Licencias que vencen esta semana

**Query**:

```sql
SELECT c.*, u.nombre, u.apellido, ct.name as type_name
FROM certificados c
JOIN usuarios u ON c.id_usuario = u.id
JOIN tipo_certificados ct ON c.id_tipo_certificado = ct.id
WHERE c.id_propietario = :ownerId
  AND c.estado = 'aprobado'
  AND c.fecha_fin BETWEEN :today AND :todayPlus7Days
  AND c.deleted_at IS NULL
```

**Método de repositorio**: `getExpiringLicenses({ requestContext })`.

**Consideraciones**:

- Usar `Op.between` para el rango de fechas.
- Incluir licencias que vencen hoy (`fecha_fin = today`).

---

#### Sección 7: Resumen estadístico

**Query**: Múltiples queries o una query consolidada.

**Opción 1: Queries separadas** (más simple, más legible):

```typescript
const [
  activeEmployees,
  licensesInProgress,
  pendingLicenses,
  unsignedDocuments,
  pendingDisclaimers,
] = await Promise.all([
  this.userRepository.countActiveEmployees({ requestContext }),
  this.certificateRepository.countLicensesInProgress({ requestContext }),
  this.certificateRepository.countPendingLicenses({ requestContext }),
  this.documentRepository.countUnsignedDocuments({ requestContext }),
  this.disclaimerRepository.countPendingDisclaimers({ requestContext }),
]);
```

**Opción 2: Query consolidada** (más eficiente, más compleja):

```sql
SELECT
  (SELECT COUNT(*) FROM usuarios WHERE id_propietario = :ownerId AND deleted_at IS NULL) as active_employees,
  (SELECT COUNT(*) FROM certificados WHERE id_propietario = :ownerId AND estado = 'aprobado' AND fecha_inicio <= :today AND fecha_fin >= :today AND deleted_at IS NULL) as licenses_in_progress,
  (SELECT COUNT(*) FROM certificados WHERE id_propietario = :ownerId AND estado = 'pendiente' AND deleted_at IS NULL) as pending_licenses,
  (SELECT COUNT(*) FROM documentos WHERE id_propietario = :ownerId AND requiere_firma = true AND fecha_firma IS NULL AND deleted_at IS NULL) as unsigned_documents,
  (SELECT COUNT(*) FROM usuarios u WHERE u.id_propietario = :ownerId AND u.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM disclaimer_acceptances da WHERE da.id_usuario = u.id AND da.id_empresa = :ownerId)) as pending_disclaimers
```

**Decisión**: Opción 1 (queries separadas) por simplicidad y mantenibilidad. El rendimiento es aceptable para el volumen de datos esperado.

**Método de repositorio**: `getStatisticalSummary({ requestContext })` en cada repositorio (Certificates, Documents, Disclaimer, Users).

---

### 5. Template HTML — Estructura y estilo

**Decisión**: Usar HTML strings con tablas para el layout (patrón existente en `EmailsTemplates.ts`).

**Estructura propuesta**:

```html
<h1>Reporte Diario — {companyName}</h1>
<p>Fecha: {date}</p>

<h2>1. Empleados de licencia hoy</h2>
<table>
  <thead>
    <tr>
      <th>Empleado</th>
      <th>Tipo de licencia</th>
      <th>Fecha de inicio</th>
      <th>Fecha de fin</th>
      <th>Fecha de reintegro</th>
    </tr>
  </thead>
  <tbody>
    {rows}
  </tbody>
</table>
<p>{emptyMessage}</p>

<!-- Repetir para las 7 secciones -->

<hr />
<p>
  Este mail fue enviado de forma automática por
  <strong
    ><a href="https://docs.macrosistemas.ar/" target="_blank" rel="nofollow"
      >GestDoc</a
    ></strong
  >
</p>
```

**Estilos**:

- Usar estilos inline (compatibilidad con clientes de email).
- Tablas con bordes simples, padding, y colores consistentes con la marca.
- Responsive: usar `width: 100%` y `max-width` para que se adapte a móviles.

**Consideraciones**:

- Los clientes de email (Gmail, Outlook) no soportan CSS externo ni `<style>` en `<head>`.
- Usar estilos inline para máxima compatibilidad.
- Probar el template en múltiples clientes de email (Gmail, Outlook, Apple Mail).

---

### 6. Manejo de errores — Resiliencia multi-tenant

**Decisión**: Capturar errores por empresa y continuar con las demás.

**Patrón**:

```typescript
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
    logger.info({ ownerId: owner.id }, 'Daily report sent successfully');
  } catch (error) {
    logger.error(
      { ownerId: owner.id, error },
      'Failed to generate/send daily report',
    );
    // Continuar con el siguiente owner (FR-012)
  }
}
```

**Consideraciones**:

- Usar `logger.error()` con `ownerId` y `error` para debugging (FR-013).
- No lanzar excepción si una empresa falla (el scheduler debe continuar).
- Si todas las empresas fallan, el proceso completa sin excepción no manejada (US-9, escenario 2).

---

### 7. Testing — Estrategia

**Unit Tests**:

1. **Use cases de secciones**: mock de repositorio, verificar que la query es correcta.
2. **Orquestador `GenerateDailyReport`**: mock de use cases, verificar que se llaman en el orden correcto.
3. **Scheduler**: verificar que `cron.schedule()` se llama con los parámetros correctos.

**Integration Tests**:

1. **End-to-end del reporte**: mock de SMTP, verificar que el email se envía.
2. **Multi-tenant**: crear 2 empresas, verificar que cada una recibe su reporte.
3. **Resiliencia**: simular fallo en una empresa, verificar que las demás reciben su reporte.

**QA Validation**:

1. `pnpm tsc` sin errores.
2. `pnpm lint` sin errores.
3. `pnpm test` con todos los tests pasando.
4. Estructura de carpetas correcta.

---

## Summary of Decisions

| Decisión                                                                   | Rationale                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `node-cron` para scheduler                                                 | Ligero, in-process, soporta timezones nativamente      |
| HTML strings en `EmailsTemplates.ts`                                       | Consistencia con patrón existente, simple, suficiente  |
| Nuevo dominio `DailyReport`                                                | Cross-domain, single responsibility, facilita testing  |
| DTOs de salida (no persistentes)                                           | No se requiere persistir el reporte                    |
| Iterar sobre owners con `RequestContext` sintético                         | Reutiliza casos de uso existentes, multi-tenant seguro |
| Vacaciones: `tipo_certificados.id = 1 AND description LIKE '%vacaciones%'` | Consistente con spec y estructura de datos             |
| Inicializar scheduler en `index.ts` después de `registerDI()`              | Necesita acceso a DI, patrón limpio                    |
| Queries separadas para resumen estadístico                                 | Simplicidad y mantenibilidad, rendimiento aceptable    |
| Estilos inline en template HTML                                            | Compatibilidad con clientes de email                   |
| Capturar errores por empresa y continuar                                   | Resiliencia multi-tenant (FR-012)                      |
