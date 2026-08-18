---
task_id: 'TASK-main-20260804-1'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
date: '2026-08-04'
---

# Requerimientos: Rediseño mobile de la pantalla admin/empleados

## Descripción de la Necesidad

La pantalla `admin/empleados` (gestión de empleados: búsqueda, selección múltiple para enviar recordatorios de renovación de clave y aceptación de términos, badges de estado, paginación y stats) solo es usable en escritorio: la `DataTable` genérica desborda en viewports chicos y el modo selección queda inusables en mobile. Se busca una experiencia mobile deliberada (lista de cards por empleado) sin perder funcionalidad, manteniendo la tabla de escritorio intacta para pantallas ≥ md.

## Alcance

- **Incluye:**
  - Vista mobile (< md) de la lista de empleados como cards por empleado, respetando el sistema de diseño existente (tokens shadcn/Tailwind, componentes de `Application/`, español neutro).
  - Mantenimiento de la tabla de escritorio actual (DataTable) para viewports ≥ md, sin cambios de comportamiento.
  - Modo selección de recordatorios funcional en mobile: checkbox por card con área táctil adecuada, selección inicial de pendientes, contador "Confirmar (N)", "Cancelar".
  - Búsqueda, paginación (límites 10/20/50, anterior/siguiente, total) y stats operativos en mobile.
  - Skeleton de carga adaptado a la presentación (cards en mobile, tabla en desktop).
  - Nuevos componentes ubicados en `packages/app/src/Domains/Admin/Empleados/` reutilizando lógica del hook `useEmpleadosPage` (sin duplicar lógica).
- **Excluye:**
  - Cualquier cambio en el backend (`packages/server/`), contratos tRPC, modelo de datos o endpoint de recordatorios.
  - Rediseño de `StatisticsEmpleados` (ya es responsive: `grid-cols-1 md:grid-cols-3`).
  - Cambios al sistema de diseño global en `Application/` salvo extensión puntual justificada (ej. variante de layout en `DataTable` si es estrictamente necesaria).
  - Otros dominios (Segments, Certificates, Disclaimer, etc.).
  - Modificación de los cambios sin commitear ajenos presentes en `main`; no se commitea ni abre PR en este flujo.

## Dominio Afectado

| Capa   | Dominio         | Tipo de cambio |
| ------ | --------------- | -------------- |
| server | —               | —              |
| app    | Admin/Empleados | Modificación   |

**Tipo de tarea:** `solo-frontend`

## User Stories

### US-01: Lista de empleados legible en mobile (cards)

**Como** administrador, **quiero** ver la lista de empleados en el celular como tarjetas legibles en vez de una tabla desbordada, **para** revisar quién está al día o necesita atención sin hacer zoom.

**Criterios de Aceptación:**

- [ ] En viewports < md (breakpoint 768px) no se renderiza la `DataTable` y se muestra una card por empleado; en ≥ md se renderiza la tabla actual sin cambios.
- [ ] Cada card muestra apellido y nombre (jerarquía tipográfica), email truncado con ellipsis, y los badges "Renovar clave" y "Acepto términos" con los mismos textos y variantes semánticas que la tabla (`Debe renovar`/`OK`, `Firmado`/`Corrupto`/`Pendiente`).
- [ ] El buscador y `StatisticsEmpleados` siguen operativos en mobile sin cambios de contrato.
- [ ] La paginación (límite 10/20/50, botones anterior/siguiente, badge de total) sigue operativa en mobile.
- [ ] El skeleton de carga muestra la forma de la presentación correspondiente (cards en mobile, tabla en desktop).
- [ ] No se rompen los tests existentes de Admin/Empleados; `tsc` y `lint` de `packages/app` pasan sin errores; sin `any`, TypeScript estricto.

### US-02: Selección múltiple para recordatorios usable en mobile

**Como** administrador, **quiero** seleccionar empleados con un toque en el celular y confirmar el envío de recordatorios, **para** enviarlos desde el móvil sin perder el modo selección actual.

**Criterios de Aceptación:**

- [ ] Al activar "Enviar recordatorios" en mobile, cada card muestra un checkbox con área táctil ≥ 44px.
- [ ] Se preserva la selección inicial de pendientes (`estado_firma === 'Pendiente'`) al activar el modo selección.
- [ ] El botón "Confirmar (N)" refleja el conteo real de `selectedIds` y está deshabilitado con N=0; muestra estado de carga durante el envío.
- [ ] "Cancelar" sale del modo selección y limpia `selectedIds`.
- [ ] El envío usa el mismo hook `useSendReminders` y el mismo contrato (`{ employeeIds: number[] }`); al éxito se sale del modo selección y se limpia la selección.
- [ ] El modo selección en desktop (checkbox en columna `select` + header select-all) no cambia.

### US-03: Experiencia desktop sin regresión

**Como** administrador, **quiero** mantener la tabla de escritorio tal cual, **para** seguir trabajando igual que antes en pantallas grandes.

**Criterios de Aceptación:**

- [ ] En ≥ md se renderiza exactamente la `DataTable` con las mismas columnas (select condicional, Apellido, Nombre, Email, Renovar clave, Acepto términos).
- [ ] Búsqueda, paginación y stats mantienen comportamiento idéntico al actual en desktop.
- [ ] La lógica de la página se mantiene en `useEmpleadosPage` (no se duplica estado entre la tabla y las cards).
- [ ] Cero regresiones funcionales detectadas por la cadena tester → qa → reviewer.

## Propuestas de Mejora UX

- **[Touch targets]:** Checkbox y controles táctiles en mobile con área ≥ 44px para uso con pulgar.
- **[Escaneo rápido]:** Los dos badges de estado se agrupan como un bloque de estado en cada card, manteniendo el mismo orden de campos que las columnas (apellido, nombre, email, renovar clave, acepto términos) para no forzar al usuario a re-aprender la jerarquía.
- **[Consistencia de datos]:** Email truncado con ellipsis para evitar desbordes de layout en pantallas angostas.
- **[Carga contextual]:** Skeleton adaptado a cards en mobile (hoy solo existe el de tabla).

## Dependencias con Dominios Existentes

Sin dependencias cross-domain. La pantalla consume `useGetEmployees` y `useSendReminders` del dominio `Disclaimer` (sin cambios).

## Estimación de Complejidad

- **Nivel:** Media
- **Motivo:** Cambio de presentación sin tocar lógica de negocio; la complejidad está en orquestar dos presentaciones (tabla/cards) compartiendo el mismo hook y en mantener el modo selección, paginación y skeleton consistentes sin romper la tabla existente ni los tests.
