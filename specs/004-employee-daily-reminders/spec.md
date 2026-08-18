# Feature Specification: Employee Daily Reminders

**Feature Branch**: `004-employee-daily-reminders`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Un mail diario (todas las mañanas) que se envía a CADA empleado con la lista de sus pendientes de acción. A diferencia del reporte diario actual (que va a los admins), este es un email individual por empleado con sus propias tareas pendientes. Además, cuando un empleado recibe un documento nuevo, se le informa en el momento (notificación en tiempo real, distinta del batch diario)."

## Decisiones de Alcance (fase de Clarify)

**Alcance batch diario: EXACTAMENTE 4 pendientes.**

1. Documentos sin firmar (`documentos.firmado IS NULL`).
2. Términos y condiciones sin aceptar (sin registro en `disclaimer_firmas`).
3. Renovar contraseña (`usuarios.renovar_clave = true`).
4. Documentos sin visualizar (`documentos.visualizado IS NULL`).

**Notificación en tiempo real (nuevo requisito):** cuando un empleado recibe un documento nuevo, se le informa en el momento vía email (trigger event-driven, independiente del batch diario).

**Política de envío (batch):** email SOLO si el empleado tiene al menos 1 pendiente. La notificación en tiempo real se envía en el momento del evento.

**UI:** solo backend + scheduler + emails. Sin página/UI de consulta para administradores en esta fase.

### Registro de cambio de alcance

- **Removido el pendiente "nunca inició sesión"** (decisión previa): se elimina el data-model `ultimo_login` en `usuarios` y todo el tracking de login asociado. Los FR, user stories, edge cases y assumptions de ese pendiente quedan fuera del spec.
- **Removido el pendiente "completar perfil"** (se mantiene fuera): no se evalúan los campos opcionales del perfil.
- **Nuevo requisito — notificación en tiempo real de documento nuevo**: trigger event-driven aparte del batch diario.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - El empleado recibe su email diario de pendientes (Priority: P1)

Como empleado, quiero recibir cada mañana un email dirigido exclusivamente a mí con la lista de mis acciones pendientes, para saber qué debo hacer en el sistema sin entrar a revisar cada sección manualmente.

**Why this priority**: Es el núcleo de la feature. Sin el envío automático diario e individual, el resto de los pendientes no tienen canal de entrega. Es el slice mínimo viable.

**Independent Test**: Se puede verificar configurando el scheduler, disparando la ejecución, y confirmando que cada empleado activo con al menos un pendiente recibe un email propio listando solo sus pendientes. Basta con un template de prueba.

**Acceptance Scenarios**:

1. **Given** hay empleados activos con email válido y pendientes en distintas empresas, **When** se ejecuta el envío diario, **Then** cada empleado recibe un email individual con su nombre en el saludo y únicamente sus pendientes, filtrados por su empresa y su usuario.
2. **Given** un empleado no tiene ningún pendiente, **When** se ejecuta el envío, **Then** NO se le envía correo en esa corrida diaria.
3. **Given** una cuenta no tiene email válido, **When** se ejecuta el envío, **Then** se omite sin error.
4. **Given** el servidor se reinicia, **When** el scheduler se inicializa, **Then** el cron job se registra y queda listo para el próximo ciclo, sin duplicar envíos del día.

---

### User Story 2 - Pendiente: documentos sin firmar (Priority: P1)

Como empleado, quiero ver en mi email los documentos que requieren mi firma pero aún no firmé, para completar la firma pendiente.

**Why this priority**: la firma pendiente es un riesgo legal/operativo de primera línea y es la información que el empleado suele ignorar.

**Independent Test**: Se verifica creando un documento asignado al empleado con la fecha de firma vacía y confirmando que aparece en su email.

**Acceptance Scenarios**:

1. **Given** un documento asignado al empleado tiene el campo de firma vacío (`firmado = null`), **When** se genera su email, **Then** el pendiente aparece con el título del documento.
2. **Given** un documento asignado ya tiene fecha de firma, **When** se genera el email, **Then** el pendiente NO aparece.

---

### User Story 3 - Pendiente: términos y condiciones sin aceptar (Priority: P1)

