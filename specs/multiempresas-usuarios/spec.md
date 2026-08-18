# Feature Specification: Empresas del Usuario Post-Login

**Feature Branch**: `feat/multiempresas-usuarios`

**Created**: 2026-06-10

**Status**: Ready for Planning

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Consulta de empresas asociadas al usuario (Priority: P1)

Como sistema, al finalizar el proceso de autenticación de un usuario, necesito obtener todas las empresas a las que ese usuario pertenece para poder decidir si mostrar o no la pantalla de selección.

**Why this priority**: Sin esta consulta no existe base para ninguna funcionalidad de multi-empresa. Es el dato central del que dependen todas las demás historias.

**Independent Test**: Puede testearse de forma aislada ejecutando el caso de uso con un `userId` válido y verificando que devuelve la lista correcta de empresas con sus datos desde `Sis_propietarios`.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado que pertenece a 3 empresas en `Empresas_usuarios`, **When** el sistema consulta las empresas del usuario, **Then** retorna una lista con las 3 empresas incluyendo `razon_social`, `cuit`, imagen (URL completa) provenientes de `Sis_propietarios`.
2. **Given** un usuario autenticado que pertenece a 1 sola empresa, **When** el sistema consulta las empresas del usuario, **Then** retorna una lista con exactamente 1 empresa.
3. **Given** un usuario autenticado sin ninguna empresa asociada en `Empresas_usuarios`, **When** el sistema consulta las empresas del usuario, **Then** retorna una lista vacía.

---

### User Story 2 - Pantalla de selección de empresa post-login (Priority: P2)

Como usuario que pertenece a más de una empresa, después de iniciar sesión quiero ser navegado a `/seleccionar-empresa` donde veo todas mis empresas disponibles en formato botón, con imagen, razón social y CUIT, para poder identificar a cuál acceder.

**Why this priority**: Es la experiencia visible para el usuario multi-empresa. Depende de US1 (consulta) pero es el entregable de UI de esta feature.

**Independent Test**: Puede testearse renderizando el componente con un array de 2+ empresas mockeadas y verificando que cada empresa aparece como un botón con imagen y nombre.

**Acceptance Scenarios**:

1. **Given** un usuario con 2 o más empresas, **When** completa el login exitosamente, **Then** el sistema navega automáticamente a `/seleccionar-empresa` y muestra un botón por empresa con imagen (URL completa), `razon_social` y `cuit`.
2. **Given** un usuario con 2 o más empresas en la pantalla `/seleccionar-empresa`, **When** observa la lista, **Then** no existe ningún elemento interactivo que navegue, seleccione o cambie el estado de la aplicación (solo visualización).
3. **Given** la pantalla de selección visible, **When** se renderizan los botones, **Then** cada botón muestra: imagen, `razon_social` y `cuit`; si la imagen no existe, se muestra un placeholder o inicial de la razón social.

---

### User Story 3 - Omisión de pantalla para usuario de empresa única (Priority: P2)

Como usuario que pertenece a una sola empresa, después de iniciar sesión quiero que el sistema NO me muestre la pantalla de selección de empresa, para no agregar un paso innecesario a mi flujo de trabajo habitual.

**Why this priority**: Igual prioridad que US2 porque ambas definen el comportamiento completo del flujo post-login; una empresa → sin pantalla.

**Independent Test**: Puede testearse verificando que el componente/ruta de selección no se renderiza cuando la lista de empresas tiene exactamente 1 elemento.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado que pertenece a exactamente 1 empresa, **When** el sistema evalúa la cantidad de empresas, **Then** la pantalla de selección no se muestra en ningún momento del flujo de login.
2. **Given** un usuario autenticado que pertenece a 0 empresas (caso anómalo), **When** el sistema evalúa la cantidad de empresas, **Then** la pantalla de selección tampoco se muestra (se delega el manejo de este estado a la lógica de negocio existente sin bloquear el flujo).

---

### Edge Cases

