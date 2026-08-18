# Data Model: Company Email Settings

**Feature**: `company-email-settings` | **Date**: 2026-08-16

## Overview

La feature crea un agregado por empresa y colecciones normalizadas. No se usa un
JSON opaco porque el sistema necesita constraints, deduplicación, consultas por
sección, versionado optimista y auditoría. Todas las tablas nuevas incluyen la
empresa (`owner_id`) de forma explícita o se relacionan a una fila raíz cuya
empresa es única; ningún dato se comparte entre tenants.

## Root aggregate: `CompanyEmailSettings`

Tabla: `company_email_settings`

| Campo                      | Tipo            | Regla                                                         |
| -------------------------- | --------------- | ------------------------------------------------------------- |
| `id`                       | BIGINT          | PK                                                            |
| `owner_id`                 | BIGINT          | FK a `sis_propietarios.id`, UNIQUE, no proviene del cliente   |
| `version`                  | BIGINT          | inicia en 1, incrementa en cada update/publicación            |
| `welcome_message`          | TEXT nullable   | HTML sanitizado o `NULL` para conservar comportamiento actual |
| `current_terms_version_id` | BIGINT nullable | FK a `company_terms_versions.id`                              |
| `created_at`, `updated_at` | DATETIME        | timestamps                                                    |

**Invariantes**:

- Existe como máximo una raíz por empresa.
- `version` es positiva y solo avanza.
- `current_terms_version_id`, si existe, pertenece al mismo `owner_id`.
- El mensaje no contiene contenido fuera de la allowlist y no supera 2.000
  caracteres normalizados.

## Delivery types

Tabla: `company_email_delivery_settings`

| Campo      | Tipo        | Regla                                    |
| ---------- | ----------- | ---------------------------------------- |
| `id`       | BIGINT      | PK                                       |
| `owner_id` | BIGINT      | FK + tenant filter                       |
| `code`     | VARCHAR(80) | enum del catálogo; UNIQUE con `owner_id` |
| `audience` | ENUM/string | `admin`, `employee`, `requester`         |
| `trigger`  | VARCHAR(80) | nombre técnico estable del disparador    |
| `enabled`  | BOOLEAN     | default de backfill: true                |
| timestamps | DATETIME    | auditoría técnica                        |

Los nueve códigos son los definidos en `contracts/interfaces.md`. El código,
no el label traducible, es la clave de integración.

## Administrative recipients

Tabla: `company_email_recipients`

| Campo              | Tipo         | Regla                                   |
| ------------------ | ------------ | --------------------------------------- |
| `id`               | BIGINT       | PK                                      |
| `owner_id`         | BIGINT       | FK + tenant filter                      |
| `email`            | VARCHAR(320) | valor preservado para mostrar           |
| `normalized_email` | VARCHAR(320) | trim + lowercase; UNIQUE con `owner_id` |
| `source`           | ENUM/string  | `backfill`, `lazy_provision`, `manual`  |
| timestamps         | DATETIME     | alta y última modificación              |

La dirección externa no se convierte en `User`, no recibe token y no aparece en
permisos. La validación usa el helper existente `isValidEmail` más la
normalización y la longitud RFC práctica del producto.

**Regla de estado**: si existe al menos un delivery admin activo, el agregado
debe tener al menos un recipient válido. El reporte desactivado puede conservar
la lista; al reactivarlo se valida de nuevo.

Los recipients removidos se eliminan físicamente (hard delete) dentro de la
misma transacción del `update`. No existe `deleted_at`: la unicidad activa y
total es `UNIQUE(owner_id, normalized_email)`. Si una dirección se vuelve a
agregar después de quitarla, se crea una nueva fila y la auditoría conserva solo
el cambio y su huella, no la dirección completa.

## Morning report sections

Tabla: `company_email_report_sections`

| Campo      | Tipo        | Regla                         |
| ---------- | ----------- | ----------------------------- |
| `id`       | BIGINT      | PK                            |
| `owner_id` | BIGINT      | FK + tenant filter            |
| `code`     | VARCHAR(80) | UNIQUE con `owner_id`         |
| `enabled`  | BOOLEAN     | backfill: true para las siete |

Secciones:

`statistical_summary`, `employees_on_leave_today`, `pending_licenses`,
`unsigned_documents`, `pending_terms_acceptance`, `upcoming_vacations`,
`expiring_licenses`.

Si `admin_daily_report` está activo, al menos una sección debe estar activa.
Si se desactiva el reporte, la selección se conserva y no se consulta ni envía.
No existe una columna de horario o zona horaria: se mantiene
`0 9 * * * America/Argentina/Buenos_Aires`.

## Terms versions

Tabla: `company_terms_versions`

| Campo            | Tipo            | Regla                             |
| ---------------- | --------------- | --------------------------------- |
| `id`             | BIGINT          | PK                                |
| `owner_id`       | BIGINT          | FK + tenant filter                |
| `version_number` | BIGINT          | UNIQUE con `owner_id`, monotónico |
| `content_html`   | LONGTEXT        | contenido sanitizado              |
| `content_hash`   | CHAR(64)        | SHA-256 del contenido sanitizado  |
| `published_at`   | DATETIME        | fecha de publicación              |
| `published_by`   | BIGINT nullable | actor; `NULL` para importación    |
| timestamps       | DATETIME        | metadata                          |