Como empleado, quiero recibir un recordatorio si aún no acepté los términos y condiciones de mi empresa, para regularizar mi situación.

**Why this priority**: la aceptación de términos es un requisito de cumplimiento normativo; el empleado debe saber que tiene ese pendiente.

**Independent Test**: se verifica creando un empleado sin registro en `disclaimer_firmas` y confirmando que aparece.

**Acceptance Scenarios**:

1. **Given** el empleado no tiene registro de aceptación para su empresa, **When** se genera su email, **Then** aparece el pendiente.
2. **Given** el empleado ya aceptó (tiene registro), **When** se genera su email, **Then** NO aparece el pendiente.

---

### User Story 4 - Pendiente: renovar contraseña (Priority: P2)

Como empleado, quiero que el email me recuerde si debo renovar mi contraseña, para mantener mi cuenta segura.

**Why this priority**: es una cuestión de seguridad de cuenta (contraseña marcada para renovación), de menor fricción operativa que la firma de documentos.

**Independent Test**: se verifica marcando `renovar_clave = true` y confirmando que el pendiente aparece.

**Acceptance Scenarios**:

1. **Given** la cuenta tiene `renovar_clave = true`, **When** se genera el email, **Then** se muestra "Renovar contraseña".
2. **Given** la cuenta no tiene `renovar_clave = true`, **When** se genera el email, **Then** NO se muestra el pendiente de contraseña.

---

### User Story 5 - Pendiente: documentos sin visualizar (Priority: P2)

Como empleado, quiero que el email me avise de los documentos asignados que aún no visualicé, para revisar su contenido.

**Why this priority**: recuerdo proactivo de la revisión de documentos ya entregados.

**Independent Test**: se verifica con un documento con `visualizado = null` confirmando que el pendiente aparece.

**Acceptance Scenarios**:

1. **Given** un documento asignado al empleado tiene el campo de visualización vacío (`visualizado = null`), **When** se genera su email, **Then** aparece el pendiente con el título del documento.
2. **Given** el documento ya fue visualizado, **When** se genera el email, **Then** NO aparece.

---

### User Story 6 - Notificación en tiempo real de documento nuevo (Priority: P1)

Como empleado, quiero recibir un email en el mismo momento en que una empresa me asigna un documento nuevo, para ir a revisarlo (leerlo, visualizarlo o firmarlo) sin esperar al batch diario.

**Trigger / evento exacto**: se considera que un empleado "recibe" un documento nuevo cuando se ingresa un documento al sistema y queda asignado a ese empleado (registrando la fecha de ingreso del documento y su destinatario). En ese momento (y no antes) se dispara la notificación inmediata. La asignación posterior de un documento ya existente se trata como documento nuevo solo si es la primera asignación a ese empleado.

**Canal de notificación**: email inmediato dirigido al empleado destinatario, generado en el instante del evento, usando la infraestructura de email existente. La notificación adelanta el contenido del documento nuevo.

**Convivencia con el batch diario**: la notificación inmediata es un disparo aparte y no reemplaza al batch. Si el documento sigue pendiente al día siguiente (sin firmar y/o sin visualizar), también aparecerá en el batch diario. Un mismo documento puede generar la notificación inmediata hoy y, si persiste, el pendiente en el email diario.

**Independent Test**: Se puede verificar creando un documento asignado a un empleado y confirmando que en el instante recibe el email de notificación; y que el documento sigue siendo pendiente al día siguiente.

**Acceptance Scenarios**:

1. **Given** se ingresa un documento asignado a un empleado con email válido, **When** se completa la operación de ingreso, **Then** el empleado recibe al instante un email de notificación del documento.
2. **Given** se ingresan varios documentos asignados al mismo empleado en la misma operación, **When** se completa el ingreso, **Then** el empleado recibe UNA notificación que lista todos los documentos nuevos.
3. **Given** un empleado destinatario no tiene email válido, **When** se ingresa un documento, **Then** se omite la notificación inmediata y se registra en log.
4. **Given** un documento se ingresa sin ser asignado a un empleado, **When** se procesa, **Then** no se genera notificación inmediata.
5. **Given** el envío de la notificación inmediata falla (error SMTP), **When** se ingresa el documento, **Then** no se bloquea el ingreso; el error se registra y el documento queda cubierto por el batch diario si sigue pendiente.