- ¿Qué ocurre si la imagen/logo de una empresa es `null` o apunta a un recurso inexistente? → Mostrar placeholder visual.
- ¿Qué ocurre si la consulta a `Empresas_usuarios` falla por error de red o base de datos? → El flujo de login no debe bloquearse; manejar el error con un estado de error apropiado.
- ¿Qué ocurre si un usuario tiene registros en `Empresas_usuarios` pero la empresa referenciada no existe en `Sis_propietarios`? → Ignorar esa entrada (JOIN interno) y no mostrar empresa inconsistente.
- ¿Qué pasa si se accede directamente a la ruta de selección sin haber hecho login? → Redirigir al login (protección de ruta existente, fuera de scope de esta feature).

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE proveer un endpoint/procedimiento que, dado un `userId`, retorne la lista de empresas asociadas a ese usuario consultando la tabla `Empresas_usuarios` y enriqueciendo los datos desde `Sis_propietarios`.
- **FR-002**: La respuesta del endpoint DEBE incluir al menos: `id`, `razon_social`, `cuit` e `imagen` (URL completa, campo `logo` de `Sis_propietarios`) de cada empresa.
- **FR-003**: El aislamiento multi-tenant se garantiza filtrando por `id_empresa` directamente desde la relación `Empresas_usuarios`; no se usa un campo `id_propietario` adicional.
- **FR-004**: El frontend DEBE mostrar la pantalla de selección de empresa si y solo si el usuario pertenece a **2 o más** empresas.
- **FR-005**: La pantalla `/seleccionar-empresa` DEBE presentar cada empresa como un elemento visual tipo botón con imagen, `razon_social` y `cuit`; sin lógica de selección ni cambio de empresa activa en esta iteración.
- **FR-005b**: Tras el login exitoso, el sistema DEBE navegar automáticamente a `/seleccionar-empresa` cuando el usuario tiene 2 o más empresas.
- **FR-006**: Los datos de empresa DEBEN obtenerse de `Sis_propietarios` a través de la relación `Empresas_usuarios.id_empresa → Empresas.id = Sis_propietarios.id`; **nunca** de datos directos de la tabla `Empresas`.
- **FR-007**: Si el usuario pertenece a exactamente 1 empresa, la pantalla de selección NO DEBE mostrarse.
- **FR-008**: La consulta de empresas del usuario DEBE realizarse como parte del flujo post-autenticación, utilizando el `userId` ya autenticado.

### Key Entities

- **EmpresaUsuario** (tabla `Empresas_usuarios`): Relación N:N entre usuarios y empresas. Atributos clave: `id`, `id_empresa`, `id_usuario`, `deletedAt` (soft-delete).
- **Empresa** (datos desde `Sis_propietarios`): Atributos expuestos: `id`, `razon_social`, `cuit`, `logo` (URL completa).
- **Usuario** (tabla `Usuarios`): Usuario autenticado. Su `id` es la clave para buscar en `Empresas_usuarios`.

### New Domain

- **`Empresas_usuarios`** (nuevo dominio en `packages/server/src/domains/Empresas_usuarios/`): Dominio DDD dedicado que encapsula la relación N:N y provee el caso de uso `GetEmpresasByUsuario`. Este dominio utiliza asociaciones Sequelize con `Sis_propietarios` para enriquecer los datos.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Un usuario con múltiples empresas asociadas ve la pantalla de selección en menos de 2 segundos después de completar el login.
- **SC-002**: Un usuario con una sola empresa asociada completa el login sin que aparezca ninguna pantalla intermedia adicional.
- **SC-003**: El 100% de las empresas activas asociadas al usuario se muestran correctamente en la pantalla de selección, sin duplicados ni entradas de otras empresas.
- **SC-004**: La pantalla de selección muestra imagen, `razon_social` y `cuit` para el 100% de los registros con datos completos en `Sis_propietarios`.
- **SC-005**: Los datos de empresa mostrados nunca provienen de la tabla `Empresas`; toda la información visible se origina en `Sis_propietarios`.

---

## Assumptions

- El `userId` disponible post-login (desde el JWT actual `{ id, user, ownerId }`) es suficiente para consultar `Empresas_usuarios` sin cambios en el token.
- El campo `logo` de `Sis_propietarios` contiene una URL completa (no requiere prefijo con `URL_IMG`).
- El aislamiento multi-tenant se logra filtrando por `id_empresa` en `Empresas_usuarios`; no existe columna `id_propietario` en esa tabla.
- Se crea un dominio nuevo `Empresas_usuarios` en el servidor (no se extiende `Ownersyss`).
- El modelo Sequelize de `Companies` (`packages/server/src/domains/Companies/Infrastructure/Database/Companies.model.ts`) puede reutilizarse como modelo de `Sis_propietarios` para la asociación dentro del nuevo dominio.
- La ruta frontend es `/seleccionar-empresa`; el flujo de login navega automáticamente a ella cuando hay 2+ empresas.
- La lógica de **qué empresa se selecciona** y **qué ocurre después de seleccionarla** está explícitamente fuera del scope de esta feature.
- Soft-delete: los registros con `deletedAt` no nulo en `Empresas_usuarios` se consideran inactivos y no se incluyen en la lista.
- Mobile responsiveness de la pantalla de selección está fuera del scope de v1.
