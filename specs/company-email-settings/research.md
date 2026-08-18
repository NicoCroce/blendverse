# Research: Company Email Settings

**Feature**: `company-email-settings` | **Date**: 2026-08-16

## Objetivo de la investigación

Resolver los puntos técnicos que afectan seguridad, compatibilidad y diseño
antes de implementar: dónde vive la configuración, cómo se aplica a los
disparadores existentes, cómo se versionan los términos, cómo se hace el
backfill y cómo se mantiene la dirección visual sin inventar patrones de UI.

## 1. Dominio y límite arquitectónico

**Decisión**: crear `CompanyEmailSettings` como dominio nuevo.

**Razón**: la feature tiene un agregado persistente propio y coordina política
de entrega, destinatarios, selección del reporte, contenido editable,
versionado y auditoría. No es responsabilidad de `Ownersyss`, que hoy solo
expone datos básicos de la empresa, ni de `Disclaimer`, que debe seguir siendo
dueño del acto de aceptación.

`CompanyEmailSettings` expondrá casos de uso para que otros dominios consulten
política. Los consumidores no importarán repositorios ni modelos del nuevo
dominio. `Disclaimer` conservará las aceptaciones y guardará el id de la
versión mostrada, obteniendo la versión actual mediante un caso de uso
cross-domain.

**Alternativas descartadas**:

- Agregar columnas JSON a `sis_propietarios`: mezcla configuración con el
  agregado legacy, dificulta constraints/índices/auditoría y vuelve opaca la
  concurrencia.
- Agregar todo a `Disclaimer`: haría que el dominio legal sea dueño de
  destinatarios y de nueve comunicaciones no legales.
- Reutilizar un dominio de administración frontend: no existe un dominio
  backend equivalente ni un agregado para persistirlo.

El contrato compartido declara también `publishTerms` y `getAudit`, aunque el
lector actual de generators conoce solo CRUD. La decisión es adaptar la
frontera del generator para conservar esos nombres y generar únicamente el
scaffold estándar `get`/`update`; las dos operaciones específicas se agregan
explícitamente por el agente backend. Esto evita que backend y frontend
interpreten conjuntos de operaciones distintos.

## 2. Catálogo y puntos de integración existentes

La fuente actual es `docs/email-notifications.md` y el código bajo
`Infrastructure/utils/Email/Templates/`. El catálogo de esta feature se fija
con códigos estables:

| Código                            | Audiencia | Disparador actual                                       | Punto que debe consultar política |
| --------------------------------- | --------- | ------------------------------------------------------- | --------------------------------- |
| `admin_license_created`           | Admin     | `Certificates.service` → `SendEmailService.addLincence` | `SendEmailService`                |
| `employee_license_status_changed` | Employee  | `Certificates.service` → `notifyLicenseStatusChange`    | `SendEmailService`                |
| `employee_document_signed`        | Employee  | `Documents.service` → `signDocument`                    | `SendEmailService`                |
| `admin_document_signed`           | Admin     | Segundo envío de `signDocument`                         | `SendEmailService`                |
| `employee_terms_reminder`         | Employee  | `Disclaimer.SendReminders`                              | `DisclaimerEmailService`          |
| `admin_daily_report`              | Admin     | `DailyReport` scheduler/manual trigger                  | `SendReportEmail`                 |
| `employee_daily_reminder`         | Employee  | `EmployeeReminders` scheduler/manual trigger            | `SendEmployeeReminderEmail`       |
| `employee_document_assigned`      | Employee  | `Documents.IngestDocument` → notifier                   | `NotifyNewDocument`               |
| `requester_document_manual`       | Requester | `Documents.sendDocumentToEmail`                         | `SendEmailService`                |

**Decisión**: policy use cases son la única puerta a `MailNotificationService`.
El envío manual permanece independiente de la lista administrativa. El envío
de firma se divide en dos decisiones, porque empleado y administrador son dos
tipos catalogados aunque provengan del mismo evento.

El template de bienvenida no existe hoy. Por tanto, `welcomeMessage` será una
personalización opcional, con capability explícita por template. El valor
legacy por defecto es `null`, que conserva el contenido actual. La UI podrá
restaurar `null`; guardar una cadena vacía como contenido personalizado se
rechaza. No se eliminan asuntos funcionales, pie institucional ni contenido
legal obligatorio.

