# Feature Specification: Company Email Settings

**Feature Branch**: `005-company-email-settings`
**Created**: 2026-08-16
**Status**: Draft
**Input**: User description: "Crear una pantalla de configuración total de emails por empresa; permitir activar/desactivar cada envío dirigido a empleados o administradores; para administradores, gestionar una lista de destinatarios; permitir elegir qué información recibe el administrador por la mañana; editar el mensaje de inicio del email; y editar el contenido de términos y condiciones. El alcance incluye frontend y backend. Debés contemplar multi-tenancy por empresa, permisos del administrador, persistencia, validaciones, estados vacíos/error/loading y auditoría/seguridad si corresponde."

## Clarifications

### Session 2026-08-16

- Q: ¿Cómo deben tratarse las aceptaciones de términos existentes al introducir el versionado? → A: Vincularlas a la versión inicial importada, sin exigir reaceptación masiva.

### Session 2026-08-17

- Q: ¿A qué emails se aplica el mensaje de inicio? → A: A los ocho tipos de emails automáticos que admiten contenido institucional. Se excluye `requester_document_manual`; el contenido legal de términos no se modifica, aunque el recordatorio de términos puede llevar un preámbulo institucional.
- Q: ¿Dónde deben vivir los controllers del nuevo dominio? → A: En `Infrastructure/Controllers`, conforme a la constitución vigente. No se agrega `Presentation/`.
- Q: ¿El guardado general publica términos? → A: No. `update` guarda preferencias y mensaje institucional; `publishTerms` es una acción legal separada, confirmada y transaccional.
- Q: ¿La auditoría tendrá pantalla propia? → A: No en esta feature. Se expone mediante una API tenant-scoped para tooling de seguridad/operaciones.
- Q: ¿Cómo se provisionan empresas creadas después del backfill? → A: Provisioning lazy e idempotente al primer `get`, resolución de policy o ejecución por empresa.
- Q: ¿Qué ocurre al quitar un destinatario? → A: Hard delete transaccional; la unicidad activa es `(owner_id, normalized_email)`.
- Q: ¿Cómo se reanuda la migración si MySQL confirma DDL implícitamente? → A: Por etapas idempotentes con tabla de progreso, lotes por empresa y una etapa final de constraints/validación.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Consultar la configuración de emails de la empresa (Priority: P1)

Como administrador de una empresa, quiero consultar en un único lugar cómo se envían los emails de mi empresa, para entender qué comunicaciones están activas y qué destinatarios reciben cada una.

**Why this priority**: Es la base de todas las demás acciones. El administrador necesita una vista confiable del estado actual antes de modificar comunicaciones.

**Independent Test**: Se puede probar con una empresa que tenga configuración guardada y otra que use valores predeterminados, verificando que cada administrador solo vea la configuración de su empresa y que el estado mostrado coincida con los envíos vigentes.

**Acceptance Scenarios**:

1. **Given** un administrador pertenece a una empresa con configuración guardada, **When** abre la pantalla de configuración, **Then** ve el estado de cada envío, la lista de destinatarios administrativos, la selección del reporte matutino, el mensaje de inicio y los términos vigentes.
2. **Given** una empresa aún no tiene una configuración personalizada, **When** su administrador abre la pantalla, **Then** ve valores predeterminados equivalentes al comportamiento vigente y puede personalizarlos sin una migración manual.
3. **Given** un empleado o un administrador de otra empresa intenta abrir la pantalla, **When** se valida el acceso, **Then** no puede consultar ni inferir la configuración de la empresa solicitada.

---

### User Story 2 - Activar o desactivar envíos por audiencia (Priority: P1)

Como administrador de una empresa, quiero activar o desactivar cada tipo de email dirigido a empleados o administradores, para controlar qué comunicaciones automáticas recibe mi empresa.

**Why this priority**: Es el control principal de la feature y evita que una empresa reciba comunicaciones no deseadas sin afectar a otras empresas.

**Independent Test**: Se puede desactivar un tipo de email, provocar su evento de negocio y comprobar que no se envía; luego se puede reactivarlo y comprobar que el siguiente evento sí genera el envío.

