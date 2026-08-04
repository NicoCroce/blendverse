# Feature Specification: Documents Filters — Estado de Conformidad

**Feature Branch**: `002-documents-filters` (el directorio de la especificación `specs/documents-filters` es independiente del nombre de la rama)

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Agregar filtros por estado de conformidad a los documentos, tanto para empleados como para admin — poder visualizar solo documentos en estado: pendiente, firmado bajo conformidad o firmado sin conformidad."

---

## Contexto

### Contexto del proyecto

MacroGest Core es un monolith modular con DDD y arquitectura hexagonal (Constitución v2.0.0). Los documentos viven en el dominio `Documents` (`packages/server/src/domains/Documents`), consumido desde el frontend en `packages/app/src/Domains/Documents` (tRPC + TanStack Query, URL params como fuente de estado de los filtros).

### Contexto de la feature

Hoy el formulario de filtros de documentos (`FiltersDocumentsForm.tsx`) ofrece un ToggleGroup de estado con dos opciones — **Pendientes** / **Validados** — que se refleja en el parámetro de URL `state` (`'pendientes' | 'validados'`). El backend clasifica así:

- `pendientes`: no firmado (incluye documentos sin firma requerida aún no visualizados).
- `validados`: firmado (con o sin conformidad) **o** sin firma requerida y ya visualizado.

El dominio ya distingue la conformidad de la firma: el modelo `Document` tiene `signed` (firmado), `agreedment` (firma_bajo_acuerdo) y `reasonSignatureNonConformity` (motivo_firma_sin_conformidad). La entidad del server ya valida que un documento firmado solo es descargable cuando `signed !== null && agreedment === true`.

Esta feature reemplaza la semántica binaria del filtro de estado por los **tres estados de conformidad** que el negocio realmente distingue:

| Estado del filtro        | Condición de negocio                          |
| ------------------------ | --------------------------------------------- |
| Pendiente                | No firmado (semántica actual de `pendientes`) |
| Firmado bajo conformidad | `signed !== null` y `agreedment === true`     |
| Firmado sin conformidad  | `signed !== null` y `agreedment === false`    |

El filtro aplica **tanto para empleados como para admin**: ambos consumen el mismo contrato de consulta (`params` compartido entre `getDocuments` y `getDocumentsByCompany`), por lo que extender el estado beneficia a los dos perfiles sin duplicar reglas.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Empleado filtra documentos por estado de conformidad (Priority: P1)

Como empleado (usuario logueado sin `DASHBOARD_ACCESS`), al abrir el formulario de filtros de Documentos quiero elegir entre **Pendientes**, **Firmados bajo conformidad** y **Firmados sin conformidad**, para ver exactamente los documentos en el estado de firma que me interesa.

**Why this priority**: Es la regla central de la feature — la capacidad de filtrar por los tres estados de conformidad desde el perfil del empleado. Sin esto no existe la funcionalidad; es la primera rebanada entregable.

**Independent Test**: Puede testearse de forma aislada autenticando un empleado, abriendo el formulario de filtros de Documentos, seleccionando cada una de las tres opciones y verificando que (a) la opción queda seleccionada, (b) el parámetro de URL `state` toma el valor correspondiente, y (c) la lista muestra solo documentos que cumplen la condición de negocio de esa opción (sobre un set de datos conocido con documentos en los tres estados).

**Acceptance Scenarios**:

