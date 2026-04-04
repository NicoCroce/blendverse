---
agent: agent
description: Mueve la carpeta UseCases de `Domain/UseCases` a `Application/UseCases` en uno o varios dominios del servidor. Ejecuta el protocolo completo de la skill usecases-migration.
tools:
  [
    vscode/memory,
    vscode/runCommand,
    vscode/vscodeAPI,
    vscode/askQuestions,
    execute/runInTerminal,
    read/readFile,
    edit/editFiles,
    todo,
  ]
---

Actúa como el agente `@back`. Carga y sigue estrictamente la skill `usecases-migration`.

El usuario quiere mover los UseCases del dominio (o dominios) indicados desde `Domain/UseCases/` hacia `Application/UseCases/`.

**Protocolo obligatorio:**

1. Verifica que dentro de `packages/server/src/domains/{{domain}}/Domain/UseCases` existan casos de uso. Si el directorio no existe o está vacío, informa al usuario.
2. Lista todos los archivos que serán movidos y actualiza los archivos afectados. Solicita confirmación antes de proceder.
3. Sigue los pasos de la skill en orden:
   - Leer `Domain/index.ts`, `Application/index.ts`, `*.service.ts`, `[domain].app.ts`
   - Mover la carpeta con `mv`
   - Actualizar `Domain/index.ts` (remover export de UseCases)
   - Actualizar `Application/index.ts` (agregar export de UseCases)
   - Actualizar imports en `*.service.ts`
   - Actualizar imports en todos los `*.usecase.ts`
   - Actualizar imports en `[domain].app.ts`
4. Verifica que no haya errores de TypeScript en los archivos modificados. Si hay errores, corregirlos antes de continuar.

**Dominio(s) a migrar:** `{{domains}}`
