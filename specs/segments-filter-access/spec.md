# Feature Specification: Segments Filter Access

**Feature Branch**: `feat/segments-filter-access`

**Created**: 2026-08-03

**Status**: Ready for Planning

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Ocultar el filtro de segmentos para empleados (Priority: P1)

Como empleado (usuario logueado sin el permiso `DASHBOARD_ACCESS`), al abrir el formulario de filtros de Documentos o de Certificados, quiero que el bloque "Segmentos" (la etiqueta y el selector) no aparezca, para no ver controles de filtrado que no corresponden a mi perfil.

**Why this priority**: Es la regla central de la feature. Sin este comportamiento no existe la funcionalidad; es la primera rebanada entregable y demostrable.

**Independent Test**: Puede testearse de forma aislada autenticando un usuario sin `DASHBOARD_ACCESS`, abriendo ambos formularios de filtros y verificando que el bloque "Segmentos" (etiqueta + selector) no se renderiza en ninguno de los dos, mientras el resto de los campos se muestran con normalidad.

**Acceptance Scenarios**:

1. **Given** un empleado autenticado sin permiso `DASHBOARD_ACCESS`, **When** abre el formulario de filtros de Documentos, **Then** el bloque "Segmentos" (etiqueta + selector) no se muestra, y el resto de los campos (nombre, estado, tipo) se muestran normalmente.
2. **Given** un empleado autenticado sin permiso `DASHBOARD_ACCESS`, **When** abre el formulario de filtros de Certificados, **Then** el bloque "Segmentos" no se muestra, y el resto de los campos (tipo, fecha, año, estado) se muestran normalmente.
3. **Given** el bloque oculto para el empleado, **When** se inspecciona la interfaz, **Then** no existe ningún elemento visual ni de accesibilidad relacionado con segmentos (ni etiqueta "Segmentos" ni selector).
4. **Given** el bloque oculto para el empleado, **When** se aplican o limpian los demás filtros, **Then** el formulario no deja espacios vacíos, ni muestra errores ni cambios de layout por la ausencia del bloque.

---

### User Story 2 - El admin conserva el filtro de segmentos completo (Priority: P1)

Como usuario con permiso `DASHBOARD_ACCESS`, quiero seguir viendo el bloque "Segmentos" completo (etiqueta + selector) en los formularios de filtros de Documentos y Certificados, para poder filtrar por segmentos tal como lo hago hoy.

**Why this priority**: Complementa la US1: garantiza que la regla no rompe el flujo de trabajo del admin. Ambas juntas definen el comportamiento de visibilidad completo.

**Independent Test**: Puede testearse de forma aislada autenticando un usuario con `DASHBOARD_ACCESS`, abriendo ambos formularios y verificando que el bloque se ve y funciona igual que antes del cambio.

**Acceptance Scenarios**:

1. **Given** un admin autenticado con permiso `DASHBOARD_ACCESS`, **When** abre el formulario de filtros de Documentos, **Then** ve la etiqueta "Segmentos" y el selector con su estado por defecto ("Filtrar por segmentos").
2. **Given** un admin autenticado con permiso `DASHBOARD_ACCESS`, **When** abre el formulario de filtros de Certificados, **Then** ve la etiqueta "Segmentos" y el selector con su estado por defecto.
3. **Given** un admin autenticado con el selector de segmentos visible, **When** selecciona uno o más segmentos, **Then** el filtrado se aplica y la URL refleja el parámetro `segmentos` (comportamiento existente, sin cambios).

---

### User Story 3 - El parámetro `segmentos` en la URL sigue filtrando aunque el control esté oculto (Priority: P2)

Como empleado sin `DASHBOARD_ACCESS` que llega a la pantalla con una URL que contiene `segmentos`, quiero que los resultados sigan filtrados por esos segmentos aunque el control esté oculto, para que los resultados sean consistentes con el enlace compartido o guardado.

**Why this priority**: No es una pantalla visible para el empleado, pero define un comportamiento de no-regresión sobre los datos: el filtrado a nivel de consulta no debe depender de la visibilidad del control.

**Independent Test**: Puede testearse autenticando un empleado, navegando a la pantalla de Documentos (o Certificados) con el parámetro `segmentos` presente en la URL y verificando que la lista de resultados aparece filtrada y que el parámetro permanece en la URL.

**Acceptance Scenarios**:

1. **Given** un empleado autenticado con una URL del tipo `...?segmentos=1,2` en la pantalla de Documentos, **When** se cargan los resultados, **Then** la lista aparece filtrada por los segmentos indicados, aunque el control esté oculto.
2. **Given** la misma URL con `segmentos` presente, **When** el empleado aplica otros filtros del formulario, **Then** el parámetro `segmentos` permanece en la URL y el filtrado por segmentos continúa aplicándose.
3. **Given** el control oculto para el empleado, **When** el empleado limpia los filtros del formulario, **Then** el parámetro `segmentos` no se elimina de la URL (consecuencia aceptada de la regla de negocio 3).

---

### User Story 4 - Consistencia en la pantalla admin de segmentos por usuario (Priority: P3)

Como usuario con permiso `DASHBOARD_ACCESS`, quiero mantener el filtro de segmentos en la barra de herramientas de la pantalla "Segmentos por usuario", para conservar la funcionalidad existente sin cambios visibles.

**Why this priority**: Es una mejora de consistencia sobre una pantalla admin-only: aplica la misma regla pero el efecto visible es nulo, porque el empleado no accede a esa ruta. No bloquea la feature.

**Independent Test**: Puede testearse verificando que la pantalla de segmentos por usuario mantiene el filtro visible para el admin y que el acceso del empleado a esa ruta sigue bloqueado por la protección existente.

**Acceptance Scenarios**:

1. **Given** un admin autenticado, **When** entra a la pantalla de segmentos por usuario, **Then** ve el filtro de segmentos en la barra de herramientas, como hasta ahora.
2. **Given** un empleado sin `DASHBOARD_ACCESS`, **When** intenta acceder a la ruta de segmentos por usuario, **Then** no puede acceder (protección de ruta existente, sin cambios en esta feature).

---

### Edge Cases

- **Enlace compartido con `segmentos`**: un empleado recibe una URL con `segmentos` en el query string → ve resultados filtrados sin ningún control visible para limpiar ese filtro. Esta es una consecuencia aceptada de la regla 3 (no se limpia el parámetro y no se muestra el control); se documenta para que no se trate como bug.
- **Cambio de permisos en la sesión**: si el permiso del usuario cambia (p. ej., se le otorga o revoca `DASHBOARD_ACCESS`), la visibilidad debe recalcularse con los permisos vigentes del usuario logueado en el siguiente render.
- **Carga asíncrona de permisos**: mientras los permisos del usuario aún se están cargando, el bloque no debe aparecer y desaparecer (efecto flash) para los empleados; el comportamiento seguro por defecto es no renderizar el bloque hasta confirmar el permiso (nunca mostrar un control que luego deba ocultarse).
- **Otros controles de filtro**: ocultar el bloque de segmentos no debe alterar el comportamiento ni el layout de los demás campos de los formularios (nombre, estado, tipo, fecha, año) en ninguno de los dos perfiles.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Para los usuarios sin permiso `DASHBOARD_ACCESS`, el sistema NO DEBE mostrar el bloque de filtro de segmentos (etiqueta "Segmentos" + selector) en el formulario de filtros de Documentos.
- **FR-002**: Para los usuarios sin permiso `DASHBOARD_ACCESS`, el sistema NO DEBE mostrar el bloque de filtro de segmentos (etiqueta "Segmentos" + selector) en el formulario de filtros de Certificados.
- **FR-003**: Para los usuarios con permiso `DASHBOARD_ACCESS`, el sistema DEBE mostrar el bloque de filtro de segmentos completo en ambos formularios, conservando el comportamiento actual sin cambios.
- **FR-004**: La visibilidad del bloque DEBE derivarse de los permisos del usuario autenticado (permiso `DASHBOARD_ACCESS`); no debe depender de configuración manual por pantalla ni de datos de otra entidad.
- **FR-005**: Ocultar el bloque NO DEBE alterar el procesamiento del parámetro de URL `segmentos`: si el parámetro está presente, el filtrado de resultados por segmentos continúa aplicándose a nivel de consulta.
- **FR-006**: Ocultar el bloque NO DEBE eliminar ni sobrescribir el parámetro de URL `segmentos` al aplicar o limpiar otros filtros.
- **FR-007**: El resto de los controles de filtro de ambos formularios DEBEN conservar su comportamiento actual, sin regresiones, para ambos perfiles.
- **FR-008**: Durante la carga de permisos, el bloque de segmentos NO DEBE renderizarse de forma intermitente (efecto flash) para los usuarios sin `DASHBOARD_ACCESS`; la visibilidad debe resolverse de forma estable una vez conocidos los permisos.
- **FR-009** (consistencia): La pantalla de segmentos por usuario (admin-only) DEBE conservar el filtro de segmentos visible para los usuarios con `DASHBOARD_ACCESS`; su efecto para los empleados es nulo porque la ruta no les es accesible.