1. **Given** un empleado autenticado con documentos en los tres estados de conformidad, **When** abre el formulario de filtros de Documentos, **Then** ve el selector de estado con exactamente tres opciones: "Pendientes", "Firmados bajo conformidad" y "Firmados sin conformidad", y el resto de los campos del formulario (nombre, segmentos si aplica) se muestran sin cambios.
2. **Given** el selector de estado visible, **When** el empleado elige "Firmados bajo conformidad" y aplica los filtros, **Then** la lista muestra únicamente documentos firmados con acuerdo (conformidad) y el parámetro de URL `state=bajo_conformidad` queda persistido.
3. **Given** el selector de estado visible, **When** el empleado elige "Firmados sin conformidad" y aplica los filtros, **Then** la lista muestra únicamente documentos firmados sin acuerdo y el parámetro de URL `state=sin_conformidad` queda persistido.
4. **Given** el selector de estado visible, **When** el empleado elige "Pendientes" y aplica los filtros, **Then** la lista muestra únicamente documentos no firmados (incluidos los que no requieren firma y aún no fueron visualizados) y el parámetro de URL `state=pendientes` queda persistido.
5. **Given** el formulario con un estado de conformidad seleccionado, **When** el empleado presiona "Limpiar filtros", **Then** el selector vuelve al estado por defecto ("Pendientes") y el parámetro `state` de la URL se resetea acorde.

---

### User Story 2 - Admin filtra documentos por estado de conformidad (Priority: P1)

Como usuario con permiso `DASHBOARD_ACCESS`, quiero usar el mismo selector de estado de conformidad en mi vista de documentos de la empresa, para poder revisar el estado de firma de los documentos de todos los empleados.

**Why this priority**: El enunciado exige que el filtro aplique a ambos perfiles. Esta US garantiza que la regla no rompe el flujo del admin y que la vista por empresa (`getDocumentsByCompany`) responde al mismo criterio. Ambas US1 y US2 juntas definen el alcance completo.

**Independent Test**: Puede testearse de forma aislada autenticando un admin, abriendo el formulario de filtros de Documentos y verificando que ve el mismo selector de tres opciones que el empleado y que, al elegir cada estado, la lista de documentos de la empresa se filtra según la condición de negocio correspondiente (sobre datos de múltiples usuarios).

**Acceptance Scenarios**:

1. **Given** un admin autenticado con documentos de varios empleados en los tres estados, **When** abre el formulario de filtros de Documentos, **Then** ve el selector de estado con las tres opciones (Pendientes / Firmados bajo conformidad / Firmados sin conformidad) además del bloque "Segmentos" que ya veía.
2. **Given** el selector de estado visible para el admin, **When** elige "Firmados bajo conformidad" y aplica los filtros, **Then** la lista de documentos por empresa muestra únicamente documentos firmados con acuerdo, sin importar el empleado propietario.
3. **Given** el selector de estado visible para el admin, **When** elige "Firmados sin conformidad" y aplica los filtros, **Then** la lista muestra únicamente documentos firmados sin acuerdo y el motivo de la no conformidad (si existe) permanece accesible en el detalle del documento.
4. **Given** un admin aplicando filtros de estado, **When** además filtra por segmentos, **Then** ambos criterios se combinan (intersección) y el resultado es coherente con la selección.

---

### User Story 3 - Los enlaces compartidos con `state=validados` siguen funcionando (Priority: P2)

Como usuario que recibió un enlace guardado o compartido con `state=validados` (valor del filtro anterior), quiero que el enlace siga resolviendo sin errores, para no perder el acceso a listas de documentos guardadas.

**Why this priority**: Es una garantía de no-regresión sobre la compatibilidad del contrato: el valor `validados` deja de tener una opción de UI, pero las URLs existentes no deben romper (ni arrojar error ni mostrar una lista vacía silenciosa por un valor rechazado).

**Independent Test**: Puede testearse navegando a la pantalla de Documentos con `?state=validados` en la URL (empleado y admin) y verificando que la consulta se ejecuta con éxito y devuelve los documentos que históricamente clasificaban como "validados" (firmados en cualquier conformidad, o sin firma requerida y visualizados).

**Acceptance Scenarios**:

1. **Given** una URL con `?state=validados`, **When** se carga la pantalla de Documentos, **Then** la consulta no falla y la lista muestra los documentos firmados (con o sin conformidad) y los documentos sin firma requerida ya visualizados.
2. **Given** una URL con `?state=validados` y el formulario abierto, **When** se inspecciona el selector de estado, **Then** el selector muestra una selección coherente (por defecto "Pendientes" no corresponde; la selección debe reflejar el valor de la URL sin romper el control).
3. **Given** una URL con un valor de `state` inválido (p. ej., `state=zzz`), **When** se carga la pantalla, **Then** el sistema no falla y aplica el estado por defecto ("Pendientes") o rechaza el valor con un mensaje claro — nunca una pantalla de error.

---

### User Story 4 - El selector de conformidad convive con el resto de los filtros y el ciclo de firma (Priority: P2)

Como usuario, quiero que el nuevo selector de estado no altere el comportamiento de los demás filtros (nombre, segmentos), de la URL ni del flujo de firma, para continuar trabajando como hasta ahora.

**Why this priority**: Garantiza la integridad del formulario y del flujo completo de documentos frente al cambio de la lógica de estado: la feature no debe introducir regresiones en el ciclo de firma (que escribe `signed`/`agreedment`) ni en la persistencia de los otros parámetros.

**Independent Test**: Puede testearse ejecutando el flujo completo: filtrar por cada estado, firmar un documento pendiente (con y sin conformidad) y verificar que al volver al filtro el documento aparece en el bucket correcto, y que los demás filtros (nombre, segmentos) siguen funcionando en combinación.

**Acceptance Scenarios**:

1. **Given** un documento pendiente en la lista, **When** el usuario lo firma bajo conformidad, **Then** al volver a filtrar por "Pendientes" ya no aparece y sí aparece al filtrar por "Firmados bajo conformidad".
2. **Given** un documento pendiente en la lista, **When** el usuario lo firma sin conformidad (con motivo), **Then** al volver a filtrar por "Pendientes" ya no aparece y sí aparece al filtrar por "Firmados sin conformidad".
3. **Given** el formulario con el selector de estado y el filtro de nombre aplicados, **When** se combinan ambos, **Then** los resultados son la intersección de ambos criterios y ambos parámetros persisten en la URL.
4. **Given** el selector de estado, **When** el usuario aplica filtros y recarga la página, **Then** la selección de estado se restaura desde la URL y la lista respeta el filtro.

---

### Edge Cases

