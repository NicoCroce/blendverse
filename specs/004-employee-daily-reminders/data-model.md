# Data Model: Employee Daily Reminders

**Feature**: `004-employee-daily-reminders` | **Date**: 2026-08-06

## Overview

Esta feature **no crea ni modifica tablas de base de datos** (no se requiere `ultimo_login`; decisión de alcance del spec). Solo define:

1. **DTOs de salida** (no persistentes) para el recordatorio diario por empleado y la notificación de documento nuevo.
2. **Consultas de lectura** sobre entidades existentes (`documentos`, `usuarios`, `disclaimer_firmas`).
3. **Una escritura**: el ingreso de documentos (`documentos`) que materializa el hook de la notificación en tiempo real.

## DTOs de Salida

### EmployeeReminder (raíz — email diario)

DTO que agrupa los pendientes de UN empleado para el email diario. Se genera por empleado y por empresa.

```typescript
export interface IEmployeeReminder {
  ownerId: number;
  employeeId: number;
  employeeName: string; // "Nombre Apellido"
  employeeEmail: string;
  companyName: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  pending: {
    unsignedDocuments: PendingDocumentItem[];
    unviewedDocuments: PendingDocumentItem[];
    pendingDisclaimerAcceptance: boolean; // sin registro válido en disclaimer_firmas
    renewPassword: boolean; // usuarios.renovar_clave = true
  };
  shouldSend: boolean; // true si algún pendiente no vacío
}

export interface PendingDocumentItem {
  documentId: number;
  documentTitle: string;
}
```

**Reglas de negocio (spec)**:

- `shouldSend = unsignedDocuments.length > 0 || unviewedDocuments.length > 0 || pendingDisclaimerAcceptance || renewPassword`. Si `false`, NO se envía email (FR-008).
- `employeeEmail` inválido/vacío → se omite el envío y se registra (FR-009).
- `pendingDisclaimerAcceptance = true` cuando no existe registro en `disclaimer_firmas` para `(id_usuario, id_empresa)` o el registro es inválido (`estado_firma ≠ 'Firmado'`).
- `renewPassword = true` cuando `usuarios.renovar_clave = true`.

---

### NewDocumentNotification (raíz — notificación en tiempo real)

DTO del email inmediato cuando un empleado recibe documentos nuevos en una operación de ingreso.

```typescript
export interface INewDocumentNotification {
  ownerId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyName: string;
  documents: Array<{ documentId: number; documentTitle: string }>; // ≥1
}
```

**Reglas de negocio (spec)**:

- Un email por empleado por operación de ingreso, aunque ingrese varios documentos (FR-013).
- Sin `employeeId` (documento no asignado) → no se genera (FR-014).
- Sin email válido → omisión + log (FR-014).
- Fallo de envío → log, no bloquea el ingreso (FR-015).

---

## Entidades Existentes (solo lectura / escritura puntual)

| Entidad                | Tabla               | Campos relevantes                                                                                         | Uso                                                                                                                                                                           |
| ---------------------- | ------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Documentos`           | `documentos`        | `id`, `Usuario_id`, `tipo`, `titulo`, `archivo`, `extension`, `fecha_de_subida`, `firmado`, `visualizado` | Lectura: pendientes #1/#4. Escritura: `IngestDocument` (nuevo).                                                                                                               |
| `UserModel`            | `usuarios`          | `id`, `nombre`, `apellido`, `email`, `renovar_clave`, `id_propietario`                                    | Pendientes #2/#3 vía `_getEmployeesByCompany` (Disclaimer)                                                                                                                    |
| `DisclaimerAcceptance` | `disclaimer_firmas` | `id_usuario`, `id_empresa`, `hash_prueba`, `timestamp`                                                    | Pendiente #2 (ausencia = sin aceptar). `estado_firma` se deriva: `Firmado` si `hash_prueba` coincide con el hash esperado; `Corrupto` si no coincide; ausencia = sin aceptar. |
| `CompaniesModel`       | `empresas`          | `id`, `denominacion`                                                                                      | `_getAllActiveOwners` (Users)                                                                                                                                                 |

> Nota: `getPendingDocumentsByEmployee` filtra por `Usuario_id = employeeId` y por el owner del empleado (`id_propietario`), respetando multi-tenant (Pr. II).

## Relaciones Usadas

- `Documentos.Usuario_id` → `usuarios.id` (belongsTo `User`)
- `usuarios.id_propietario` → `empresas.id` (belongsTo)
- `disclaimer_firmas.id_usuario` → `usuarios.id`
- `disclaimer_firmas.id_empresa` → `empresas.id`

No se crean relaciones nuevas.

## Escritura de Ingreso (`documentos`)

`IngestDocument` (Documents) inserta una fila por documento con:

- `Usuario_id` = empleado destinatario (si viene asignado; si no, el documento se persiste sin destinatario y sin notificación)
- `tipo` = id de tipo de documento (`DocumentsTypes`)
- `titulo`, `archivo`, `extension`
- `fecha_de_subida` = `new Date()`
- `firmado = null`, `visualizado = null` (por defecto del modelo)

Es la única escritura nueva de la feature. No altera el schema.

## Migraciones

**No se requieren migraciones.** Sin cambios de schema, sin `ultimo_login`.

## Índices

**No se requieren índices nuevos.** Las consultas por empleado usan índices existentes en:

- `documentos.Usuario_id`
- `documentos.firmado` / `documentos.visualizado`
- `usuarios.id_propietario`
- `disclaimer_firmas(id_usuario, id_empresa)`

Si el volumen crece, se puede evaluar un índice compuesto `documentos(Usuario_id, firmado, visualizado)` — no necesario para la implementación inicial.

## Cumplimiento Multi-Tenant

Toda consulta del batch y del ingreso filtra por `ownerId` derivado del `RequestContext` sintético del scheduler (por empresa) o del `RequestContext` autenticado del cliente (ingreso). Nunca llega `id_propietario` desde el input del cliente (Pr. II).