---

### User Story 7 - Resiliencia del envío multi-tenant (Priority: P2)

Como sistema, necesito que el procesamiento por empleado sea independiente por empresa con fallos aislados, para que una empresa o empleado con problema no bloquee a los demás.

**Why this priority**: multi-tenant es obligatorio y el volumen de emails crece.

**Independent Test**: Se puede verificar simulando un fallo de envío en una empresa y confirmando que las demás empresas sí reciben su email.

**Acceptance Scenarios**:

1. **Given** 3 empresas y falla el envío para la B, **When** se ejecuta el ciclo, **Then** A y C reciben sus emails y el error de B se registra en el log.
2. **Given** un email inválido dentro de una empresa, **When** se intenta el envío, **Then** se registra el error sin afectar a los demás empleados de la misma empresa.
3. **Given** una empresa no tiene empleados con email válido, **When** se ejecuta el ciclo, **Then** se omite sin error y se registra en log.

---

### Edge Cases

- **Sin pendientes para un empleado**: el email diario NO se envía (decisión Q2). La notificación de documento nuevo, en cambio, se envía en el momento sin depender de pendientes.
- **Servidor caído a la hora programada del batch**: el scheduler no recupera corridas perdidas; se envía la próxima mañana. Sin catch-up.
- **Empleado sin email válido**: en batch se omite y se registra; en la notificación inmediata también se omite y se registra.
- **Documento sin asignar**: no genera notificación inmediata; tampoco aparece como pendiente de un empleado.
- **Varios documentos en la misma operación**: una notificación inmediata única los lista; en el batch aparecen como pendientes individuales el día siguiente.
- **Fallo SMTP en la notificación inmediata**: no bloquea el ingreso; el documento queda pendiente en el batch diario (fallback natural).
- **Un documento que persiste pendiente**: aparece un día en la notificación inmediata y al día siguiente en el batch (sin duplicar ni omitir; convivencia esperada).
- **Superposición con el reporte diario de admins**: el reminder individual no reemplaza al reporte administrativo; la convivencia es esperada.

## Requirements _(mandatory)_

### Functional Requirements

**Batch diario**

- **FR-001**: El sistema DEBE ejecutar un scheduler que dispare todos los días a las 9:00 AM hora Argentina (America/Argentina/Buenos_Aires), reutilizando el patrón del scheduler diario existente.
- **FR-002**: El sistema DEBE generar un email individual por cada empleado activo con email válido y al menos un pendiente, con su lista.
- **FR-003**: El sistema DEBE iterar por empresa (multi-tenant por `id_propietario`), aislar fallo por empresa, no bloquear a las demás.
- **FR-004**: El sistema DEBE incluir el pendiente "documentos sin firmar" cuando el empleado tiene documentos asignados con `firmado = null`.
- **FR-005**: El sistema DEBE incluir el pendiente "términos y condiciones sin aceptar" cuando no hay registro en `disclaimer_firmas` para el empleado y su empresa, o cuando el registro existe pero su estado es inválido (`estado ≠ 'Firmado'`).
- **FR-006**: El sistema DEBE incluir el pendiente "renovar contraseña" cuando `renovar_clave = true` en la cuenta.
- **FR-007**: El sistema DEBE incluir el pendiente "documentos sin visualizar" cuando tiene documentos con `visualizado = null`.
- **FR-008**: El sistema DEBE enviar el email ÚNICAMENTE si existe al menos 1 pendiente; sin pendientes no se envía.
- **FR-009**: El sistema DEBE registrar en el log todos los errores y omisiones de envío (por empleado/empresa/motivo/timestamp).
- **FR-010**: El sistema DEBE inicializar el scheduler al arrancar el servidor y dejarlo activo para corridas recurrentes.

**Notificación en tiempo real de documento nuevo**

