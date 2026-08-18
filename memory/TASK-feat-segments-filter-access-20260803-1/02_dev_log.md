---
task_id: 'TASK-feat-segments-filter-access-20260803-1'
agent: 'Front_Agent'
status: 'IMPLEMENTED'
attempts: 1
date: '2026-08-03'
affected_files:
  - 'packages/app/src/Domains/Segments/Components/SegmentsFilterField.tsx'
  - 'packages/app/src/Domains/Segments/Components/index.ts'
  - 'packages/app/src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx'
  - 'packages/app/src/Domains/Segments/Components/UserSegments/UserSegmentsToolbar.tsx'
  - 'packages/app/src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx'
  - 'packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx'
  - 'packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx'
  - 'packages/app/src/Domains/Certificates/Components/FiltersCertificatesForm.tsx'
  - 'packages/app/src/Domains/Certificates/Components/specs/FiltersCertificatesForm.spec.tsx'
---

# Log de Desarrollo — Segments Filter Access

Feature front-only que oculta el bloque "Segmentos" (etiqueta + selector) del filtro de Documentos y Certificados para usuarios sin el permiso `DASHBOARD_ACCESS`, manteniéndolo intacto para admins y sin alterar el procesamiento del parámetro de URL `segmentos`.

## Archivos Creados

| Archivo                                                                                                  | Capa          | Motivo                                                                         |
| -------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| `packages/app/src/Domains/Segments/Components/SegmentsFilterField.tsx`                                   | Segments/UI   | Wrapper atómico: label "Segmentos" + `<SegmentsFilter />` + chequeo de permiso |
| `packages/app/src/Domains/Segments/Components/specs/SegmentsFilterField.spec.tsx`                        | Test contrato | Contrato T1–T5 para el tester (admin/empleado/carga/showLabel)                 |
| `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/specs/FiltersDocumentsForm.spec.tsx` | Test contrato | Contrato T6–T7 para el tester (visibilidad del bloque en Documents)            |
| `packages/app/src/Domains/Certificates/Components/specs/FiltersCertificatesForm.spec.tsx`                | Test contrato | Contrato T8–T9 para el tester (visibilidad del bloque en Certificates)         |
| `packages/app/src/Domains/Segments/Components/UserSegments/specs/UserSegmentsToolbar.spec.tsx`           | Test contrato | Contrato T10–T11 para el tester (toolbar sin label)                            |

## Archivos Modificados

| Archivo                                                                                       | Cambio aplicado                                                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/app/src/Domains/Segments/Components/index.ts`                                       | Agregado `export * from './SegmentsFilterField';`                                                                                     |
| `packages/app/src/Domains/Documents/Components/FiltersDocumentsForm/FiltersDocumentsForm.tsx` | Bloque `<Container space="small"><Label>Segmentos</Label><SegmentsFilter /></Container>` → `<SegmentsFilterField />`; swap del import |
| `packages/app/src/Domains/Certificates/Components/FiltersCertificatesForm.tsx`                | Ídem: bloque → `<SegmentsFilterField />`; swap del import                                                                             |
| `packages/app/src/Domains/Segments/Components/UserSegments/UserSegmentsToolbar.tsx`           | `<SegmentsFilter />` → `<SegmentsFilterField showLabel={false} />`; swap del import relativo                                          |

## Decisiones Técnicas

- **[Wrapper atómico en el dominio Segments (opción b de la spec)]:** se creó `SegmentsFilterField` encapsulando etiqueta + selector + `useHasPermission(DASHBOARD_ACCESS)`. La regla de visibilidad vive en un único lugar; los formularios no conocen la regla de negocio y es imposible mostrar la etiqueta sin el selector (atomicidad del bloque). Alternativas (a) condicionar en cada form y (c) que `SegmentsFilter` retorne null + etiqueta en padres fueron descartadas por duplicar la regla y acoplar el componente presentacional a permisos.
- **[Seguridad por defecto en carga (FR-008):]** `useHasPermission` devuelve `false` mientras `data === undefined`; el wrapper retorna `null` en ese estado. Nunca se muestra un control que luego deba ocultarse (sin flash). El riesgo de flash para admins es mínimo porque `useGetPermissions` tiene `staleTime: 60s` y los permisos ya se consultaron al boot (MenuAccess).
- **[Prop `showLabel?: boolean` (default true):]** la toolbar de "Segmentos por usuario" (US4/FR-009) usa `showLabel={false}` — aplica la misma regla de visibilidad sin introducir la etiqueta que hoy no existe en esa pantalla (cero cambios visuales para el admin, defensa en profundidad).
- **[FR-005/FR-006 garantizados por diseño:]** `SegmentsFilter` (quien escribe/lee `segmentos` en la URL) no se tocó; `useURLParams`, `updateParams` y `cleanFilters` quedaron intactos. Ocultar el wrapper solo desmonta el selector, por lo que no puede escribir en la URL, y el parámetro permanece al limpiar/aplicar otros filtros (merge sobre URLSearchParams existente).
- **[Specs como contrato T1–T11 (Pr. V):]** los 4 archivos `.spec.tsx` quedan definidos con los casos concretos del plan (mockeando `useHasPermission` con `vi.hoisted` y stubbeando `SegmentsFilter` con `data-testid`) para que `@blendverse-tester` los genere/ejecute; no se ejecutaron tests en esta sesión (responsabilidad del tester).

## Deuda Técnica Conocida

- Consecuencia aceptada de la regla de negocio 3 (documentada en spec): un empleado que llega a la pantalla con `segmentos` en la URL ve resultados filtrados sin control visible para limpiarlos; no se implementa mitigación en esta iteración.
- Los spec files fueron dejados como contrato de estructura; la ejecución real (Vitest) la realiza `@blendverse-tester`.