- **Documentos que no requieren firma** (`requireSign = false`): no son "firmados", por lo que nunca clasifican como "bajo/sin conformidad". Mientras no estén visualizados, aparecen en "Pendientes" (semántica actual). Una vez visualizados, quedan "finalizados sin firma": **no aparecen en ninguno de los tres buckets del selector** (antes caían en "Validados"). Es una consecuencia aceptada y documentada de reemplazar el bucket binario por los estados de conformidad; se mantienen visibles cuando no hay filtro de estado aplicado.
- **Firmado con `agreedment = null`** (dato inconsistente/legado): no cumple `agreedment === true` ni `agreedment === false`, por lo que no aparece en los buckets de firmados (coherente con la entidad, que no lo considera descargable). En el flujo normal de firma este estado no debería existir, porque el acto de firmar siempre registra el acuerdo.
- **Visto pero no firmado** (`requireSign = true`, `view` con fecha, `signed = null`): sigue clasificando como "Pendiente" (la acción pendiente es firmar), igual que hoy.
- **Enlace compartido con `state=validados`**: se resuelve sin error y muestra el conjunto histórico de "validados" (ver US3). No existe opción de UI para este valor; es un estado de compatibilidad.
- **Valor de `state` inválido en la URL**: el sistema no debe fallar; aplica el default o rechaza con mensaje claro.
- **Multi-tenant**: el filtro por estado se combina SIEMPRE con el filtro por `ownerId` del contexto (Pr. II de la Constitución); un usuario nunca ve documentos de otra empresa por cambiar el estado.
- **Resultados vacíos**: si un bucket no tiene documentos, la lista muestra el estado vacío existente; el selector no desaparece ni se deshabilita.
- **Permisos**: el selector de estado es visible para TODOS los roles (a diferencia de "Segmentos", que se oculta a empleados); no debe quedar condicionado por `DASHBOARD_ACCESS`.
- **Carga asíncrona**: mientras se resuelven los permisos/parámetros iniciales, el selector debe renderizarse de forma estable (sin flash) con el valor de la URL.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El formulario de filtros de Documentos DEBE ofrecer un selector de estado con exactamente tres opciones: "Pendientes", "Firmados bajo conformidad" y "Firmados sin conformidad", reemplazando el ToggleGroup actual de "Pendientes/Validados".
- **FR-002**: El selector de estado DEBE ser visible y funcional para TODOS los roles (empleados y admin); su visibilidad NO DEBE depender del permiso `DASHBOARD_ACCESS`.
- **FR-003**: La opción "Pendientes" DEBE mostrar documentos no firmados, con la misma semántica del estado actual `pendientes` (incluye documentos sin firma requerida aún no visualizados).
- **FR-004**: La opción "Firmados bajo conformidad" DEBE mostrar únicamente documentos firmados con acuerdo de conformidad (`signed` presente y acuerdo afirmativo).
- **FR-005**: La opción "Firmados sin conformidad" DEBE mostrar únicamente documentos firmados sin acuerdo de conformidad (`signed` presente y acuerdo negativo).
- **FR-006**: La selección de estado DEBE persistir en el parámetro de URL `state` y restaurarse desde la URL al cargar/recargar la pantalla, siguiendo el patrón `useURLParams` existente.
- **FR-007**: El sistema DEBE aceptar el valor legacy `state=validados` (enlaces compartidos) y resolverlo con la semántica histórica: firmados en cualquier conformidad o sin firma requerida y visualizados.
- **FR-008**: El sistema DEBE rechazar (o normalizar al default "Pendientes") valores de `state` inválidos, sin producir errores de pantalla ni listas vacías silenciosas.
- **FR-009**: Al presionar "Limpiar filtros", el selector DEBE volver al estado por defecto ("Pendientes") y el parámetro `state` debe resetearse acorde.
- **FR-010**: La lógica de consulta por estado DEBE aplicarse por igual a la vista del empleado (`getDocuments`) y a la vista del admin por empresa (`getDocumentsByCompany`).
- **FR-011**: El filtrado por estado DEBE combinarse (intersección) con los demás filtros existentes (título, segmentos) sin alterar su comportamiento ni el parámetro `state` de la URL al aplicar o limpiar los otros filtros.
- **FR-012**: El ciclo de firma (firmar con/sin conformidad) NO DEBE alterarse; los documentos firmados deben reclasificarse en el bucket correcto al re-aplicar el filtro (verificable sin reiniciar la sesión).
- **FR-013**: La clasificación por estado DEBE respetar el aislamiento multi-tenant: el filtro por `ownerId` del contexto se aplica siempre, en cualquier combinación de estado.
- **FR-014**: El selector DEBE implementarse como un componente nuevo reutilizable (wrapper etiqueta + selector, patrón `SegmentsFilterField` del dominio Segments) y usarse como field dentro de `FiltersDocumentsForm`.
- **FR-015**: La entidad de búsqueda (`TDocumentSearch`) y el tipo de estado (`TStateDocument`) DEBEN extenderse para representar los tres estados de conformidad, manteniendo el valor legacy `validados` solo para compatibilidad (sin opción de UI).

### Key Entities _(include if feature involves data)_

