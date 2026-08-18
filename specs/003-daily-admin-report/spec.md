# Feature Specification: Daily Admin Report

**Feature Branch**: `003-daily-admin-report`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Implementar un reporte diario por email que se envía automáticamente todos los días a las 9:00 AM (hora Argentina) a todos los administradores de cada empresa, con 7 secciones: empleados de licencia hoy, licencias pendientes de aprobación, documentos sin firmar, términos y condiciones sin aceptar, vacaciones próximas (15 días), licencias que vencen esta semana, y resumen estadístico."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Envío automático del reporte diario (Priority: P1)

Como administrador de una empresa, quiero recibir un email automático todos los días a las 9:00 AM (hora Argentina) con un resumen del estado actual de mi empresa, para tener visibilidad inmediata de lo que requiere mi atención sin tener que ingresar al sistema.

**Why this priority**: Es el corazón de la feature. Sin el envío automático programado, las demás secciones no tienen canal de entrega. Es el MVP mínimo: si solo se implementa el envío con datos básicos, ya aporta valor.

**Independent Test**: Se puede verificar configurando el scheduler, esperando el trigger (o ejecutándolo manualmente), y confirmando que se genera y envía un email a los administradores de cada empresa activa. Se valida sin necesidad de que todas las secciones de contenido estén implementadas — basta con un template básico con datos de prueba.

**Acceptance Scenarios**:

1. **Given** el servidor está corriendo y hay al menos una empresa activa con administradores configurados, **When** son las 9:00 AM hora Argentina (America/Argentina/Buenos_Aires), **Then** el sistema genera un reporte por cada empresa y lo envía por email a todos los administradores de esa empresa.
2. **Given** el servidor se reinicia, **When** el scheduler se inicializa, **Then** el cron job se registra correctamente y queda activo para el próximo trigger.
3. **Given** existen 3 empresas activas con administradores, **When** se ejecuta el reporte, **Then** se envían 3 emails independientes (uno por empresa), cada uno con los datos filtrados por `id_propietario`.
4. **Given** una empresa no tiene administradores configurados, **When** se ejecuta el reporte, **Then** se omite el envío para esa empresa sin error y se registra en log.

---

### User Story 2 - Sección: Empleados de licencia hoy (Priority: P2)

Como administrador, quiero ver en el reporte quiénes están de licencia el día de hoy, para saber qué empleados no están disponibles y planificar el trabajo del día.

**Why this priority**: Es la sección de mayor uso operativo diario. Los admins necesitan saber quiénes no están para redistribuir tareas.

**Independent Test**: Se puede verificar creando licencias con `startDate <= hoy <= endDate` y confirmando que aparecen en la sección del email con nombre del empleado, tipo de licencia, fechas de inicio/fin y fecha de reintegro.

**Acceptance Scenarios**:

1. **Given** un empleado tiene una licencia aprobada con startDate = ayer y endDate = mañana, **When** se genera el reporte de hoy, **Then** aparece en la sección "Empleados de licencia hoy" con su nombre, tipo de licencia, fecha de inicio, fecha de fin y fecha de reintegro.
2. **Given** un empleado tiene una licencia con endDate = ayer, **When** se genera el reporte de hoy, **Then** NO aparece en la sección (la licencia ya finalizó).
3. **Given** un empleado tiene una licencia con estado "pendiente", **When** se genera el reporte, **Then** NO aparece en esta sección (solo licencias aprobadas cuentan como "de licencia hoy").
4. **Given** no hay empleados de licencia hoy en una empresa, **When** se genera el reporte, **Then** la sección se muestra con un mensaje indicando que no hay empleados de licencia.

---

### User Story 3 - Sección: Licencias pendientes de aprobación (Priority: P2)

Como administrador, quiero ver las licencias que están pendientes de mi aprobación, para poder revisarlas y aprobarlas o rechazarlas a la brevedad.

**Why this priority**: Es la sección de acción directa. Los admins necesitan saber qué licencias requieren su decisión. La antigüedad de la solicitud ayuda a priorizar.

**Independent Test**: Se puede verificar creando licencias con estado "pendiente" y confirmando que aparecen en la sección con nombre del empleado, tipo de licencia, fechas solicitadas y antigüedad de la solicitud (días transcurridos desde la creación).