**Matriz aprobada de capacidades**: los ocho códigos automáticos son
compatibles (`admin_license_created`, `employee_license_status_changed`,
`employee_document_signed`, `admin_document_signed`, `employee_terms_reminder`,
`admin_daily_report`, `employee_daily_reminder` y `employee_document_assigned`).
`requester_document_manual` no es compatible. El punto de aplicación runtime es
un decorator/adapter común después del template y antes de
`MailNotificationService.sendOne()`, recibiendo el código de catálogo. Para
`employee_terms_reminder` agrega un preámbulo institucional antes del texto
legal, pero no modifica el contenido legal. Esto debe implementarse en todos
los producers/templates, no solo en el CRUD de settings.

## 3. Destinatarios administrativos

`PermissionsRepository.getAdmins()` filtra el mismo `ownerId` y
`users_roles.id_rol = 1`. `docs/email-notifications.md` confirma que ese id
corresponde a los administradores del seed actual. No existe una lista externa.

**Decisión**: el backfill importa los emails válidos que devuelve exactamente
esa consulta, normalizados para comparación case-insensitive y deduplicados. A
partir de la migración, los emails administrativos se resuelven exclusivamente
desde `company_email_recipients`; agregar una dirección externa nunca crea una
cuenta ni un permiso.

Si una empresa no tiene admins legacy, no se inventa un destinatario. El
registro queda con sus defaults equivalentes y un diagnóstico de “admin route
without recipients”; la pantalla exige agregar uno o apagar cada ruta admin
antes de una edición posterior.

## 4. Reporte matutino y recordatorios

`DailyReport.GenerateDailyReport` hoy ejecuta las siete consultas en paralelo
antes de renderizar; `dailyReport.template.ts` siempre muestra todas. Esto no
cumple la selección por empresa.

**Decisión**: `ResolveEmailDeliveryPolicy` devolverá los códigos activos y
`GenerateDailyReport` resolverá las secciones seleccionadas antes de invocar
los use cases de datos. Una sección no seleccionada no se consulta ni se
renderiza. Las secciones seleccionadas pero vacías conservan la semántica
actual de “sin coincidencias”. El scheduler, cron y timezone no cambian.

`EmployeeReminders` consulta la política por owner antes de construir/enviar
recordatorios. No se mezclan sus pendientes con el reporte administrativo.

## 5. Términos y condiciones versionados

Hoy `OwnersysModel.texto_disclaimer` contiene un único texto y
`disclaimer_firmas` tiene unicidad `(id_usuario, id_empresa)`. El hash actual
prueba integridad de la aceptación, pero no identifica la versión que el
usuario vio.

**Decisión**:

1. Crear `company_terms_versions`, con `version_number`, contenido sanitizado,
   hash, fecha y actor de publicación.
2. Agregar `terms_version_id` a `disclaimer_firmas`.
3. Reemplazar la unicidad por `(id_usuario, id_empresa, terms_version_id)` para
   conservar historial; la consulta de estado considera aceptada solo la
   versión vigente.
4. El backfill crea la versión 1 desde `texto_disclaimer` y enlaza cada
   aceptación existente a esa versión. No hay reaceptación masiva.
5. Una aceptación en curso captura la versión que el empleado recibió; publicar
   después una versión nueva no muta esa fila.

`update` no publica términos. La edición legal requiere la mutación separada
`publishTerms`, confirmación explícita, hash nuevo y transacción propia.

Un hash sanitizado idéntico se rechaza con `DUPLICATE_TERMS_CONTENT`; no se
crean versiones duplicadas ni se hace un no-op silencioso.

El dominio nuevo sirve la versión actual al flujo de `Disclaimer`; no se
elimina todavía `texto_disclaimer`, para permitir rollback y migración gradual.

## 6. Validación y sanitización de contenido

No existe un sanitizer reutilizable en el monorepo. Zod valida forma y límites,
pero no es un sanitizer HTML.

**Decisión**: agregar `sanitize-html` como dependencia del server, validar en
Application y sanitizar en Infrastructure con una allowlist server-side. Se
permite texto, saltos de línea y formato acotado:
`p`, `br`, `strong`, `em`, `ul`, `ol`, `li` y enlaces `https` sin atributos de
evento. Se eliminan `script`, `style`, `iframe`, imágenes remotas, atributos
`on*`, URLs no permitidas y CSS inline. Límite inicial: 2.000 caracteres para
mensaje de inicio y 50.000 para términos, medidos sobre texto normalizado.

