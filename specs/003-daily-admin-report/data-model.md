# Data Model: Daily Admin Report

**Feature**: `003-daily-admin-report` | **Date**: 2026-08-05

## Overview

Esta feature **no crea entidades persistentes nuevas**. Solo define DTOs de salida (no persistentes) que representan las 7 secciones del reporte diario. Los datos se obtienen de entidades existentes (Certificate, Document, User, DisclaimerAcceptance, CertificateType, Segment) mediante queries de lectura.

## DTOs de Salida

### DailyReport (raíz)

DTO que agrupa las 7 secciones del reporte para una empresa específica.

```typescript
export interface IDailyReport {
  ownerId: number;
  companyName: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  sections: {
    employeesOnLeaveToday: EmployeesOnLeaveTodaySection;
    pendingLicenses: PendingLicensesSection;
    unsignedDocuments: UnsignedDocumentsSection;
    pendingDisclaimerAcceptances: PendingDisclaimerAcceptancesSection;
    upcomingVacations: UpcomingVacationsSection;
    expiringLicenses: ExpiringLicensesSection;
    statisticalSummary: StatisticalSummarySection;
  };
}
```

---

### Sección 1: Empleados de licencia hoy

```typescript
export interface EmployeesOnLeaveTodaySection {
  items: EmployeeOnLeaveItem[];
  totalCount: number;
}

export interface EmployeeOnLeaveItem {
  employeeId: number;
  employeeName: string; // "Nombre Apellido"
  licenseType: string; // Nombre del tipo de licencia
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  returnDate: string; // ISO 8601 (YYYY-MM-DD)
}
```

**Fuente de datos**: `Certificate` (status = 'aprobado', startDate <= hoy <= endDate) + `User` + `CertificateType`.

**Validaciones**:

- `employeeName` no vacío.
- `startDate`, `endDate`, `returnDate` en formato ISO 8601.
- `licenseType` corresponde a un `CertificateType` válido.

---

### Sección 2: Licencias pendientes de aprobación

```typescript
export interface PendingLicensesSection {
  items: PendingLicenseItem[];
  totalCount: number;
}

export interface PendingLicenseItem {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  startDate: string;
  endDate: string;
  daysSinceRequest: number; // Días transcurridos desde la creación
}
```

**Fuente de datos**: `Certificate` (status = 'pendiente') + `User` + `CertificateType`.

**Validaciones**:

- `daysSinceRequest >= 0`.
- Items ordenados por `daysSinceRequest` descendente (más antiguas primero).

---

### Sección 3: Documentos sin firmar

```typescript
export interface UnsignedDocumentsSection {
  items: UnsignedDocumentItem[];
  totalCount: number;
}

export interface UnsignedDocumentItem {
  documentId: number;
  documentTitle: string;
  employeeId: number;
  employeeName: string;
  viewStatus: 'Visto' | 'No visto'; // Basado en el campo `view`
}
```

**Fuente de datos**: `Document` (requireSign = true, signed = null) + `User`.

**Validaciones**:

- `viewStatus` es 'Visto' si `Document.view` tiene fecha, 'No visto' si es null.
- `documentTitle` no vacío.

---

### Sección 4: Términos y condiciones sin aceptar

```typescript
export interface PendingDisclaimerAcceptancesSection {
  items: PendingDisclaimerAcceptanceItem[];
  totalCount: number;
}

export interface PendingDisclaimerAcceptanceItem {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
}
```

**Fuente de datos**: `User` (activos que NO tienen registro en `DisclaimerAcceptance` para su empresa).

**Validaciones**:

- `employeeEmail` es un email válido.
- No duplicados (un empleado aparece una sola vez).

---

### Sección 5: Vacaciones próximas (15 días)

```typescript
export interface UpcomingVacationsSection {
  items: UpcomingVacationItem[];
  totalCount: number;
}

export interface UpcomingVacationItem {
  employeeId: number;
  employeeName: string;
  segmentName: string | null; // Sector/segmento del empleado (puede ser null)
  startDate: string;
  endDate: string;
}
```

**Fuente de datos**: `Certificate` (tipo_certificados.id = 1, description LIKE '%vacaciones%', status = 'aprobado', startDate BETWEEN hoy AND hoy+15 días) + `User` + `CertificateType` + `Segment`.

**Validaciones**:

- `startDate` dentro de los próximos 15 días (inclusive).
- `segmentName` puede ser null si el empleado no tiene segmento asignado.
- Si un empleado tiene múltiples segmentos, mostrar el primero encontrado.

