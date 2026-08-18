# Quickstart — Validación de Documents Filters (Estado de Conformidad)

_Phase 1 output. Guía de validación end-to-end. No es documentación de implementación (ver `plan.md` y `tasks.md`)._

## Prerrequisitos

- Monorepo con pnpm instalado, MySQL local corriendo, migraciones aplicadas.
- `.env` del server con credenciales de DB y el seed de usuarios/empresas del entorno de desarrollo.
- Conocimiento del set de datos: al menos un usuario empleado (sin `DASHBOARD_ACCESS`) y un admin (con `DASHBOARD_ACCESS`), con documentos en los tres estados.

## Setup de datos de prueba (estados de conformidad)

Preparar documentos para cada bucket (vía el flujo de firma del producto o SQL directo sobre `Documentos`):

| Bucket esperado    | `requireSign` (tipo doc) | `firmado` | `firma_bajo_acuerdo` | `visualizado`                              |
| ------------------ | ------------------------ | --------- | -------------------- | ------------------------------------------ |
| Pendientes         | `true`                   | `NULL`    | —                    | —                                          |
| Bajo conformidad   | `true`                   | `fecha`   | `true`               | cualquier                                  |
| Sin conformidad    | `true`                   | `fecha`   | `false`              | cualquier                                  |
| (fuera de buckets) | `false`                  | `NULL`    | —                    | `fecha` (visualizado, sin firma requerida) |
| (edge)             | `true`                   | `fecha`   | `NULL`               | —                                          |

## Comandos

```bash
pnpm install
pnpm --filter @macrogest/server dev       # API tRPC (puerto del .env)
pnpm --filter @macrogest/app dev          # SPA
pnpm --filter @macrogest/server test      # unit + integration (server)
pnpm --filter @macrogest/app test         # vitest (app)
```

## Escenarios de validación

### S1 — Empleado: selector de 3 estados (FR-001/002/003/004/005, US1)

1. Loguear como empleado. Abrir la pantalla Documentos → "Filtros".
2. Verificar: campo "Estado de conformidad" con exactamente 3 opciones: "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad". Sin bloque "Segmentos".
3. Seleccionar cada opción y aplicar: la lista devuelve solo documentos del bucket correspondiente (tabla de arriba) y la URL persiste `state=pendientes` / `state=bajo_conformidad` / `state=sin_conformidad`.

### S2 — Admin: mismo selector en vista por empresa (FR-010, US2)

1. Loguear como admin. Documentos → "Filtros".
2. Verificar: el mismo selector de 3 estados + bloque "Segmentos" visible.
3. Aplicar "Firmados sin conformidad": la lista por empresa muestra solo firmados sin acuerdo de cualquier empleado. Combinar con un segmento → intersección correcta (FR-011).

### S3 — Legacy `state=validados` (FR-007, US3)

1. Navegar a Documentos con `?state=validados` (empleado y admin).
2. Verificar: la query NO falla y devuelve el conjunto histórico (firmados en cualquier conformidad + sin firma requerida y visualizados).
3. Abrir el formulario: el selector no se rompe (sin opción de UI para `validados`; la normalización resuelve a un estado coherente — ver nota del contrato C4).

### S4 — Valor inválido en URL (FR-008)

1. Navegar a Documentos con `?state=zzz`.
2. Verificar: sin pantalla de error; se aplica el default "Pendientes" (URL/query normalizadas).

### S5 — Limpiar filtros (FR-009)

1. Con un estado distinto de Pendientes aplicado, presionar "Limpiar filtros".
2. Verificar: selector vuelve a "Pendientes" y `state=pendientes` en la URL.

### S6 — Ciclo de firma reclasifica (FR-012, US4)

1. Con filtro "Pendientes", firmar un documento pendiente **bajo conformidad** → al re-aplicar ya no aparece en Pendientes; aparece en "Firmados bajo conformidad".
2. Repetir con firma **sin conformidad** (con motivo) → aparece en "Firmados sin conformidad".

### S7 — Multi-tenant (FR-013, Pr. II)

1. Con cualquier estado aplicado, verificar que solo aparecen documentos del owner del usuario logueado (empleado: `Usuario_id` propio; admin: usuarios de su `id_propietario`).

### S8 — Estadísticas intactas (constraint)

1. Ejecutar el flujo de estadísticas de documentos (dashboard): los contadores `total/pending/validated` se comportan igual que antes del cambio.

## Resultados esperados

- SC-002: sobre el set de datos conocido, el 100% de los documentos clasifican en el bucket correcto.
- SC-003: 0 enlaces rotos para URLs con `state=validados`.
- SC-004: sin regresiones en título/segmentos, persistencia de URL y ciclo de firma.
- SC-005: sin degradación perceptible de latencia.
- SC-006: aislamiento por owner en el 100% de los casos.

## Referencias

- Contrato de estado y normalización: [`contracts/index.md`](./contracts/index.md) (C1–C4)
- Semántica derivada (sin cambio de esquema): [`data-model.md`](./data-model.md)
- Fases de implementación: [`plan.md`](./plan.md)