La respuesta contiene únicamente contenido ya sanitizado y su hash. La preview
frontend no debe renderizar el input crudo. Los tests incluyen XSS, enlaces
javascript, etiquetas no permitidas, límites y saltos de línea.

**Alternativas descartadas**:

- Solo escapar al generar HTML: no preserva el formato permitido y no evita
  almacenar contenido no permitido.
- Sanitizar solo en React: deja inseguros otros consumidores de tRPC y emails.
- Permitir HTML arbitrario: no es compatible con seguridad ni con el alcance.

No se implementará un parser HTML propio: una configuración explícita de
`sanitize-html` reduce el riesgo de bypasses y queda cubierta por tests de
payloads peligrosos.

## 7. Multi-tenancy y autorización

`protectedProcedure` verifica el token y crea un `RequestContext` con owner
verificado. El nuevo controller no recibe `ownerId`. Cada repositorio agrega
`ownerId` en `where`, unique keys y writes. Los IDs de destinatario, versión o
auditoría ajenos devuelven el mismo error genérico que un registro inexistente.

**Decisión**: reutilizar el permiso existente `dashboard-access` como política
de administración en esta primera versión, tanto para el menú como para
Application. El server no confía en la visibilidad del menú; verifica el
permiso del usuario autenticado y su contexto de empresa antes de leer o
escribir. No se agrega una fila de permiso nueva en esta feature.

La constitución vigente confirma que la estructura backend es únicamente
`Domain/`, `Application/`, `Infrastructure/` y `[domain].di.ts`; los controllers
tRPC viven exclusivamente en `Infrastructure/Controllers`. No se agrega una
capa o directorio `Presentation`.

## 8. Concurrencia y atomicidad

Cada agregado tiene `version BIGINT`. `update` y `publishTerms` reciben
`expectedVersion`; el repository ejecuta `UPDATE ... WHERE owner_id = ? AND
version = ?` dentro de una transacción. Cero filas afectadas produce `409
STALE_CONFIGURATION` y no modifica recipients, switches, contenido ni audit de
éxito. La lectura posterior devuelve la versión vigente para que la UI pida
revisar.

Validación de la propuesta completa ocurre antes de la transacción. La escritura
aceptada reemplaza colecciones y registro raíz de forma transaccional y escribe
un evento de auditoría en la misma transacción. Los intentos rechazados se
auditan sin modificar el agregado; el evento contiene códigos, conteos y hashes,
no el texto completo.

## 9. Contextos de scheduler y disparadores manuales

Los schedulers existentes (`DailyReportService` y
`EmployeeRemindersService`) usan la firma real
`new RequestContext(userId, requestId, ownerId, xAppClient?)`. Enumeran owners
con `new RequestContext(0, requestId, 0)` y luego crean un contexto sintético
por empresa con `new RequestContext(0, requestId, owner.id)`. La política se
resuelve con ese contexto por empresa, nunca con `ownerId` de input.

La estrategia definida para triggers manuales es más restrictiva: los
procedures protegidos usan el `ctx.requestContext` autenticado y ejecutan solo
para su owner actual; no reutilizan la iteración global del scheduler ni
aceptan otro owner. Los eventos de negocio normales pasan su contexto
autenticado. `userId=0` queda reservado a la entrada interna del scheduler.

## 10. Provisioning posterior al backfill

**Decisión**: provisioning lazy. El código actual no presenta un caso de uso
estable para crear empresas en el dominio `Companies`, por lo que no se agrega
un hook de creación. `get`, `ResolveEmailDeliveryPolicy` y los jobs por owner
llaman a `EnsureCompanyEmailSettings` si falta la raíz.

La operación crea dentro de una transacción idempotente la raíz, nueve tipos
activos, siete secciones activas, términos versión 1 desde el texto legacy y
recipients válidos de admins actuales. `UNIQUE(owner_id)` resuelve carreras y
se audita como `lazy_provision`.

Los recipients removidos se hard-deletean en el update. La tabla no tiene
`deleted_at`; `UNIQUE(owner_id, normalized_email)` representa toda la
unicidad activa y permite volver a agregar una dirección como una nueva fila.