**Acceptance Scenarios**:

1. **Given** un administrador ve un tipo de email activo, **When** lo desactiva y guarda, **Then** el sistema confirma el cambio y no genera ese envío para ningún destinatario de su empresa.
2. **Given** un administrador desactiva un tipo de email dirigido a empleados, **When** ocurre el evento correspondiente, **Then** los empleados de esa empresa no reciben ese email y los envíos de otras empresas no cambian.
3. **Given** un administrador desactiva un tipo de email dirigido a administradores, **When** ocurre el evento correspondiente, **Then** no se envía a ningún destinatario administrativo de esa empresa.
4. **Given** un administrador reactiva un tipo de email, **When** ocurre un nuevo evento compatible, **Then** el envío se realiza con la configuración vigente de la empresa.

Los tipos de email configurables en esta versión son:

| Audiencia                     | Tipo de email                                        |
| ----------------------------- | ---------------------------------------------------- |
| Administradores               | Nueva licencia cargada por un empleado               |
| Empleados                     | Cambio de estado de una licencia                     |
| Empleados                     | Confirmación de firma de un documento                |
| Administradores               | Notificación de firma de un documento                |
| Empleados                     | Recordatorio de aceptación de términos y condiciones |
| Administradores               | Reporte diario matutino                              |
| Empleados                     | Recordatorio diario de pendientes                    |
| Empleados                     | Notificación de documento nuevo asignado             |
| Usuario que solicita el envío | Envío manual de un documento por email               |

El envío manual se configura como un tipo independiente, aunque su destinatario sea el usuario que ejecuta la acción y no utilice la lista administrativa.

---

### User Story 3 - Gestionar destinatarios administrativos (Priority: P1)

Como administrador de una empresa, quiero administrar la lista de destinatarios de los emails dirigidos a administradores, para asegurar que cada reporte o alerta llegue a las personas correctas.

**Why this priority**: Los emails administrativos pueden contener información sensible de empleados, licencias y documentos. La empresa debe controlar explícitamente quién los recibe.

**Independent Test**: Se puede agregar, editar y eliminar destinatarios dentro de una empresa, provocar un email administrativo y verificar que solo se envía a la lista vigente.

**Acceptance Scenarios**:

1. **Given** la lista de destinatarios está vacía, **When** el administrador agrega una dirección válida y guarda, **Then** la dirección queda disponible para los emails administrativos habilitados.
2. **Given** existe un destinatario en la lista, **When** el administrador lo elimina y guarda, **Then** deja de recibir los siguientes emails administrativos.
3. **Given** el administrador intenta guardar una dirección inválida, **When** confirma los cambios, **Then** el sistema rechaza esa dirección, muestra el motivo y conserva la configuración anterior.
4. **Given** el administrador intenta agregar dos veces la misma dirección, ignorando mayúsculas y minúsculas, **When** confirma los cambios, **Then** el sistema impide el duplicado.
5. **Given** un email administrativo está activo y no tiene destinatarios válidos, **When** el administrador intenta guardar, **Then** el sistema solicita al menos un destinatario válido o que desactive ese email.
6. **Given** un administrador de la empresa A agrega o elimina un destinatario, **When** se consulta la empresa B, **Then** la lista de B no contiene ni refleja el cambio de A.

La lista admite direcciones de correo de personas externas a la aplicación, pero no concede acceso al sistema. Solo usuarios con permiso administrativo sobre la empresa pueden verla o modificarla.

---

### User Story 4 - Elegir la información del reporte matutino (Priority: P1)

Como administrador de una empresa, quiero elegir qué información incluye el reporte que recibo por la mañana, para recibir un resumen útil sin exponer datos que no necesito.

**Why this priority**: El reporte administrativo reúne información de varias áreas y puede contener datos sensibles. La selección por empresa mejora utilidad y minimización de datos.

**Independent Test**: Se puede seleccionar un subconjunto de secciones, guardar, ejecutar el reporte matutino y verificar que contiene exactamente las secciones elegidas.

**Acceptance Scenarios**:

1. **Given** el reporte matutino está activo, **When** el administrador selecciona secciones y guarda, **Then** el próximo reporte contiene únicamente esas secciones.
2. **Given** el administrador desmarca una sección, **When** se genera el reporte, **Then** esa sección y sus datos no aparecen en el email.
3. **Given** el reporte matutino está activo y no queda ninguna sección seleccionada, **When** el administrador intenta guardar, **Then** el sistema impide guardar y explica que debe seleccionar al menos una sección o desactivar el reporte.
4. **Given** no se seleccionó una sección, **When** se genera el reporte, **Then** sus datos no se consultan ni se incluyen como contenido alternativo.

Las secciones disponibles son: resumen estadístico, empleados con licencia durante el día, licencias pendientes de aprobación, documentos sin firmar, términos y condiciones pendientes, vacaciones próximas y licencias próximas a vencer. El horario matutino existente se conserva; modificarlo no forma parte de esta versión.

---

### User Story 5 - Personalizar el mensaje de inicio y los términos (Priority: P1)

Como administrador de una empresa, quiero editar el mensaje de inicio de los emails y el contenido de los términos y condiciones, para comunicar información propia de mi empresa y mantener actualizados sus requisitos.

**Why this priority**: Ambos contenidos son visibles para empleados y afectan la comunicación institucional y el cumplimiento de la empresa.

**Independent Test**: Se puede guardar un nuevo mensaje y una nueva versión de términos, generar los emails relacionados y comprobar que el contenido publicado es el de la empresa correcta.

**Acceptance Scenarios**:

1. **Given** el administrador edita el mensaje de inicio con contenido válido, **When** guarda, **Then** los emails que admiten mensaje de inicio muestran la nueva versión en los envíos posteriores.
2. **Given** el administrador deja vacío el mensaje de inicio, **When** guarda, **Then** el sistema rechaza el cambio si el mensaje es obligatorio y conserva el texto anterior.
3. **Given** el administrador edita los términos y confirma la acción legal, **When** publica una nueva versión mediante la acción explícita de publicación, **Then** se crea una nueva versión con fecha de vigencia y los nuevos destinatarios deben aceptar esa versión. El guardado general no publica términos.
4. **Given** existen aceptaciones de una versión anterior, **When** se publica una nueva versión, **Then** las aceptaciones anteriores permanecen como historial y no se consideran aceptación de la versión nueva.
5. **Given** el contenido contiene etiquetas, enlaces o formatos no permitidos, **When** el administrador intenta guardar, **Then** el sistema rechaza o neutraliza el contenido no permitido sin ejecutarlo ni mostrarlo como código.

El mensaje de inicio y los términos deben admitir saltos de línea y un conjunto acotado de formatos de lectura definidos por el producto. No se admite código ejecutable ni contenido que pueda alterar la aplicación o el destinatario.

---

### User Story 6 - Guardar y recuperar cambios de forma confiable (Priority: P1)

Como administrador de una empresa, quiero guardar toda la configuración de forma consistente, para que mis decisiones se mantengan aunque cierre la sesión o se reinicie el sistema.

**Why this priority**: Sin persistencia confiable, la configuración puede perderse o aplicarse parcialmente y provocar comunicaciones incorrectas.

**Independent Test**: Se puede modificar varias secciones en una sola edición, guardar, volver a abrir la pantalla y comprobar que todos los cambios se recuperan sin pérdida ni mezcla entre empresas.

**Acceptance Scenarios**:

1. **Given** el administrador modifica switches, destinatarios, secciones y contenidos, **When** guarda, **Then** todos los cambios válidos se persisten como una única actualización coherente.
2. **Given** falla el guardado, **When** el administrador vuelve a consultar la configuración, **Then** se mantiene la última versión válida y se informa que el nuevo cambio no fue aplicado.
3. **Given** hay cambios sin guardar, **When** el administrador intenta abandonar la pantalla, **Then** recibe una advertencia para evitar perderlos.
4. **Given** dos administradores de la misma empresa editan la configuración, **When** uno guarda después del otro, **Then** el sistema evita sobrescribir silenciosamente una versión más reciente y solicita revisar los cambios desactualizados.