**Acceptance Scenarios**:

1. **Given** un empleado solicitó una licencia hace 3 días con estado "pendiente", **When** se genera el reporte, **Then** aparece en la sección con nombre del empleado, tipo de licencia, fechas de inicio/fin solicitadas y antigüedad "3 días".
2. **Given** hay 5 licencias pendientes de diferentes empleados, **When** se genera el reporte, **Then** las 5 aparecen listadas en la sección.
3. **Given** una licencia fue aprobada ayer (cambió de "pendiente" a "aprobado"), **When** se genera el reporte hoy, **Then** NO aparece en esta sección.
4. **Given** no hay licencias pendientes en una empresa, **When** se genera el reporte, **Then** la sección se muestra con un mensaje indicando que no hay licencias pendientes.

---

### User Story 4 - Sección: Documentos sin firmar (Priority: P2)

Como administrador, quiero ver los documentos que requieren firma pero no fueron firmados, para hacer seguimiento con los empleados correspondientes.

**Why this priority**: Los documentos sin firmar representan riesgo legal/operativo. Los admins necesitan visibilidad para hacer seguimiento.

**Independent Test**: Se puede verificar creando documentos con `requireSign = true` y `signed = null`, confirmando que aparecen en la sección con nombre del documento, nombre del empleado y estado de visualización (visto/no visto basado en el campo `view`).

**Acceptance Scenarios**:

1. **Given** un documento requiere firma (`requireSign = true`), no fue firmado (`signed = null`), y el empleado lo vio (`view` tiene fecha), **When** se genera el reporte, **Then** aparece con nombre del documento, nombre del empleado y estado "Visto".
2. **Given** un documento requiere firma, no fue firmado, y el empleado NO lo vio (`view = null`), **When** se genera el reporte, **Then** aparece con estado "No visto".
3. **Given** un documento ya fue firmado (`signed` tiene fecha), **When** se genera el reporte, **Then** NO aparece en esta sección.
4. **Given** un documento no requiere firma (`requireSign = false`), **When** se genera el reporte, **Then** NO aparece en esta sección aunque no esté firmado.

---

### User Story 5 - Sección: Términos y condiciones sin aceptar (Priority: P2)

Como administrador, quiero ver qué empleados tienen pendiente la aceptación de los términos y condiciones, para asegurar el cumplimiento normativo de la empresa.

**Why this priority**: La aceptación de términos es un requisito legal/compliance. Los admins necesitan saber quiénes no han aceptado para recordarles.

**Independent Test**: Se puede verificando que empleados que NO tienen una entrada correspondiente en `DisclaimerAcceptance` (para su `id_empresa`) aparecen en la sección.

**Acceptance Scenarios**:

1. **Given** un empleado activo no tiene registro en `DisclaimerAcceptance` para su empresa, **When** se genera el reporte, **Then** aparece en la sección con su nombre y email.
2. **Given** un empleado ya aceptó los términos (tiene registro en `DisclaimerAcceptance`), **When** se genera el reporte, **Then** NO aparece en esta sección.
3. **Given** todos los empleados de una empresa aceptaron los términos, **When** se genera el reporte, **Then** la sección se muestra con un mensaje indicando que todos aceptaron.

---

### User Story 6 - Sección: Vacaciones próximas (próximos 15 días) (Priority: P3)

Como administrador, quiero ver qué empleados se tomarán vacaciones en los próximos 15 días, para planificar la cobertura y preparar el trabajo del equipo.

**Why this priority**: Las vacaciones son predecibles y permiten planificación anticipada. Es útil pero menos urgente que las licencias del día o las pendientes de aprobación.

**Independent Test**: Se puede verificar creando licencias con `tipo_certificados.id = 1` (y descripción que contenga "vacaciones") con `startDate` dentro de los próximos 15 días, confirmando que aparecen con nombre del empleado, sector/segmento, y fechas de inicio/fin.

**Acceptance Scenarios**:

1. **Given** un empleado tiene vacaciones aprobadas con startDate = dentro de 10 días, **When** se genera el reporte, **Then** aparece en la sección con nombre, sector/segmento, fecha de inicio y fecha de fin.
2. **Given** un empleado tiene vacaciones con startDate = dentro de 20 días, **When** se genera el reporte, **Then** NO aparece (fuera del rango de 15 días).
3. **Given** un empleado tiene vacaciones con startDate = hoy, **When** se genera el reporte, **Then** NO aparece en esta sección (aparece en "Empleados de licencia hoy").
4. **Given** un empleado tiene vacaciones con startDate = mañana, **When** se genera el reporte, **Then** SÍ aparece en esta sección.
5. **Given** las vacaciones se identifican por `tipo_certificados.id = 1` con descripción que contiene "vacaciones", **When** se consulta, **Then** solo se incluyen registros que cumplan ambos criterios.

---

### User Story 7 - Sección: Licencias que vencen esta semana (Priority: P3)

Como administrador, quiero ver las licencias aprobadas que vencen en los próximos 7 días, para preparar el reintegro de los empleados y planificar su vuelta.

**Why this priority**: Permite a los admins preparar el reintegro con anticipación. Es útil pero menos crítico que las secciones de acción inmediata.

**Independent Test**: Se puede verificar creando licencias aprobadas con `endDate` dentro de los próximos 7 días, confirmando que aparecen en la sección.

**Acceptance Scenarios**:

1. **Given** una licencia aprobada tiene endDate = dentro de 5 días, **When** se genera el reporte, **Then** aparece en la sección con nombre del empleado, tipo de licencia y fecha de fin.
2. **Given** una licencia aprobada tiene endDate = dentro de 10 días, **When** se genera el reporte, **Then** NO aparece (fuera del rango de 7 días).
3. **Given** una licencia tiene endDate = hoy, **When** se genera el reporte, **Then** SÍ aparece (vence hoy, aún dentro de los 7 días).
4. **Given** una licencia tiene estado "pendiente" y endDate dentro de 7 días, **When** se genera el reporte, **Then** NO aparece en esta sección (solo licencias aprobadas).

---

### User Story 8 - Sección: Resumen estadístico (Priority: P3)

Como administrador, quiero ver un resumen con totales clave al final del reporte, para tener contexto rápido del estado general de mi empresa sin leer todas las secciones en detalle.

**Why this priority**: El resumen proporciona un overview rápido. Es complementario a las secciones detalladas y aporta valor cuando el admin tiene poco tiempo.

**Independent Test**: Se puede verificando que el email incluye una sección final con 5 totales: empleados activos, licencias en curso, licencias pendientes, documentos sin firmar, términos pendientes.

**Acceptance Scenarios**:

1. **Given** una empresa tiene 50 empleados activos, 3 licencias en curso, 5 pendientes, 10 documentos sin firmar y 8 términos pendientes, **When** se genera el reporte, **Then** el resumen estadístico muestra exactamente esos 5 valores.
2. **Given** una empresa tiene 0 licencias pendientes, **When** se genera el reporte, **Then** el resumen muestra "Licencias pendientes: 0".
3. **Given** el resumen estadístico se muestra, **When** se revisa el email, **Then** aparece como la última sección del reporte, después de todas las secciones detalladas.

---

### User Story 9 - Resiliencia del envío multi-tenant (Priority: P2)

Como sistema, necesito que si el envío de email a una empresa falla, no bloquee el envío a las demás empresas, para garantizar que todas las empresas reciban su reporte independientemente de fallos puntuales.

**Why this priority**: La resiliencia es crítica en un sistema multi-tenant. Un fallo en una empresa no debe afectar a las demás.

**Independent Test**: Se puede verificar simulando un fallo de envío en una empresa (ej. email inválido o error SMTP) y confirmando que las demás empresas reciben su reporte correctamente.

**Acceptance Scenarios**:

1. **Given** hay 3 empresas activas y el envío a la empresa B falla (error SMTP), **When** se ejecuta el reporte, **Then** las empresas A y C reciben su email correctamente, y el error de B se registra en log.
2. **Given** el envío a todas las empresas falla, **When** se ejecuta el reporte, **Then** todos los errores se registran en log y el proceso completa sin excepción no manejada.
3. **Given** una empresa tiene un admin con email inválido, **When** se intenta enviar, **Then** el error se registra en log y no afecta el envío a otros admins de la misma empresa ni a otras empresas.

---

### Edge Cases