Una versión publicada es inmutable. Publicar contenido idéntico se rechaza con
`DUPLICATE_TERMS_CONTENT`; nunca se crea una versión duplicada ni se reescribe
silenciosamente la versión vigente.

## Existing acceptance changes

Tabla existente: `disclaimer_firmas`.

- Agregar `terms_version_id BIGINT NOT NULL` después del backfill inicial; la
  migración puede introducirlo nullable durante la fase de datos y endurecerlo
  al final.
- Eliminar `uq_usuario_empresa`.
- Crear `uq_usuario_empresa_version` sobre
  `(id_usuario, id_empresa, terms_version_id)`.
- Mantener `hash_prueba`, IP, user agent y timestamp actuales.

`SignDisclaimer` crea/upsertea por usuario + empresa + versión mostrada, no por
usuario + empresa sin versión. `GetSignatureStatus` solo considera aceptada la
versión vigente. Las filas anteriores permanecen consultables como historial.

## Audit events

Tabla: `company_email_settings_audit_events`.

| Campo                        | Tipo                 | Regla                                       |
| ---------------------------- | -------------------- | ------------------------------------------- |
| `id`                         | BIGINT               | PK inmutable                                |
| `owner_id`                   | BIGINT               | FK + tenant filter                          |
| `actor_user_id`              | BIGINT nullable      | usuario o `NULL` para migración/sistema     |
| `action`                     | VARCHAR(80)          | `settings_updated`, `terms_published`, etc. |
| `outcome`                    | ENUM/string          | `accepted`, `rejected`                      |
| `reason_code`                | VARCHAR(80) nullable | error seguro y estable                      |
| `settings_version_before`    | BIGINT nullable      | referencia de concurrencia                  |
| `settings_version_after`     | BIGINT nullable      | solo accepted                               |
| `terms_version_before/after` | BIGINT nullable      | referencias, no contenido                   |
| `changed_codes`              | JSON nullable        | códigos/colecciones afectadas               |
| `content_hash_before/after`  | CHAR(64) nullable    | huellas, no texto                           |
| `metadata`                   | JSON nullable        | conteos y contexto mínimo                   |
| `created_at`                 | DATETIME             | inmutable                                   |

No se guardan emails completos en metadata de eventos ni contenido completo de
mensaje/términos. Las consultas de auditoría siempre filtran `owner_id`.
`getAudit` se expone como API tenant-scoped para tooling de seguridad y
operaciones; esta feature no agrega una pantalla de auditoría al frontend.

## Aggregate update shape

La operación `update` recibe el snapshot completo editable, además de
`expectedVersion`. El cliente no envía `ownerId`:

```text
UpdateCompanyEmailSettingsInput
  expectedVersion
  delivery: [{ code, enabled }]
  adminRecipients: [{ email }]
  reportSections: [{ code, enabled }]
  welcomeMessage: string | null
```

La Application normaliza, valida todas las invariantes, sanitiza contenido y
solo entonces solicita al repository una transacción que reemplaza las
colecciones del owner. Un error de validación, autorización, persistencia o
versión conserva la última snapshot válida. `update` nunca crea ni publica una
versión de términos: la publicación legal solo ocurre mediante
`publishTerms`, como acción separada y transaccional.

## Welcome message capability matrix

El campo `welcome_message` es institucional y se aplica a los ocho tipos
automáticos. El catálogo distingue explícitamente el punto de inserción para
que el contenido legal no sea alterado:

| Código                            | Compatible | Aplicación runtime                                      | Exclusión                                                  |
| --------------------------------- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `admin_license_created`           | Sí         | Preamble institucional antes del cuerpo de `addLicense` | No modifica asunto ni datos de la licencia                 |
| `employee_license_status_changed` | Sí         | Preamble antes de `licenseStatusChange`                 | No modifica estado, fechas ni motivo                       |
| `employee_document_signed`        | Sí         | Preamble antes de `documentSignedEmployee`              | No modifica evidencia de firma                             |
| `admin_document_signed`           | Sí         | Preamble antes de `documentSignedAdmin`                 | No modifica datos del documento                            |
| `employee_terms_reminder`         | Sí         | Preamble institucional antes del recordatorio           | No envuelve, concatena ni transforma `terms_content` legal |
| `admin_daily_report`              | Sí         | Preamble antes del resumen y secciones seleccionadas    | No modifica datos ni selección del reporte                 |
| `employee_daily_reminder`         | Sí         | Preamble antes de las secciones de pendientes           | No modifica la lista de pendientes                         |
| `employee_document_assigned`      | Sí         | Preamble antes de `newDocumentNotification`             | No modifica títulos ni asignaciones                        |
| `requester_document_manual`       | No         | Sin decorator institucional                             | El envío manual y su PDF quedan fuera                      |