## 11. Migración reanudable

MySQL puede confirmar implícitamente DDL. La migración usa una tabla de estado
con `migration_key`, `stage`, `last_owner_id`, timestamps y error. Sus etapas
son: (1) schema con columna `terms_version_id` nullable, (2) backfill por owner
en transacciones independientes, (3) enlace y validación de aceptaciones, (4)
constraints finales y `NOT NULL`, y (5) validación/completion.

Cada DDL es idempotente; cada lote de owners usa upserts y avanza
`last_owner_id`; ningún run se marca completo hasta validar conteos, hashes y
constraints. Si falla, el siguiente run lee la etapa y continúa sin duplicar.

El repositorio no tiene `db:migrate`, `sequelize-cli`, runner de SQL ni comando
de migración en `package.json` o `.opencode/commands/`. El ejecutor operacional
es, por tanto, el operador/proceso de despliegue que ya aplica SQL mediante el
acceso MySQL del entorno, igual que el único archivo existente
`packages/server/src/migrations/001_disclaimer.sql`. El procedimiento de
reanudación es consultar la fila de estado, ejecutar nuevamente la sección
idempotente de la etapa actual, procesar lotes ascendentes desde
`last_owner_id`, confirmar cada lote y avanzar el marcador; las secciones DDL
y de constraints se relanzan solo después de verificar su estado en
`information_schema`. No se inventa un comando `pnpm migrate`.

El quality gate E2E sí tiene un comando real: `pnpm test:e2e`, definido en el
`package.json` root y ejecutado por Playwright sobre `e2e/` según
`playwright.config.ts`.

## 11. Archivo operativo `pendiente.sql`

La ejecución manual está materializada en
`specs/company-email-settings/pendiente.sql`. El archivo no pertenece al
runtime ni se autoejecuta: se invoca con el cliente MySQL del despliegue y
contiene todos los comandos ordenados para preflight, schema, backfill,
aceptaciones, constraints y validación. La tabla
`company_email_migration_state` permite consultar la etapa confirmada y
reanudar el archivo sin duplicar el progreso.

## 12. Dirección frontend y reutilización

La dirección de `frontend-design.md` es compatible con el stack existente:
React Router, `useDevice`, TanStack Query, React Hook Form + Zod, wrappers de
`@app/Application/Components` y estados `EmptyScreenError`/`EmptyState`.

**Decisión visual**: layout feature-scoped con tokens `ink-950`, `indigo-900`,
`violet-500`, `ice-100`, `slate-400`, `amber-400`; tipografía Sora/Manrope/IBM
Plex Mono con fallbacks; rail origen → destino para cada ruta. Desktop monta
rail contextual; mobile lo convierte en header compacto mediante `useDevice`,
sin dos árboles ocultos por CSS.

Se conservan los wrappers existentes para botones, checkbox, dialogs, textos y
containers. No se introduce un dashboard de cuatro tarjetas ni un formulario
plano.

La auditoría se expone únicamente mediante `getAudit`, una API tenant-scoped
para tooling de seguridad/operaciones. No se agrega UI de auditoría en esta
feature; la vista continúa enfocada en la torre de control y sus cuatro zonas.

## 13. Resumen de decisiones

| Decisión                       | Rationale                               | Alternativa descartada                   |
| ------------------------------ | --------------------------------------- | ---------------------------------------- |
| Dominio nuevo persistente      | Cohesiona policy, contenido y auditoría | JSON en `sis_propietarios`               |
| Recipient list propia          | Soporta externos sin acceso             | Resolver admins actuales en cada envío   |
| Policy use case                | Evita olvidos y acoplamiento a tablas   | Cada trigger lee settings                |
| Terms version id en acceptance | Historial y aceptación exacta           | Sobrescribir el único registro existente |
| Concurrencia optimista         | Evita pérdidas silenciosas              | Last-write-wins                          |
| Allowlist server-side          | Seguridad en emails, API y preview      | Sanitización solo frontend               |
| `dashboard-access` existente   | Reutiliza permiso admin vigente         | Nuevo permiso y seed en esta feature     |
| Rail de rutas                  | Hace visible qué se envía y a quién     | Lista plana de switches                  |

Todas las aclaraciones del technical context quedan resueltas; no hay
`NEEDS CLARIFICATION` pendiente.
