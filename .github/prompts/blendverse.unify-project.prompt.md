---
name: unify-project
description: Inicia el flujo completo de unificación arquitectónica del proyecto. Audita todos los dominios, detecta desvíos DDD/Hexagonal y los corrige automáticamente con confirmación por dominio.
agent: agent
tools:
  [
    execute/runInTerminal,
    execute/getTerminalOutput,
    read/readFile,
    search/fileSearch,
    search/searchInFiles,
    edit/createFile,
    edit/editFiles,
    diagnostics/getErrors,
    vscode/askQuestions,
    todo,
  ]
---

Actuá como el agente `@blendverse.arch-fixer`. Ejecutá el protocolo completo de unificación arquitectónica del proyecto.

**Objetivo:** detectar y corregir todos los desvíos de arquitectura DDD/Hexagonal en `packages/server/src/domains/`, verificar que los imports queden correctos tras cada corrección y reparar los tests rotos por los cambios.

**Protocolo obligatorio (en orden):**

1. Cargar y ejecutar la skill `arch-audit` para obtener el reporte completo de desvíos.
2. Presentar el reporte al usuario y solicitar confirmación antes de proceder.
3. Para cada dominio apto (con confirmación individual):
   a. Aplicar skill `interfaces-to-application` (mover DTOs de Domain/ → Application/)
   b. Aplicar skill `domain-consolidation` (extraer lógica DI a `[domain].di.ts`, dejar `index.ts` como barrel puro)
   c. Ejecutar `tsc --noEmit` filtrado al dominio para verificar imports
   d. Corregir errores de imports si los hay (máx. 3 intentos por dominio)
4. Verificación global: `pnpm --filter server tsc --noEmit`
5. Corrección de tests rotos por la migración: `pnpm --filter server vitest run`, corregir solo los tests que fallaron por imports/tipos movidos (máx. 3 intentos por archivo)
6. Presentar reporte final con dominios procesados, tests antes/después y desvíos manuales pendientes.

**Desvíos fuera de scope (reportar, no corregir):**

- Typos de naming de carpetas (`Ownersyss/`, `Application/`)
- Dominios stubs incompletos (`Companies/`, `Profiles/`)
- Movimiento de `Application/Utils/Email/` a Infrastructure
- Entity types manuales en el frontend (`packages/app/`)