El procedimiento `update` cubre switches, destinatarios, secciones y mensaje de
inicio como una única actualización coherente. La publicación de términos es
un procedimiento legal independiente y no forma parte de ese commit de
preferencias.

---

### User Story 7 - Usar la pantalla con estados claros y permisos seguros (Priority: P1)

Como administrador, quiero recibir feedback claro mientras consulto o guardo la configuración, para saber si puedo continuar, reintentar o corregir un dato.

**Why this priority**: La pantalla gestiona comunicaciones sensibles; estados ambiguos pueden inducir a creer que un cambio fue aplicado cuando no lo fue.

**Independent Test**: Se puede probar la pantalla durante la carga, con una respuesta vacía, ante un error de consulta y ante un error de guardado, verificando que cada estado ofrece una acción comprensible.

**Acceptance Scenarios**:

1. **Given** la configuración está cargando, **When** el administrador abre la pantalla, **Then** ve un estado de carga estructurado y no controles que parezcan editables antes de recibir los datos.
2. **Given** no hay destinatarios administrativos personalizados, **When** la configuración termina de cargar, **Then** se muestra un estado vacío contextual con una acción para agregar el primero.
3. **Given** no se puede consultar la configuración, **When** la pantalla recibe el error, **Then** muestra un estado de error explícito con opción de reintentar, sin presentar datos parciales como definitivos.
4. **Given** el guardado está en curso, **When** el administrador confirma los cambios, **Then** la acción queda identificada como pendiente y no permite envíos duplicados.
5. **Given** el guardado finaliza correctamente, **When** el administrador permanece en la pantalla, **Then** recibe confirmación visible y los valores mostrados representan la versión guardada.
6. **Given** el usuario no tiene permiso administrativo, **When** intenta acceder directamente a la pantalla o a una operación de lectura/escritura, **Then** se rechaza la operación sin revelar datos de configuración.

---

### User Story 8 - Auditar cambios de comunicación (Priority: P2)

Como responsable de seguridad de una empresa, quiero saber quién cambió la configuración de emails y cuándo, para investigar cambios inesperados y demostrar control sobre comunicaciones sensibles.

**Why this priority**: La configuración controla destinatarios y datos personales. La trazabilidad es necesaria para seguridad y cumplimiento, aunque no impide el uso básico de la pantalla.

**Independent Test**: Se puede modificar cada familia de configuración y consultar el registro de auditoría para comprobar actor, empresa, acción, fecha y resultado.

**Acceptance Scenarios**:

1. **Given** un administrador cambia un envío, destinatario, sección o contenido, **When** el cambio se confirma, **Then** se registra la empresa, el actor, el tipo de cambio, la fecha y el resultado.
2. **Given** una actualización es rechazada por validación o permiso, **When** se procesa, **Then** se registra el intento rechazado sin aplicar datos inválidos.
3. **Given** se modifica el mensaje de inicio o los términos, **When** se registra la auditoría, **Then** el historial identifica la versión anterior y nueva sin exponer innecesariamente el contenido completo en el registro.
4. **Given** un usuario de otra empresa consulta la API de auditoría, **When** se valida el alcance, **Then** no puede acceder a eventos ni destinatarios de otra empresa. Esta feature no incluye una UI de auditoría; el endpoint queda disponible para tooling autorizado.

### Edge Cases