- **¿Qué pasa si no hay empresas activas?** El scheduler se ejecuta pero no envía ningún email. Se registra en log que no había empresas procesables.
- **¿Qué pasa si el servidor está caído a las 9 AM?** El scheduler de `node-cron` no recupera ejecuciones perdidas por defecto. El reporte se enviará al día siguiente a las 9 AM. No se requiere mecanismo de catch-up.
- **¿Qué pasa si una empresa tiene muchos empleados y la consulta es lenta?** Cada empresa se procesa de forma independiente y secuencial. Si una consulta tarda, retrasa el envío de esa empresa pero no de las demás (ya que se procesan en paralelo o secuencial con manejo de errores individual).
- **¿Qué pasa si un admin tiene múltiples roles?** Se usa `getAdmins()` que filtra por `id_rol: 1`, por lo que solo se incluyen usuarios con rol de administrador. Un usuario con múltiples roles pero que incluya el rol admin recibirá el email.
- **¿Qué pasa si un empleado pertenece a múltiples segmentos?** En la sección de vacaciones, se muestra el segmento principal o el primero encontrado. No se duplica el empleado.
- **¿Qué pasa si la zona horaria del servidor no es Argentina?** El scheduler usa explícitamente la zona horaria `America/Argentina/Buenos_Aires`, por lo que funciona correctamente independientemente de la zona horaria del servidor.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE ejecutar un scheduler que se dispare todos los días a las 9:00 AM hora Argentina (America/Argentina/Buenos_Aires).
- **FR-002**: El sistema DEBE generar un reporte independiente por cada empresa activa, filtrando todos los datos por `id_propietario`.
- **FR-003**: El sistema DEBE enviar el reporte por email a todos los administradores de cada empresa usando `MailNotificationService.send()`.
- **FR-004**: El sistema DEBE resolver los destinatarios usando `getAdmins()` del `PermissionsRepository` (usuarios con `id_rol: 1` y `id_propietario` correspondiente).
- **FR-005**: El reporte DEBE incluir la sección "Empleados de licencia hoy" con empleados que tienen licencias aprobadas donde `startDate <= hoy <= endDate`, mostrando nombre, tipo de licencia, fechas de inicio/fin y fecha de reintegro.
- **FR-006**: El reporte DEBE incluir la sección "Licencias pendientes de aprobación" con licencias en estado "pendiente", mostrando nombre del empleado, tipo de licencia, fechas solicitadas y antigüedad de la solicitud en días.
- **FR-007**: El reporte DEBE incluir la sección "Documentos sin firmar" con documentos donde `requireSign = true` y `signed = null`, mostrando nombre del documento, nombre del empleado y estado de visualización (visto/no visto basado en el campo `view`).
- **FR-008**: El reporte DEBE incluir la sección "Términos y condiciones sin aceptar" con empleados activos que no tienen registro en `DisclaimerAcceptance` para su empresa, mostrando nombre y email.
- **FR-009**: El reporte DEBE incluir la sección "Vacaciones próximas (próximos 15 días)" con licencias donde `tipo_certificados.id = 1` y descripción contiene "vacaciones", con `startDate` dentro de los próximos 15 días, mostrando nombre del empleado, sector/segmento, y fechas de inicio/fin.
- **FR-010**: El reporte DEBE incluir la sección "Licencias que vencen esta semana" con licencias aprobadas cuyo `endDate` está dentro de los próximos 7 días, mostrando nombre del empleado, tipo de licencia y fecha de fin.
- **FR-011**: El reporte DEBE incluir una sección "Resumen estadístico" al final con los totales de: empleados activos, licencias en curso, licencias pendientes, documentos sin firmar y términos pendientes.
- **FR-012**: Si el envío de email a una empresa falla, el sistema DEBE continuar con el envío a las demás empresas sin interrumpir el proceso.
- **FR-013**: Todos los errores de envío DEBE registrarse en log con el identificador de la empresa afectada y el motivo del error.
- **FR-014**: El sistema DEBE usar un template HTML definido en `EmailsTemplates.ts` para el formato del email.
- **FR-015**: El scheduler DEBE inicializarse al arrancar el servidor y quedar activo para ejecuciones recurrentes.

### Key Entities _(include if feature involves data)_

