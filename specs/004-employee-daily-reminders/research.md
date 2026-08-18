# Research: Employee Daily Reminders

**Feature**: `004-employee-daily-reminders` | **Date**: 2026-08-06

## Alcance de la investigación (Phase 0)

Despejar los puntos abiertos del spec y validar los patrones a reutilizar antes de diseñar:

1. Punto de hook de la notificación en tiempo real (no existe un procedimiento de ingreso de documentos).
2. Semántica de los pendientes por empleado vs. los use cases existentes del reporte de admins.
3. Reuso de datos existentes para el empleado (renovar contraseña, aceptación de términos).
4. Infraestructura de scheduler y email a reutilizar.
5. Multi-tenant en un batch sin usuario autenticado.

---

## 1. Punto de hook de la notificación en tiempo real

**Problema**: El dominio `Documents` (controller + repositorio) **no expone ningún procedimiento de creación/ingreso/asignación** de documentos. Los procedimientos tRPC existentes son de lectura (`getDocuments`, `getDocument`, `getDocumentsByCompany`, `getStatisticsDocuments`) y de mutación de estado (`viewDocument`, `signDocument`, `sendDocumentToEmail`). El modelo `Documentos` (`fecha_de_subida`, `Usuario_id`, `titulo`, `archivo`, `firmado`, `visualizado`) se escribe hoy fuera del backend actual (carga directa en la base o un flujo legacy).

**Decisión:** Crear el **punto de ingreso canónico** en el dominio `Documents`:

- Nuevo use case `IngestDocument.usecase.ts` en `Documents/Application/UseCases/`. Es el punto único por el que un documento se "ingresa al sistema y queda asignado a un empleado" (FR-011). Registra `fecha_de_subida = now`, `Usuario_id` (empleado destinatario), `tipo`, `titulo`, `archivo`, `extension` y asociaciones de segmentos.
- Soporta **múltiples documentos asignados al mismo empleado en una sola operación** → una única notificación que lista todos (FR-013). Si el documento NO lleva `Usuario_id` (no asignado a un empleado), no se genera notificación (FR-014).
- Tras persistir, invoca —vía inyección de dependencias (patrón `cross-domain-relations`)— el use case `_notifyNewDocument` del dominio `EmployeeReminders`. La notificación se envía con `try/catch` para que un fallo SMTP **nunca bloquee el ingreso** (FR-015): el documento queda pendiente y lo cubre el batch diario.

**Hook point (materialización del trigger):**

```text
IngestDocument.usecase.ts (Documents)                              NOTIFICACIÓN EN TIEMPO REAL
  ├─ persiste Documento(s) (fecha_de_subida = now, Usuario_id)
  └─ _notifyNewDocument (EmployeeReminders) ──► email inmediato (FR-011..FR-016)
        try/catch: fallo ≠ bloquea ingreso; sin email → log + skip
```

**Alternativas descartadas:**

| Alternativa                                  | Veredicto | Motivo                                                                                                                                                                            |
| -------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Event bus / observer (Node EventEmitter)** | ❌        | No existe infraestructura de eventos en el proyecto; agregarla es scope creep. La llamada directa en el flujo de ingreso es más simple y trazable.                                |
| **Hook de Sequelize / trigger de DB**        | ❌        | El hook `afterCreate` no conoce `RequestContext`/owner y acopla la notificación a infraestructura. Los efectos de negocio se disparan desde la capa Application, no desde el ORM. |
| **Escuchar en el controlador tRPC**          | ❌        | No hay procedimiento de creación existente en el controller (hecho fuente). Centrar el trigger en `IngestDocument` evita duplicar el punto de emisión.                            |

**Nota de alcance:** la "re-asignación de un documento ya existente a un segundo empleado, tratada como documento nuevo para ese empleado" no tiene flujo propio en el backend hoy. `IngestDocument` cubre la **primera asignación (creación)**. Si en el futuro se agrega un flujo de re-asignación, debe invocar el mismo `_notifyNewDocument` para ese empleado. Se documenta como extension point (ver Risks).

---

## 2. Semántica de pendientes por empleado vs. use cases existentes

**Problema:** El contexto sugiere reutilizar `GetUnsignedDocuments` (Documents, del reporte de admins 003). Análisis:

- `DocumentRepository.getUnsignedDocuments({ requestContext })` devuelve **por empresa (owner)** los documentos con `firmado IS NULL` **y** `requiere_firma = true`, y NO discrimina por empleado (retorna `employeeId` + `viewStatus`).
- El spec 004 define "Documentos sin firmar" como **`documentos.firmado IS NULL`** (sin el filtro `requiere_firma`) y "Documentos sin visualizar" como **`documentos.visualizado IS NULL`**.
- La entrada del reminder es **por empleado**, no por empresa. Un `GetUnsignedDocuments` owner-scope sirve al email del admin, no al email individual del empleado.

**Decisión:**
Crear un método nuevo en el repositorio Documents: `getPendingDocumentsByEmployee({ employeeId, requestContext })`. Para un empleado (filtro `Usuario_id = employeeId`, scoped por `ownerId` derivado de `requestContext.values.ownerId`) devuelve los documentos donde `firmado IS NULL` **o** `visualizado IS NULL`, con dos flags `isUnsigned` / `isUnviewed`. Así una sola consulta alimenta los pendientes #1 y #4.