- **FR-011**: El sistema DEBE disparar una notificación inmediata cada vez que un documento se ingresa y queda asignado a un empleado (primera asignación). Si el documento no queda asignado a un empleado, no se genera notificación.
- **FR-012**: La notificación DEBE enviarse por email inmediato al empleado destinatario con email válido, usando la infraestructura de email existente.
- **FR-013**: Cuando en una misma operación se asignan varios documentos nuevos a un empleado, el sistema DEBE agregar UNA notificación que liste todos los documentos.
- **FR-014**: Si el empleado destinatario no tiene email válido, el sistema DEBE omitir la notificación inmediata y registrarlo en log.
- **FR-015**: Si falla el envío de la notificación inmediata, el sistema DEBE registrarlo y NO bloquear el avance del ingreso del documento.
- **FR-016**: La notificación inmediata DEBE ser independiente del batch diario: el documento nuevo debe, además, permanecer pendiente para el batch siguiente si no se firmó ni visualizó.

### Key Entities _(include if feature involves data)_

- **User (Empleado)**: cuenta de empleado. Atributos relevantes: `nombre`, `apellido`, `email`, `renovar_clave` e `id_propietario`. No se requiere `ultimo_login` ni tracking de login.
- **Document**: documento asignado a un empleado. Atributos relevantes: `titulo`, `Usuario_id`, `firmado` (fecha o vacía = sin firmar), `visualizado` (fecha o vacía = sin visualizar) y `fecha_de_subida` (referencia al ingreso). La empresa se obtiene vía el `User` al que pertenece.
- **DisclaimerAcceptance** (`disclaimer_firmas`): registro de aceptación de términos. Relevantes: `id_usuario`, `id_empresa`. Ausencia = no aceptó.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: el 100% de los empleados con cuenta, email válido y pendientes en empresas activas recibe su email de pendientes en ≤15 minutos de la hora configurada.
- **SC-002**: ≥99% de los pendientes listados coinciden con el estado real del sistema al momento de generarse.
- **SC-003**: si falla el envío a una empresa, el 100% de las demás empresas reciben sin interrupción.
- **SC-004**: la tasa de resolución de pendientes (firma, visualización, renovación de clave) mejora ≥30% respecto al período previo en empleados alcanzados.
- **SC-005**: la ejecución del batch no degrada el resto del sistema (no supera el umbral de latencia habitual de las operaciones en línea durante el ciclo).
- **SC-006**: el 100% de los documentos nuevos asignados a empleados con email generan una notificación inmediata en ≤5 minutos desde el ingreso.
- **SC-007**: el 100% de las notificaciones inmediatas omitidas o fallidas quedan registradas con identidad y motivo.
- **SC-008**: el 90% de los empleados que reciben el recordatorio lo considera claro y accionable (encuesta).

## Assumptions

- La infraestructura de email (`Infrastructure/utils/Email`) está operativa; no se requiere SMTP nuevo.
- Hora de envío por defecto = 09:00 America/Argentina/Buenos_Aires (misma del reporte diario de admins); ajustable.
- Las notificaciones se envían solo a empresas activas y empleados activos con email válido.
- Cada empleado pertenece a una sola empresa.
- "Documento nuevo" = ingreso inicial del documento asignado a un empleado. La re-asignación de un documento ya existente a un segundo empleado queda como extension point (fuera del alcance de esta fase); solo la primera asignación dispara la notificación inmediata.
- Si no hay email del empleado, la notificación inmediata y el pendiente del batch no aplican (se omite la notificación; el pendiente diario no se entrega).
- La notificación inmediata no implementa reintentos: si falla, el pendiente queda cubierto por el batch diario.
- La feature no incluye consulta/UI de admin (decisión Q3): solo backend + scheduler + emails.

---

## Resultados de la Clarificación (registro)

- **Q1**: Batch con 4 pendientes (documentos sin firmar, términos, renovar contraseña, documentos sin visualizar); fuera "nunca inició sesión" y "completar perfil".
- **Q2**: Envío solo con pendientes (batch); notificación inmediata en el momento (canal email).
- **Q3**: solo backend + scheduler + emails; sin UI.