---

### Sección 6: Licencias que vencen esta semana

```typescript
export interface ExpiringLicensesSection {
  items: ExpiringLicenseItem[];
  totalCount: number;
}

export interface ExpiringLicenseItem {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  endDate: string;
}
```

**Fuente de datos**: `Certificate` (status = 'aprobado', endDate BETWEEN hoy AND hoy+7 días) + `User` + `CertificateType`.

**Validaciones**:

- `endDate` dentro de los próximos 7 días (inclusive).
- Incluye licencias que vencen hoy.

---

### Sección 7: Resumen estadístico

```typescript
export interface StatisticalSummarySection {
  activeEmployees: number;
  licensesInProgress: number;
  pendingLicenses: number;
  unsignedDocuments: number;
  pendingDisclaimerAcceptances: number;
}
```

**Fuente de datos**:

- `activeEmployees`: COUNT de `User` (deletedAt IS NULL) para la empresa.
- `licensesInProgress`: COUNT de `Certificate` (status = 'aprobado', startDate <= hoy <= endDate).
- `pendingLicenses`: COUNT de `Certificate` (status = 'pendiente').
- `unsignedDocuments`: COUNT de `Document` (requireSign = true, signed = null).
- `pendingDisclaimerAcceptances`: COUNT de `User` que NO tienen registro en `DisclaimerAcceptance`.

**Validaciones**:

- Todos los valores >= 0.
- `licensesInProgress` coincide con `employeesOnLeaveToday.totalCount`.
- `pendingLicenses` coincide con `pendingLicenses.totalCount`.
- `unsignedDocuments` coincide con `unsignedDocuments.totalCount`.
- `pendingDisclaimerAcceptances` coincide con `pendingDisclaimerAcceptances.totalCount`.

---

## Entidades Existentes (sin cambios)

Las siguientes entidades ya existen y no se modifican:

| Entidad                | Tabla                    | Campos relevantes                                                                            |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `Certificate`          | `certificados`           | `startDate`, `endDate`, `returnDate`, `reason`, `status`, `userId`, `type`, `id_propietario` |
| `CertificateType`      | `tipo_certificados`      | `id`, `name`, `description`, `rest`                                                          |
| `Document`             | `documentos`             | `signed`, `requireSign`, `view`, `user`, `id_propietario`                                    |
| `User`                 | `usuarios`               | `nombre`, `apellido`, `email`, `id_propietario`                                              |
| `DisclaimerAcceptance` | `disclaimer_acceptances` | `id_usuario`, `id_empresa`, `timestamp`                                                      |
| `Segment`              | `segmentos`              | `id`, `nombre`, `id_propietario`                                                             |
| `UserSegment`          | `usuario_segmentos`      | `id_usuario`, `id_segmento`                                                                  |
| `Ownersys`             | `sis_propietarios`       | `id`, `denominacion`, `logo`                                                                 |

---

## Relaciones

No se crean relaciones nuevas. Las relaciones existentes que se usan en las queries:

- `Certificate.userId` → `User.id` (belongsTo)
- `Certificate.type` → `CertificateType.id` (belongsTo)
- `Document.user` → `User.id` (belongsTo)
- `User.id_propietario` → `Ownersys.id` (belongsTo)
- `UserSegment.id_usuario` → `User.id` (belongsTo)
- `UserSegment.id_segmento` → `Segment.id` (belongsTo)
- `DisclaimerAcceptance.id_usuario` → `User.id` (belongsTo)
- `DisclaimerAcceptance.id_empresa` → `Ownersys.id` (belongsTo)

---

## Migraciones

**No se requieren migraciones**. Esta feature no crea ni modifica tablas de base de datos.

---

## Índices

**No se requieren índices nuevos**. Las queries usan los índices existentes en:

- `certificados.id_propietario`
- `certificados.estado`
- `certificados.fecha_inicio`
- `certificados.fecha_fin`
- `documentos.id_propietario`
- `documentos.requiere_firma`
- `documentos.fecha_firma`
- `usuarios.id_propietario`
- `disclaimer_acceptances.id_usuario`
- `disclaimer_acceptances.id_empresa`

Si las queries son lentas en producción, se pueden agregar índices compuestos:

- `certificados(id_propietario, estado, fecha_inicio, fecha_fin)`
- `documentos(id_propietario, requiere_firma, fecha_firma)`

Pero esto no es necesario para la implementación inicial.