- **Certificate**: Licencia de empleado. Atributos relevantes: `startDate`, `endDate`, `returnDate`, `reason`, `status` (pendiente/aprobado/rechazado/validando/eliminado), `userId`, `type` (CertificateTypes). Relaciones: pertenece a un empleado (User) y tiene un tipo (CertificateType).
- **CertificateType**: Tipo de licencia. Atributos relevantes: `id`, `name`, `description`, `rest`. Las vacaciones se identifican por `id = 1` y descripción que contiene "vacaciones".
- **Document**: Documento que requiere firma. Atributos relevantes: `signed` (fecha de firma o null), `requireSign` (boolean), `view` (fecha de visualización o null), `user` (id, name, surname).
- **User**: Empleado. Atributos relevantes: `nombre`, `apellido`, `email`, `id_propietario`. Relaciones: pertenece a una empresa (owner), puede tener segmentos (UserSegment).
- **DisclaimerAcceptance**: Registro de aceptación de términos. Atributos relevantes: `id_usuario`, `id_empresa`, `timestamp`. Su ausencia indica que el empleado no ha aceptado.
- **UserSegment / SegmentType**: Segmentación de empleados. Usado para mostrar el sector/segmento del empleado en la sección de vacaciones.
- **DailyReport (nuevo concepto)**: No es una entidad persistente, sino un DTO de salida que agrupa las 7 secciones del reporte para una empresa específica.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las empresas activas con administradores configurados reciben su reporte diario en un plazo máximo de 15 minutos después de las 9:00 AM hora Argentina.
- **SC-002**: El reporte contiene información precisa: al menos el 99% de los datos mostrados coinciden con el estado real del sistema al momento de la generación.
- **SC-003**: Si el envío a una empresa falla, el 100% de las demás empresas reciben su reporte sin interrupción (tolerancia a fallos por empresa).
- **SC-004**: Los administradores pueden identificar en menos de 30 segundos las acciones pendientes que requieren su atención (licencias pendientes de aprobación, documentos sin firmar) gracias a las secciones del reporte.
- **SC-005**: El sistema soporta el envío a todas las empresas activas sin degradación del rendimiento del servidor principal (el procesamiento del reporte no bloquea otras operaciones del sistema).
- **SC-006**: El 95% de los administradores que reciben el reporte lo consideran útil para su gestión diaria (medible mediante encuesta posterior al lanzamiento).
- **SC-007**: Todos los errores de envío se registran en log con información suficiente para diagnóstico (empresa afectada, motivo del error, timestamp) en el 100% de los casos de fallo.

## Assumptions

- Se asume que la infraestructura de email existente (`MailNotificationService`, `SendEmailService`, SMTP configurado) está operativa y funcional. No se requiere configurar nuevo servidor SMTP.
- Se asume que `getAdmins()` devuelve al menos un administrador por empresa activa. Si una empresa no tiene administradores, se omite el envío sin error.
- Se asume que `node-cron` es suficiente para el scheduling. No se requiere un sistema de colas distribuido (ej. Bull, RabbitMQ) para esta primera versión.
- Se asume que el servidor está corriendo continuamente. Si el servidor está caído a las 9 AM, no hay mecanismo de catch-up; el reporte se enviará al día siguiente.
- Se asume que los datos de licencias, documentos y términos están actualizados y son consistentes. No se requiere validación de integridad de datos como parte de esta feature.
- Se asume que el template HTML del email será responsive (adaptable a móviles) para que los admins puedan leerlo desde cualquier dispositivo.
- Se asume que la zona horaria de Argentina (America/Argentina/Buenos_Aires) es fija y no requiere configuración adicional por empresa.
- Se asume que el procesamiento de cada empresa es independiente y puede ejecutarse secuencialmente. Si el número de empresas crece significativamente (>100), podría requerir optimización con procesamiento paralelo, pero eso está fuera del alcance de esta primera versión.
- Se asume que las vacaciones se identifican de forma consistente por `tipo_certificados.id = 1` con descripción que contiene "vacaciones". Si existen otros tipos de vacaciones con diferente ID, no se incluirán en esta primera versión.
- Se asume que el campo `view` de Document indica si el empleado vio el documento (fecha de visualización). Un valor null significa "no visto".
