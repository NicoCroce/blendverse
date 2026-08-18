# Data Model — Documents Filters (Estado de Conformidad)

_Phase 1 output._

## Estado: derivado, NO un campo nuevo

El estado de conformidad del filtro **no se persiste**. Se deriva en el momento de la consulta de la combinación de dos columnas existentes del modelo `Documentos`:

| Columna (model `Documentos`) | Rol                    | Valores                            |
| ---------------------------- | ---------------------- | ---------------------------------- |
| `firmado`                    | Marca la firma         | `Date \| null` (null = sin firmar) |
| `firma_bajo_acuerdo`         | Acuerdo de conformidad | `boolean \| null` (ver nota edge)  |

### Mapeo del estado de filtro → condición sobre columnas

| Estado de filtro (value URL) | Condición                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pendientes`                 | No firmado: `(requiere_firma = true AND firmado IS NULL)` OR `(requiere_firma = false AND visualizado IS NULL)` |
| `bajo_conformidad`           | Firmado + conformidad: `firmado IS NOT NULL AND firma_bajo_acuerdo = true`                                      |
| `sin_conformidad`            | Firmado + sin conformidad: `firmado IS NOT NULL AND firma_bajo_acuerdo = false`                                 |
| `validados` (legacy)         | Semántica histórica: `firmado IS NOT NULL` OR `(requiere_firma = false AND visualizado IS NOT NULL)`            |

### Invariantes / edge cases (spec Edge Cases)

- `firma_bajo_acuerdo = null` (dato legado/inconsistente): NO clasifica en `bajo_conformidad` ni `sin_conformidad` (ni `firmado IS NOT NULL` + null `firma_bajo_acuerdo`). Coherente con la entidad que no permite descargar estos documentos.
- Documentos sin firma requerida (`requireSign = false`) ya `visualizado`: quedan **fuera** de los tres buckets (consecuencia aceptada; antes caían en `validados`). Conservan visibilidad con filtro de estado vacío.
- Visto pero no firmado (`requireSign = true`, `visualizado` con fecha, `firmado = NULL`): clasifica como `pendientes` (la acción pendiente es firmar).

## Schema de DB

**Sin cambios.** No hay `ALTER TABLE`, migraciones ni columnas nuevas. Esta sección documenta que el dominio del filtro es puramente de contrato/lógica, no de persistencia.

## Entidades del dominio involucradas

- `IDocument` (server, `Domain/Document.types.ts`): ya posee `signed`, `agreedment`, `reasonSignatureNonConformity`, `requireSign`, `view`. Se documenta la semántica.
- `TStateDocument` (server): contrato de estado del filtro — se extiende (ver `contracts/`).
- `TDocumentSearch` (app): contrato de búsqueda — se extiende indirectamente vía `TStateDocument` (ver `contracts/`).