- Una empresa activa sin destinatarios administrativos no puede enviar emails administrativos habilitados; el sistema debe omitir el envío de forma segura y dejar un evento de diagnóstico auditable.
- Si se elimina el último destinatario mientras hay emails administrativos activos, el sistema debe impedir guardar la combinación inválida.
- Si una dirección de destinatario cambia de mayúsculas/minúsculas, debe conservarse como la misma dirección y no crear un duplicado.
- Si un destinatario deja de ser usuario de la empresa, una dirección personalizada no debe obtener acceso a la aplicación ni a configuraciones; solo continúa recibiendo emails si permanece explícitamente en la lista.
- Si se elimina un destinatario, la fila se hard-deletea dentro del guardado y puede volver a agregarse como una nueva fila sin colisión de unicidad histórica.
- Si todos los tipos de email están desactivados, la configuración debe poder guardarse y mostrar claramente que no se realizarán envíos automáticos.
- Si el reporte matutino está desactivado, la selección de sus secciones puede conservarse para restaurarla al reactivarlo, pero no debe generar emails mientras esté desactivado.
- Si una sección del reporte no tiene datos, el reporte debe omitir esa sección o mostrarla como vacía de acuerdo con la selección, sin reemplazarla por otra sección no autorizada.
- Si se publica una nueva versión de términos durante una aceptación en curso, la aceptación debe vincularse a la versión que el empleado vio y no marcar como aceptada una versión posterior.
- Si el contenido editable excede el límite permitido, el sistema debe bloquear el guardado indicando el límite y conservar la versión anterior.
- Si dos administradores guardan simultáneamente, el segundo guardado no debe borrar silenciosamente la edición ya confirmada por el primero.
- Si falla la consulta o el guardado, no deben enviarse emails con datos parcialmente actualizados.
- Un intento de acceder con un identificador de empresa ajeno debe devolver el mismo resultado de acceso denegado que una empresa inexistente, sin confirmar la existencia de datos.

## UX and Visual Direction _(for technical design phase)_

La pantalla debe sentirse como un **panel de control de comunicaciones de la empresa**, no como un formulario genérico. Su único trabajo es permitir responder con confianza: “qué se envía, a quién y con qué contenido”.

