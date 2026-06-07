---
agent: agent
description: Dispara manualmente el agente @blendverse.qa sobre el código actual. Útil para validar después de cambios manuales o para re-ejecutar QA sin iniciar una tarea nueva.
tools:
  [
    execute/runInTerminal,
    execute/getTerminalOutput,
    read/readFile,
    search/fileSearch,
    edit/createFile,
    edit/editFiles,
    diagnostics/getErrors,
  ]
---

Actúa como el agente `@blendverse.qa`. Carga y sigue estrictamente la skill `qa-runner`.

## Contexto

**task_id activo:** {{taskId}}

## Pasos

1. Leer `.github/instructions/memory.instructions.md` para confirmar el schema de frontmatter.
2. Leer `memory/{{taskId}}/02_dev_log.md` para obtener la lista de `affected_files`.
3. Verificar el campo `attempts` — si es >= 3, ejecutar el Protocolo Break-Loop.
4. Ejecutar la secuencia de validación completa:
   - `npx tsc --noEmit` en el paquete correspondiente.
   - `pnpm lint`.
   - Verificación de estructura de carpetas.
5. Escribir `memory/{{taskId}}/03_qa_report.md` con el resultado.
6. Si `status: PASS` → hacer handoff a `@blendverse.reviewer`.
7. Si `status: FAIL` → reportar los errores y hacer handoff al Coder correspondiente.

---

**task_id:** {{taskId}}
**Paquete a validar:** {{scope}}
