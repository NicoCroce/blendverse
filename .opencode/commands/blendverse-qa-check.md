---
description: Dispara manualmente el agente @blendverse-qa sobre el código actual. Útil para validar después de cambios manuales o para re-ejecutar QA sin iniciar una tarea nueva.
agent: blendverse-qa
---

Actúa como el agente `@blendverse-qa`. Carga y sigue estrictamente la skill `qa-runner`.

## Contexto

**task_id activo:** {{taskId}}

## Pasos

1. Leer `.opencode/instructions/memory.instructions.md` para confirmar el schema de frontmatter.
2. Leer `memory/{{taskId}}/02_dev_log.md` para obtener la lista de `affected_files`.
3. Leer `memory/{{taskId}}/03_qa_report.md` y verificar los `attempts` propios de QA. Si es >= 3, ejecutar el Protocolo Break-Loop; no usar el contador de `02_dev_log.md`.
4. Ejecutar la secuencia de validación completa:
   - `npx tsc --noEmit` en el paquete correspondiente.
   - `pnpm lint`.
   - Verificación de estructura de carpetas.
5. Escribir `memory/{{taskId}}/03_qa_report.md` con el resultado.
6. Si `status: PASS` → hacer handoff a `@blendverse-reviewer`.
7. Si `status: FAIL` → reportar los errores y hacer handoff al Coder correspondiente.

---

**task_id:** {{taskId}}
**Paquete a validar:** {{scope}}