- **Composición**: una vista única, con un resumen inicial del estado general y cuatro zonas claramente separadas: envíos, destinatarios administrativos, reporte matutino y contenidos. La jerarquía debe priorizar controles de impacto antes que edición de texto.
- **Lenguaje visual**: utilizar la identidad oscura e índigo/violeta de GestDoc como base, con un acento ámbar reservado para riesgos (sin destinatarios, términos pendientes o cambios sin guardar). Evitar una grilla de tarjetas indistinguibles.
- **Firma memorable**: representar cada tipo de email como una “ruta de entrega” con audiencia, estado y resultado esperado; la lista debe hacer visible el recorrido empleado → administrador sin depender de explicaciones técnicas.
- **Claridad y accesibilidad**: etiquetas en lenguaje de negocio, estados visibles además del color, foco de teclado, contraste suficiente y una presentación móvil que conserve el orden de decisión.
- **Contenido**: el editor debe mostrar una vista previa comprensible del mensaje y de los términos, con una advertencia clara cuando una edición genere una nueva versión legal.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE permitir que un usuario con permiso administrativo consulte la configuración de emails de la empresa a la que pertenece.
- **FR-002**: El sistema DEBE impedir que un usuario consulte, modifique o infiera la configuración de una empresa distinta de la asociada a su contexto de acceso.
- **FR-003**: El sistema DEBE mostrar un control independiente para activar o desactivar cada tipo de email incluido en el catálogo de esta especificación.
- **FR-004**: El sistema DEBE aplicar el estado activo o inactivo de cada tipo de email únicamente a la empresa que lo configuró y a sus destinatarios.
- **FR-005**: El sistema DEBE permitir agregar, editar y eliminar destinatarios administrativos mediante direcciones de correo válidas.
- **FR-006**: El sistema DEBE normalizar la comparación de direcciones sin distinguir mayúsculas y minúsculas, impedir duplicados y rechazar direcciones con formato inválido.
- **FR-007**: El sistema DEBE impedir guardar un email administrativo activo sin al menos un destinatario administrativo válido.
- **FR-008**: El sistema DEBE permitir seleccionar las secciones incluidas en el reporte diario matutino: resumen estadístico, empleados con licencia durante el día, licencias pendientes, documentos sin firmar, términos pendientes, vacaciones próximas y licencias próximas a vencer.
- **FR-009**: El sistema DEBE impedir guardar el reporte matutino activo sin ninguna sección seleccionada.
- **FR-010**: El sistema DEBE generar el reporte matutino usando únicamente las secciones seleccionadas por la empresa y omitir las no seleccionadas.
- **FR-011**: El sistema DEBE permitir editar el mensaje de inicio de los emails que soporten esa personalización, conservando el mensaje anterior si la validación falla.
- **FR-012**: El sistema DEBE permitir editar y publicar el contenido de términos y condiciones como una nueva versión identificable y fechada.
- **FR-013**: El sistema DEBE conservar el historial de aceptación de versiones anteriores y exigir una nueva aceptación cuando se publique una versión posterior; las aceptaciones existentes al incorporar esta feature DEBEN vincularse a la versión inicial importada, sin exigir reaceptación masiva.
- **FR-014**: El sistema DEBE validar longitud, contenido permitido y formato de los campos editables antes de persistirlos, sin ejecutar ni interpretar contenido no permitido.
- **FR-015**: El sistema DEBE persistir los cambios de una edición como una actualización coherente: si una validación o persistencia falla, no debe aplicar parcialmente la edición.
- **FR-016**: El sistema DEBE detectar cuando la edición parte de una versión desactualizada y evitar que un guardado posterior sobrescriba silenciosamente una versión más reciente.
- **FR-017**: El sistema DEBE inicializar empresas existentes con valores equivalentes al comportamiento actual: tipos de email activos, destinatarios administrativos vigentes, todas las secciones del reporte activas y contenidos actuales.
- **FR-018**: El sistema DEBE registrar cada cambio aceptado o rechazado de estados, destinatarios, secciones y contenidos con empresa, actor, fecha, tipo de acción y resultado.
- **FR-019**: El sistema DEBE limitar la auditoría al alcance de la empresa y evitar almacenar el contenido completo de mensajes o términos cuando sea suficiente identificar sus versiones o huellas de cambio.
- **FR-020**: La interfaz DEBE representar estados de carga, vacío, error de consulta, guardado en curso, guardado exitoso y guardado fallido con mensajes accionables.
- **FR-021**: La interfaz DEBE advertir sobre cambios sin guardar y evitar que una acción de guardado pueda producir envíos duplicados por reintentos del usuario.
- **FR-022**: El sistema DEBE mantener la configuración vigente de una empresa ante errores de lectura, validación, autorización o persistencia, sin producir envíos basados en datos parciales.
- **FR-023**: El sistema DEBE permitir guardar todos los tipos de email desactivados, siempre que las demás reglas de validación de la configuración se cumplan.
- **FR-024**: El sistema DEBE mantener fijo el horario matutino existente durante esta versión y no presentar un control de zona horaria u horario como parte de esta feature.
- **FR-025**: El mensaje de inicio DEBE aplicarse mediante la composición runtime a los ocho tipos automáticos compatibles, antes del envío, sin modificar contenido legal; DEBE excluir `requester_document_manual`.
- **FR-026**: La operación `update` NO DEBE publicar términos; `publishTerms` DEBE ser una acción separada, confirmada, versionada y transaccional.
- **FR-027**: La auditoría DEBE exponerse como API tenant-scoped para tooling autorizado y no requiere una vista frontend en esta feature.
- **FR-028**: Las empresas creadas después del backfill DEBEN recibir defaults equivalentes mediante provisioning lazy idempotente.

### Key Entities

