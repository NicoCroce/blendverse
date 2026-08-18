# Research — Documents Filters (Estado de Conformidad)

_Phase 0 output. Resuelve los NEEDS CLARIFICATION del plan antes de diseñar._

---

## R1. ¿Cómo se representa hoy el filtro de estado de punta a punta?

**Decisión**: El `state` es un único string en el contrato tRPC/frontend, validado con `z.enum` en el controller y traducido a SQL en `DocumentsFilters` (función pura utilizada por `getDocuments` y `getDocumentsByCompany`). `getStatisticsDocuments` reutiliza la MISMA función con `state: 'pendientes' | 'validados'` y NO debe modificarse.

**Rationale**: Mapear el flujo real evitó inventar un mecanismo paralelo. El valor viaja: URL → `TDocumentSearch` (frontend) → `params` tRPC → `z.enum` (server) → `DocumentsFilters` → query Sequelize. Extender el contrato es tocar estos 5 puntos, no uno.

**Alternativas consideradas**:

- Mapear `state` a un enum Zod `z.nativeEnum` por cada estado — rechazado: `TStateDocument` es un union type string, no enum TS (`z.enum` + union string es el patrón del dominio).
- Crear un field derivado nuevo (`conformidad`) en la query — rechazado: el espec FR-015 exige que la selección viva SOLO en `state`.

## R2. Semántica SQL de cada bucket (y el legacy `validados`)

**Decisión**: Cuatro ramas en `DocumentsFilters`, traducción directa de la tabla de negocio:

| `state`              | Condición SQL (columnas)                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pendientes`         | `(requiere_firma = true AND firmado IS NULL)` OR `(requiere_firma = false AND visualizado IS NULL)` — sin cambios |
| `bajo_conformidad`   | `firmado IS NOT NULL AND firma_bajo_acuerdo = true`                                                               |
| `sin_conformidad`    | `firmado IS NOT NULL AND firma_bajo_acuerdo = false`                                                              |
| `validados` (legacy) | `firmado IS NOT NULL` OR `(requiere_firma = false AND visualizado IS NOT NULL)` — sin cambios                     |

**Rationale**: `bajo_conformidad` y `sin_conformidad` no dependen de `requiere_firma` — el estado de conformidad es DERIVADO de `signed + agreedment` (Pr. datos del model). `GetStatisticsDocuments` usa solo `'pendientes'` y `'validados'`; mantener esas dos ramas bit-a-bit idénticas garantiza 0 cambio en estadísticas.

**Alternativas consideradas**:

- Reciclar `filterValidated` reescribiendo `validados` — rechazado: rompería `getStatisticsDocuments` (el bloque "Validados" incluye también "sin firma requerida y visualizado", distinto a `bajo_conformidad`).

## R3. ¿Cómo resolver FR-008 (valores inválidos) sin romper el server?

**Decisión**: En el frontend, `TDocumentSearch.state` se normaliza contra el set válido ANTES de armar la query; cualquier valor fuera de `['pendientes','bajo_conformidad','sin_conformidad','validados']` se mapea a `'pendientes'` (default). Un helper `normalizeState`/constante `VALID_STATES` en `Document.entity.ts`. El selector renderiza con el valor normalizado.

**Rationale**: `useGetDocuments` mandacdirecto `...rest` (que incluye `state`) a tRPC; si llega `state=zzz`, el `z.enum` del server lo RECHAZA y la query falla (pantalla de error). Esperar FR-008 exige NO fallar; por lo tanto la sanidad no está en el controlador (que debe seguir siendo estricto con Zod) sino en la capa frontend que construye la query y en el field que renderiza.

**Alternativas consideradas**:

- Relajar el `z.enum` con `.catch('pendientes')` — rechazado: Zod 4 soporta `.catch`, pero ocultaría errores de contrato en el server; el front aún debería enviar valores válidos. La normalización en el cliente es la capa correcta.
- Panel de error para `state` inválido — rechazado: viola FR-008 (no debe producir errores de pantalla).

## R4. ¿Naming de los nuevos valores de estado?

**Decisión**: `'bajo_conformidad'` y `'sin_conformidad'` (además de `'validados'` legacy y `'pendientes'`). Coincide con el lenguaje del dominio (firma bajo acuerdo, motivo de firma sin conformidad) y con los labels literales del frontend-design ("Bajo conformidad" / "Sin conformidad").

**Rationale**: Los valores de URL son slug legibles y estables, no abreviaturas. El asset-design lo fija como valores de URL. `validados` se conserva SOLO como legacy sin opción UI.

**Alternativas consideradas**:

- `'bajo_acuerdo'` / `'sin_acuerdo'` — rechazado: el dominio habla del "motivo de firma sin conformidad" y el spec FR-004/005 usa "bajo conformidad" / "sin conformidad". `conformidad` es el término del negocio.
- `'conformidad'` / `'no_conformidad'` — rechazado: ambos significan "firmado", no distinguen el signo; confusos como query opciones.

## R5. ¿El frontend re-exporta o duplica `TStateDocument`?

**Decisión**: `Document.entity.ts` importa `TStateDocument` desde `@server/domains/Documents` (ya lo hace línea 1) y re-expone constantes `VALIDATED`/`PENDING`. El cambio se hace SOLO en el server (`Domain/Document.types.ts`) y la union se propaga automáticamente al frontend por el import unidireccional (Pr. VII). Se agregan constantes frontend `UNDER_CONFORMITY` / `WITHOUT_CONFORMITY` y un set `DOCUMENT_STATES` para los tres de UI.

**Rationale**: Pr. III prohíbe duplicar tipos derivados; el front importa tipos de `@server`.

## R6. ¿Dónde vive el nuevo componente selector?

**Decisão**: `packages/app/src/Domains/Documents/Components/DocumentsStateFilterField/DocumentsStateFilterField.tsx` (patrón wrappers `SegmentsFilterField`), usado como field en `DocumentsStateFilterField.tsx` dentro de `FiltersDocumentsForm`. Visible para TODOS los roles (sin `DASHBOARD_ACCESS` / `useHasPermission`), diferencia clave vs `SegmentsFilterField`.

**Rationale**: FR-014 indica patrón wrapper etiqueta + selector, dominio Documents. FR-002 exenta eliminar el gate de permiso.

## R7. ¿`getStatisticsDocuments` toca DocumentsFilters?

**Décision**: Sí, usa `DocumentsFilters` con ramas `'pendientes'` y `'validados'`; estas dos ramas quedan byte-a-bit idénticas — el refactor a un `switch`/map NO cambia su salida Sequelize. No se modifica el método ni su filtra.

## R8. Testing

**Decisión**: `@blendverse-tester` cubrirá: (1) unit `DocumentsFilters` para los 4 estados contra casos concretos (pendiente / bajo / sin / legacy), (2) contrato query `state` válido+inválido, (3) component `DocumentsStateFilterField` (3 opciones, default, limpiar), (4) normalización frontend `normalizeState`, (5) US3 legacy `state=validados` (login compartido) no rompe.

**Alternativas**: Playwright para E2E del flujo firma→reclasificación — opcional, fuera del core.