El punto único de aplicación es el decorator/adapter de composición de email,
ejecutado después del template y antes de `MailNotificationService.sendOne()`.
Cada producer debe pasar el código de catálogo; el decorator devuelve el body
sin cambios para el requester manual y nunca recibe el contenido legal como
input editable.

## Provisioning for new companies

La estrategia elegida es **provisioning lazy**. No se agrega un hook al flujo de
creación de empresas porque el código actual no expone un caso de uso de
creación de `Companies` estable. `get`, `resolveDelivery` y los servicios de
reporte/reminders llaman a `EnsureCompanyEmailSettings` cuando no existe la
raíz del owner.

El provisioning lazy, protegido por `UNIQUE(owner_id)` y una transacción,
materializa la misma configuración inicial que el backfill: nueve deliveries
activos, siete secciones activas, terms versión 1 desde
`Ownersys.texto_disclaimer`, recipients válidos de admins legacy y una raíz en
versión 1. La operación es idempotente y registra `lazy_provision`. Así, un
tenant creado después de la migración queda configurado en su primer acceso o
primer disparo sin depender de una ruta de creación inexistente.

## Migration and backfill

Archivo planificado: `packages/server/src/migrations/002_company_email_settings.sql`.

Tabla operacional: `company_email_migration_state`.

| Campo                                      | Tipo            | Regla                                                                                                     |
| ------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------- |
| `migration_key`                            | VARCHAR(100)    | PK, por ejemplo `company-email-settings-v1`                                                               |
| `stage`                                    | VARCHAR(40)     | `pending`, `schema_ready`, `owners_backfilled`, `acceptances_linked`, `constraints_hardened`, `completed` |
| `last_owner_id`                            | BIGINT nullable | último owner confirmado en el backfill por lotes                                                          |
| `started_at`, `updated_at`, `completed_at` | DATETIME        | progreso operacional                                                                                      |
| `error_message`                            | TEXT nullable   | último error seguro; no contiene contenido legal                                                          |

Esta tabla no pertenece al agregado de negocio ni se expone por tRPC; solo
permite reanudar el proceso de migración.

MySQL puede hacer commits implícitos durante DDL, por lo que la migración no se
presenta como una única transacción reversible. Se crea primero una tabla de
progreso `company_email_migration_state` con una fila por `migration_key` y
`stage` (`schema_ready`, `owners_backfilled`, `acceptances_linked`,
`constraints_hardened`, `completed`), además de `last_owner_id`, timestamps y
`error_message`.

Etapas reanudables:

1. **Schema**: crear tablas nuevas, índices y la columna nullable
   `terms_version_id`; cada DDL es idempotente y al finalizar se marca
   `schema_ready`.
2. **Owners**: recorrer empresas activas por `id` ascendente en lotes. Cada
   owner se procesa en una transacción independiente con upserts idempotentes:
   términos versión 1, raíz, nueve deliveries, siete secciones y recipients.
   Después de cada lote se actualiza `last_owner_id`.
3. **Acceptances**: enlazar las filas de `disclaimer_firmas` por owner a la
   versión inicial. Validar que no queden filas sin versión y marcar
   `acceptances_linked`.
4. **Constraints**: eliminar la unique legacy, crear
   `uq_usuario_empresa_version` y endurecer `terms_version_id NOT NULL` con
   DDL separado. Marcar cada subpaso antes de continuar para que un rerun pueda
   detectar el estado real.
5. **Complete**: validar conteos/hashes y marcar `completed`.

Si una etapa falla, se conserva el progreso confirmado, se escribe el error y se
reanuda desde la marca sin duplicar datos. No se marca `completed` hasta que la
validación de todos los owners y constraints termine.

Backfill por owner:

1. Crear términos versión 1 por empresa desde
   `sis_propietarios.texto_disclaimer` (sanitizado; `NULL`/vacío se conserva
   como contenido vacío legacy) y settings raíz versión 1.
2. Insertar los nueve deliveries `enabled = true` y las siete secciones
   `enabled = true`.
3. Importar emails válidos/deduplicados de la consulta legacy de admins (`id_rol
= 1`, mismo owner). No crear destinatarios sintéticos.
4. Enlazar cada `disclaimer_firmas` existente de la empresa con su versión 1.
5. Crear un audit event de tipo
   `migration_backfill` sin contenido sensible.
6. Dejar `sis_propietarios.texto_disclaimer` en modo compatibilidad hasta que
   todos los lectores pasen al nuevo caso de uso; no eliminarlo en esta release.

Antes de producción se compara un snapshot de recipients y de comportamiento
efectivo. El hard delete de recipients aplica a partir de la tabla nueva; el
backfill nunca elimina usuarios ni destinatarios legacy fuera de su importación.

## In-memory outputs

El endpoint `get` devuelve una única snapshot con `version`, delivery catalog,
recipients, selected sections, welcome message y terms vigente (`version`,
`publishedAt`, `content`, `contentHash`). El frontend deriva sus tipos con
`inferRouterOutputs`; no duplica estas interfaces manualmente.