- **Configuración de emails de empresa**: Conjunto de preferencias pertenecientes a una única empresa: estados de envíos, secciones del reporte matutino, mensaje de inicio y referencia al contenido de términos vigente.
- **Tipo de email**: Comunicación identificada por nombre, audiencia, disparador y estado habilitado para una empresa.
- **Destinatario administrativo**: Dirección de correo asociada a una empresa para recibir comunicaciones dirigidas a administradores; puede pertenecer o no a un usuario de la aplicación y no otorga permisos.
- **Sección del reporte matutino**: Unidad seleccionable del resumen diario, con nombre, audiencia administrativa y estado incluido/excluido por empresa.
- **Versión de términos y condiciones**: Contenido publicado para una empresa, con versión, fecha de publicación, estado vigente y relación con sus aceptaciones. Las aceptaciones existentes se vinculan a la versión inicial importada al habilitar el versionado.
- **Evento de auditoría de configuración**: Registro inmutable del actor, empresa, acción, fecha, resultado y referencia de versión afectada.
- **Empresa**: Tenant propietario de toda la configuración, destinatarios, contenidos y eventos; ningún dato de una empresa puede ser reutilizado para otra.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de las consultas y modificaciones de configuración se evalúa contra la empresa del usuario y ningún caso de prueba permite leer o modificar datos de otro tenant.
- **SC-002**: Un administrador puede identificar el estado de todos los envíos y guardar una modificación completa en menos de 5 minutos en una prueba de usabilidad.
- **SC-003**: El 100% de los emails de una empresa respeta el estado habilitado/deshabilitado vigente en el momento de su generación.
- **SC-004**: El 100% de los emails administrativos generados para una empresa se dirige únicamente a destinatarios válidos de su lista vigente.
- **SC-005**: El 100% de los reportes matutinos de prueba contiene exactamente las secciones seleccionadas por la empresa y no incluye datos de secciones desactivadas.
- **SC-006**: El 100% de los cambios aceptados se recupera correctamente después de cerrar y volver a abrir la pantalla, sin pérdida ni aplicación parcial.
- **SC-007**: El 100% de los intentos de acceso no autorizado es rechazado sin revelar si existe configuración para la empresa solicitada.
- **SC-008**: El 100% de los cambios aceptados o rechazados deja un evento auditable con actor, empresa, fecha, acción y resultado.
- **SC-009**: Al menos el 90% de los administradores de prueba puede completar la configuración inicial sin asistencia y reconoce qué emails reciben empleados y administradores.
- **SC-010**: Ante un error de consulta o guardado, el 100% de las pruebas muestra un estado accionable y conserva la última configuración válida.
- **SC-011**: El 100% de las nuevas aceptaciones de términos queda vinculado a la versión publicada que el empleado recibió, sin convertir aceptaciones anteriores en aceptaciones de la nueva versión.

## Assumptions

- El catálogo de tipos de email de esta especificación representa las comunicaciones existentes que deben quedar bajo control por empresa; agregar nuevos tipos en el futuro requerirá incorporarlos explícitamente al catálogo.
- Los valores predeterminados preservan el comportamiento actual para no cambiar silenciosamente las comunicaciones de empresas existentes.
- La configuración de cada empresa se comparte entre sus administradores autorizados y se guarda con control de versión para evitar sobrescrituras silenciosas.
- El permiso para gestionar esta pantalla corresponde al rol administrativo de la empresa; los empleados no pueden consultar ni modificarla.
- Las direcciones externas pueden recibir emails si un administrador las agrega, pero no adquieren cuenta, permisos ni acceso a datos de la aplicación.
- El horario del reporte matutino continúa siendo el horario diario vigente del producto y no se personaliza en esta versión.
- El mensaje de inicio se aplica solo a plantillas compatibles; los elementos obligatorios de cada comunicación, como destinatario, asunto funcional, contenido legal y pie institucional, no pueden eliminarse desde esta pantalla.
- Los ocho tipos automáticos del catálogo admiten el mensaje de inicio como preámbulo institucional; `requester_document_manual` queda excluido y el contenido legal de términos permanece intacto.
- `update` y `publishTerms` son operaciones separadas; guardar preferencias no produce una nueva versión legal.
- Guardar una nueva versión de términos requiere que el administrador confirme que el cambio puede generar nuevas aceptaciones pendientes.
- Las aceptaciones de términos existentes se consideran aceptación de la versión inicial importada y no requieren una reaceptación masiva al introducir esta feature.
- La infraestructura existente de envío, los disparadores de negocio y el mecanismo de autenticación se reutilizan; esta feature controla su configuración por empresa y no incorpora un proveedor de correo nuevo.
- La auditoría se conserva según la política vigente del producto, restringe el contenido sensible al mínimo necesario y se consulta mediante API tenant-scoped para tooling; no se agrega UI de auditoría en esta feature.
- Las empresas nuevas se provisionan lazy al primer acceso o disparo que necesite su configuración, con defaults idempotentes equivalentes al backfill.
- Los destinatarios removidos se hard-deletean y la unicidad activa se mantiene con `(owner_id, normalized_email)`.
- La dirección visual definida en esta especificación orienta la fase de diseño técnico; no implica una implementación visual específica en esta fase.
