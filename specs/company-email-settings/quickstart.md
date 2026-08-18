# Quickstart: Company Email Settings — Guía de Validación

**Feature**: `company-email-settings` | **Date**: 2026-08-16

Esta guía valida comportamiento end-to-end sin duplicar cuerpos de entidades ni
procedimientos. Consultar [data-model.md](./data-model.md) y
[contracts/interfaces.md](./contracts/interfaces.md) para los contratos.

## Prerrequisitos

- MySQL de prueba accesible y backup/restauración disponible.
- SMTP configurado con `EMAIL_SMTPSERVER`, `EMAIL_SMTPPORT`, `EMAIL_SMTPUSER` y
  `EMAIL_SMTPPASSWORD` si se validan envíos reales.
- Server: `pnpm server:dev`.
- App: `pnpm app:dev`.
- Un administrador con `dashboard-access` y acceso a dos empresas.
- Un empleado sin ese permiso y un email externo de prueba.

## 1. Migración y backfill

1. El repositorio no tiene comando de migración (`pnpm migrate`, Sequelize CLI
   o runner SQL). El operador ejecuta `specs/company-email-settings/pendiente.sql`
   mediante el cliente MySQL del despliegue, sobre una copia con al menos dos
   empresas:

   ```bash
   mysql --defaults-extra-file=/secure/mysql.cnf --database=GESTDOC < specs/company-email-settings/pendiente.sql
   ```

   Si el proceso se interrumpe, consultar `company_email_migration_state`,
   relanzar la sección idempotente de la etapa actual y continuar lotes desde
   `last_owner_id`. La migración runtime `002_company_email_settings.sql` debe
   conservar el mismo comportamiento antes de promoverse.

2. Comparar por empresa los admins legacy (`id_rol = 1`) contra
   `company_email_recipients`.
3. Confirmar nueve deliveries y siete secciones activas en la versión inicial.
4. Confirmar que `texto_disclaimer` produce la versión 1 y que cada fila de
   `disclaimer_firmas` tiene `terms_version_id` de su empresa.

**Esperado**: migración idempotente y reanudable por etapas, sin pérdida de
recipients ni aceptaciones, sin reaceptación masiva y sin filas cruzadas entre
empresas. La etapa DDL puede haber hecho commit sin marcar la migración completa.

## 2. Lectura, permisos y tenant isolation

1. Entrar como admin de empresa A y abrir la pantalla.
2. Confirmar que `companyEmailSettings.get` devuelve snapshot completa, versión,
   recipients, rutas, secciones y términos.
3. Invocar `get`, `update` y `getAudit` como empleado.
4. Cambiar a empresa B y comprobar que sus datos son distintos. Intentar enviar
   un `ownerId` adicional o un id de recipient ajeno.

**Esperado**: el empleado no recibe datos; los accesos ajenos tienen el mismo
resultado genérico que un registro inexistente; el tenant no se toma del input.

## 3. Provisioning lazy de empresas nuevas

1. Crear o seleccionar un tenant que no tenga fila en
   `company_email_settings` después del backfill.
2. Ejecutar `companyEmailSettings.get` y repetirlo desde dos sesiones.
3. Provocar un trigger automático para ese owner.

**Esperado**: el primer acceso materializa una raíz versión 1, nueve rutas,
siete secciones, términos legacy y recipients válidos; los accesos concurrentes
no crean duplicados; existe un evento `lazy_provision`.

## 4. Guardado atómico y concurrencia

1. En A, cambiar switches, recipients, secciones y mensaje de inicio.
2. Guardar con `companyEmailSettings.update`.
3. Recargar y verificar una única nueva versión con todos los cambios.
4. Abrir dos sesiones con la misma versión; guardar en la primera y luego en la
   segunda sin recargar.
5. Provocar una validación inválida y una falla de persistencia controlada.

**Esperado**: el segundo guardado recibe 409 y recarga; validación/falla no deja
cambios parciales y la última snapshot válida permanece.

## 5. Destinatarios y reglas de combinación

1. Agregar `Admin@Example.com` y luego `admin@example.com`.
2. Intentar un email inválido, una lista vacía con una ruta admin activa y una
   dirección externa válida.
3. Desactivar todas las rutas y guardar sin recipients.
4. Reactivar una ruta admin sin recipients.
5. Quitar un recipient y volver a agregar la misma dirección.

**Esperado**: duplicado case-insensitive e inválido se rechazan; externo se
guarda sin crear usuario; todas las rutas apagadas se permiten; ruta admin
activa sin recipient se bloquea; una empresa nunca usa recipients de otra; la
fila removida desaparece físicamente y el re-add crea una nueva fila sin
colisión de unicidad.

## 6. Reporte matutino y catálogo