- Se expone como use case `GetPendingDocumentsByEmployee` del dominio Documents (clave DI: `_getPendingDocumentsByEmployee`).
- Se documenta que `GetUnsignedDocuments` (003) **NO se reutiliza** aquí porque agrega `requiere_firma` y es por empresa: se conserva tal cual para el reporte de admins; el reminder usa la consulta por empleado nueva (fiel al spec).

**Pendientes derivados de la cuenta sin consulta extra:**

- **Renovar contraseña**: `usuarios.renovar_clave` (booleano).
- **Términos sin aceptar**: ausencia de fila en `disclaimer_firmas` para `id_usuario` + `id_empresa`.

Ambos se resuelven con UN uso existente: `_getEmployeesByCompany` del dominio Disclaimer, que retorna `IEmployeeRecord[]` con `renovar_clave` y `estado_firma` (`Pendiente | Firmado | Corrupto`) por empresa. No se agrega código ni query nueva en `Users`/`Disclaimer` para el batch.

---

## 3. Multi-tenant en el scheduler (sin usuario autenticado)

Patrón existente del `DailyReportService` (003):

- Obtener todos los owners activos con `_getAllActiveOwners` (Users).
- Por cada owner crear un `RequestContext` sintético con `ownerId`.
- Reutilizar ese `RequestContext` en los casos de uso (toman `requestContext.values.ownerId`).

**Decisión:** replicar el patrón en `EmployeeReminders.service.ts` (`sendDailyReminders`): iterar owners, construir `new RequestContext(0, reqId, owner.id)` por owner, y dentro de cada owner iterar empleados con `try/catch` por owner y por empleado para aislar los fallos (FR-003).

- Email SOLO si el empleado tiene ≥1 pendiente (FR-008) → `shouldSend`.
- Empleado sin email válido → skip + log (FR-009).
- Fallo de envío en una empresa no bloquea a las demás.

---

## 4. Scheduler y templates de email

**Scheduler:** `node-cron` ya está instalado (`^4.6.0`). Réplica del patrón `DailyReport.scheduler.ts`: expression `0 9 * * *`, timezone `America/Argentina/Buenos_Aires`, métodos `init()`/`stop()`, registro en `index.ts` junto al scheduler actual.

**Email:**

- `MailNotificationService` (Nodemailer) operativo con `sendOne` / `send`.
- Helpers de template existentes: `emailFooter`, `formatDateEs`, `renderSection`.
- Se agregan dos templates nuevos en `Infrastructure/utils/Email/Templates/`: `employeeDailyReminder` y `newDocumentNotification`, registrados en el objeto `emailTemplates`.
- Puerto hexagonal `EmployeeEmailSender.port.ts` (Domain) + implementación en `Infrastructure/Email/` con `MailNotificationService.sendOne` (mismo patrón `DailyReportEmailSender`).

---

## 5. Dependencias entre dominios (grafo cross-domain)

```
EmployeeReminders (nuevo)
 ├─ _getEmployeesByCompany          (Disclaimer)  → empleados + renovar_clave + estado_firma
 ├─ _getPendingDocumentsByEmployee  (Documents)   → docs sin firmar / sin visualizar por empleado
 └─ _getAllActiveOwners             (Users)       → owners (en el service)

Documents (modificado)
 └─ _ingestDocument ──► _notifyNewDocument (EmployeeReminders) → email en tiempo real
```

La dependencia bidireccional Documents ↔ Employee no es una dependencia ciclista de resolución: los use cases de `EmployeeReminders` dependen de **queries** de Documents, y `_ingestDocument` (Documents) depende de **un notificador** de Employee; ninguna instancia se resuelve del contenedor en tiempo de registro (Tn`asClass` se resuelve a demanda de uso), así que Awilix en `InjectionMode.CLASSIC` las resuelve sin problema. No se importan repositorios de otros dominios (Principio VII respetado).

---

## Consolidación de decisiones

- **D1 — Hook de notificación inmediata:** `IngestDocument` (Documents) como punto canónico de ingreso; invoca `_notifyNewDocument` (Employee) cross-domain; un fallo SMTP no bloquea el ingreso.
- **D2 — Pendientes por empleado:** nuevo `getPendingDocumentsByEmployee` (`firmado IS NULL` / `visualizado IS NULL`), sin `requiere_firma`; los pendientes de cuenta (renovar + términos) salen de `_getEmployeesByCompany`.
- **D3 — Multi-tenant:** patrón `EmployeeReminders.service` (iterar owners + `RequestContext` sintético por owner).
- **D4 — Scheduler:** node-cron existente, cron `0 9 * * *`, timezone `America/Argentina/Buenos_Aires`.
- **D5 — Email:** 2 templates nuevos + puerto `EmployeeEmailSender` + `MailNotificationService`.

---

## Key Learnings

1. `node-cron` ya es dependencia del server; no hace falta instalarlo de nuevo.
2. `GetEmployeesByCompany` (Disclaimer) ya expone `renovar_clave` + `estado_firma` por empresa: la fuente ideal para los pendientes #2 y #3 sin consulta nueva.
3. El controller de `Documents` no tiene creación; materializar la notificación requiere crear `IngestDocument` como punto de ingreso canónico (decisión de diseño explícita).