### Design Consideration (recomendación para la fase de planificación)

El label "Segmentos" vive en los formularios padres (`FiltersDocumentsForm` y `FiltersCertificatesForm`), no dentro del componente `SegmentsFilter`, que actualmente es solo el selector. Para "ocultar todo el bloque" hay que condicionar etiqueta + selector juntos. Opciones evaluadas:

- **(a) Condicionar el bloque en cada form padre** con el chequeo de permiso: duplica la regla de visibilidad en 2-3 lugares y acopla a los formularios con una regla de negocio que no les pertenece.
- **(b) Crear un componente envolvente reutilizable** (tipo `SegmentsFilterField`) dentro del dominio Segments que encapsule etiqueta + selector + chequeo de permiso: la regla vive en un único lugar, el bloque es atómico (imposible mostrar la etiqueta sin el selector), y los padres solo reemplazan su bloque actual por el componente envolvente.
- **(c) Que `SegmentsFilter` retorne null sin permiso y condicionar la etiqueta en cada padre**: sigue exigiendo el chequeo de permiso en cada padre (la etiqueta permanece en ellos), conserva la duplicación de (a) y además acopla el componente presentacional a la regla de permisos.

**Recomendación: (b)**. Es la que mantiene el menor acoplamiento (los formularios no conocen la regla), evita duplicación, garantiza la atomicidad del bloque y es coherente con la arquitectura existente: el dominio Segments ya expone sus componentes vía `@app/Domains/Segments`, y el patrón de chequeo reutiliza `useHasPermission` con `DASHBOARD_ACCESS`, el mismo que ya usa `MenuAccess`. El detalle de implementación queda para `/speckit.plan`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los usuarios sin permiso `DASHBOARD_ACCESS` acceden a los formularios de filtros de Documentos y Certificados sin ver el bloque de segmentos (verificado por inspección visual y de DOM).
- **SC-002**: El 100% de los usuarios con permiso `DASHBOARD_ACCESS` ven el bloque de segmentos completo y funcional en ambos formularios, sin cambios respecto del comportamiento previo.
- **SC-003**: En el 100% de los casos en que la URL contiene el parámetro `segmentos`, los resultados listados respetan el filtrado por segmentos, aunque el control esté oculto para el usuario.
- **SC-004**: En el 100% de los casos, el parámetro `segmentos` permanece en la URL al aplicar o limpiar otros filtros.
- **SC-005**: 0 regresiones funcionales en los demás controles de filtro (nombre, estado, tipo, fecha, año) de ambos formularios, para ambos perfiles.

---

## Assumptions

- El permiso `DASHBOARD_ACCESS` (código `dashboard-access`) es el único criterio para distinguir admin de empleado, según el patrón ya establecido en `MenuAccess`.
- La visibilidad se decide en el frontend a partir de los permisos del usuario logueado (hook `useHasPermission`, que consulta los permisos del usuario vía tRPC); no se requieren cambios en el backend ni en el modelo de permisos.
- Consecuencia aceptada de la regla de negocio 3: un empleado que llega a la pantalla con `segmentos` en la URL ve resultados filtrados sin control visible para limpiarlos; no se implementa mitigación adicional en esta iteración.
- El diseño recomendado (opción b) implica mover la etiqueta "Segmentos" al componente envolvente del dominio Segments; los formularios padres dejan de renderizar la etiqueta directamente. Si en `/speckit.plan` se eligiera otra opción, los criterios de aceptación se mantienen idénticos (la especificación no depende de la opción de diseño).
- La pantalla de segmentos por usuario es admin-only; el cambio allí (FR-009) es de consistencia y su efecto visible para empleados es nulo.
- El branch real lo genera el hook git del pipeline; el directorio de la especificación (`specs/segments-filter-access`) es independiente del nombre del branch.
- Fuera del scope de esta feature: modificar el modelo de permisos o crear permisos nuevos, proteger rutas nuevas, cambiar la lógica de filtrado del backend, y limpiar el parámetro `segmentos` de la URL.