1. Dejar activo `admin_daily_report` y seleccionar solo
   `statistical_summary` y `pending_licenses`.
2. Ejecutar `dailyReport.generateManual` o esperar `0 9 * * *` en
   `America/Argentina/Buenos_Aires`.
3. Desactivar cada código y provocar el evento correspondiente: licencia nueva,
   cambio de estado, firma, reminder de términos, reporte, reminder diario,
   documento nuevo y envío manual.

**Esperado**: el reporte no consulta ni incluye secciones no seleccionadas;
cada email desactivado no llama al sender; otras empresas no cambian; el envío
manual usa al requester y nunca la lista admin.

## 7. Welcome message y composición runtime

1. Guardar un mensaje institucional válido con `companyEmailSettings.update`.
2. Generar cada uno de los ocho emails automáticos compatibles.
3. Verificar que el mensaje aparece como preámbulo antes del cuerpo renderizado.
4. Generar `requester_document_manual` y un `employee_terms_reminder`.

**Esperado**: los ocho automáticos reciben el preámbulo; el envío manual no lo
recibe; el recordatorio de términos conserva el contenido legal intacto y solo
agrega el bloque institucional antes de ese contenido. La aplicación ocurre
después del template y antes de `MailNotificationService.sendOne()`.

## 8. Términos y aceptación

1. Editar preferencias/mensaje y ejecutar `update`; confirmar que no cambia la
   versión legal.
2. Editar términos válidos y ejecutar `publishTerms` confirmando la nueva
   aceptación.
3. Intentar publicar el mismo hash sanitizado.
4. Verificar incremento de versión, hash y preview sanitizada.
5. Abrir la aceptación como empleado antes y después de publicar.
6. Aceptar la versión mostrada y consultar estado/historial.
7. Intentar aceptar una versión stale.

**Esperado**: la versión anterior queda histórica; la nueva queda pendiente; la
aceptación se vincula a la versión mostrada; una aceptación previa no marca la
nueva como aceptada; `update` no publica; el hash repetido falla con
`DUPLICATE_TERMS_CONTENT`.

## 9. Validación de contenido

Probar saltos de línea, `strong`, `em`, listas y enlaces HTTPS. Luego probar
`script`, `iframe`, `style`, atributos `onerror`, URL `javascript:` y contenido
por encima de los límites.

**Esperado**: formato permitido se conserva; payload no permitido se rechaza o
neutraliza antes de persistir y nunca se ejecuta en preview/email; el texto
anterior permanece si falla.

## 10. Estados UX y responsive

1. Simular latencia: skeleton de cabecera/rutas sin switches editables.
2. Simular error de query: `EmptyScreenError` con `Reintentar`, sin snapshot
   parcial.
3. Usar una empresa sin recipients: empty contextual con `Agregar destinatario`
   y riesgo ámbar textual.
4. Editar sin guardar, navegar atrás y recargar.
5. Guardar y verificar spinner/bloqueo, luego confirmación visible con versión y
   hora.
6. Repetir en desktop y viewport mobile.

**Esperado**: torre de control; rail contextual desktop; header compacto mobile;
rutas origen → destino → estado; no dos árboles React ocultos por CSS; ámbar no
es el único indicador y el foco es visible.

## 11. Auditoría API

Consultar `companyEmailSettings.getAudit` directamente como tooling autorizado
después de cambios accepted,
validaciones rejected, conflicto de versión, acceso denegado y backfill.

**Esperado**: cada evento contiene owner, actor, acción, timestamp, resultado,
razón y referencias/hash; no contiene texto completo ni confirma datos de otro
tenant. No se espera una pantalla de auditoría en la aplicación de esta
feature.

## 12. Scheduler y contextos

1. Esperar o ejecutar el scheduler con contexto de sistema
   `new RequestContext(0, requestId, 0)`.
2. Verificar en logs/policy trace un contexto sintético por owner creado como
   `new RequestContext(0, requestId, owner.id)`.
3. Ejecutar `dailyReport.generateManual` y
   `employeeReminders.sendDailyReminders` autenticado como admin de A.
4. Intentar afectar B desde el trigger manual sin cambiar el tenant activo.

**Esperado**: el scheduler resuelve policy por cada owner; los triggers manuales
usan el contexto autenticado y solo ejecutan para A; nunca aceptan un owner id
externo. `userId=0` solo aparece en jobs internos.

## 13. Quality gates

```bash
pnpm tsc
pnpm lint
pnpm test
pnpm test:e2e
```

`pnpm test:e2e` es un script root existente que ejecuta Playwright sobre
`e2e/` usando `playwright.config.ts`; el backend debe estar disponible además
del web server de frontend configurado allí.

Todos deben pasar antes del handoff a QA. Los escenarios de negocio y
multi-tenancy deben usar datos concretos, no mocks vacíos.