- **Document**: documento del dominio Documents. Atributos relevantes: `signed` (fecha de firma, `null` si no firmado), `agreedment` (acuerdo de conformidad: `true`/`false`/`null`), `reasonSignatureNonConformity` (motivo cuando la firma es sin conformidad), `requireSign` (indica si el documento requiere firma), `view` (fecha de visualización). El estado de conformidad es un **estado derivado** de la combinación `signed` + `agreedment`, no un campo nuevo.
- **TDocumentSearch / TStateDocument**: contrato de búsqueda del frontend (y su espejo en el server). `state` pasa de admitir `'pendientes' | 'validados'` a admitir los tres estados de conformidad (+ `validados` legacy). No se agregan parámetros nuevos de URL: la selección vive en `state`.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los usuarios (empleados y admin) acceden al selector de estado con las tres opciones en el formulario de filtros de Documentos (verificado por inspección visual y de DOM).
- **SC-002**: Sobre un set de datos de prueba con documentos en los tres estados (pendiente, firmado con acuerdo, firmado sin acuerdo), el 100% de los documentos clasifican en el bucket correcto al aplicar cada filtro.
- **SC-003**: El 100% de las URLs existentes con `state=validados` resuelven sin error y devuelven el conjunto histórico de "validados" (0 enlaces rotos por el cambio de contrato).
- **SC-004**: 0 regresiones funcionales en los demás filtros (título, segmentos), en la persistencia de URL y en el ciclo de firma (firmar con/sin conformidad reclasifica correctamente).
- **SC-005**: El tiempo para obtener la lista filtrada por estado no se degrada respecto del comportamiento actual (los usuarios perciben la respuesta dentro de los tiempos estándar de la aplicación).
- **SC-006**: En el 100% de los casos, los resultados respetan el aislamiento por empresa/owner (un usuario nunca ve documentos de otra empresa al filtrar por estado).

---

## Assumptions

- **Reemplazo del bucket "Validados"**: el enunciado ("visualizar solo documentos en estado: pendiente, firmado bajo conformidad o firmado sin conformidad") se interpreta como que el selector de estado pasa a tener exactamente esas tres opciones, reemplazando al ToggleGroup "Pendientes/Validados". El valor `validados` se conserva solo como compatibilidad de URLs legacy (FR-007), sin opción de UI.
- **Documentos sin firma requerida ya visualizados**: quedan fuera de los tres buckets del selector (consecuencia aceptada de la semántica de conformidad, ver Edge Cases). Si el negocio quisiera recuperar un bucket "Validados" para ellos, sería una decisión de producto que se documenta como abierta a revisión en `/speckit.clarify`.
- **Semántica estricta de conformidad**: "sin conformidad" requiere `agreedment === false` (no `null`); los documentos firmados con `agreedment = null` (dato legado/inconsistente) no aparecen en los buckets de firmados, coherente con la entidad actual que no los considera descargables.
- **Ambos perfiles comparten el contrato**: como `getDocuments` (empleado) y `getDocumentsByCompany` (admin) comparten el mismo esquema de consulta, extender `state` beneficia a ambos sin duplicar reglas. Se asume que el admin filtra documentos de la empresa vía la vista existente por empresa.
- **El selector es visible para todos los roles**: a diferencia de `SegmentsFilterField` (que se oculta a empleados vía `DASHBOARD_ACCESS`), el nuevo componente NO condiciona su visibilidad por permisos.
- **El nuevo componente sigue el patrón wrapper etiqueta + selector** de `SegmentsFilterField`, pero dentro del dominio Documents; el detalle de implementación queda para `/speckit.plan`.
- **Alcance**: la feature aplica solo al dominio Documents (no a Certificados ni a otras pantallas). Las estadísticas de documentos (`getStatisticsDocuments`) no se modifican.
- **Default del filtro**: el estado por defecto sigue siendo "Pendientes" (como hoy), tanto para la URL inicial como para "Limpiar filtros".
- El branch real lo genera el hook git del pipeline (`002-documents-filters`); el directorio de la especificación (`specs/documents-filters`) es independiente del nombre del branch.
- Fuera del scope: cambios en el flujo de firma (que ya persiste `signed`/`agreedment`/motivo), nuevos permisos, cambios en estadísticas, y migración de datos para documentos con `agreedment = null`.
