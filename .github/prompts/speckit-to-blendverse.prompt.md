---
name: speckit-to-blendverse
description: Micro-prompt Fast-Track. Convierte los artefactos de Speckit (spec.md + tasks.md) en 01_requirements.md listo para @blendverse.implement. Usar en lugar de @blendverse.analyst cuando el análisis ya fue realizado por Speckit.
---

# Fast-Track: Speckit → Blendverse

## Instrucciones

1. Leer `memory/history_log.json` para determinar el próximo `task_id` con formato `TASK-YYYYMMDD-N`.
2. Leer `specs/{feature}/spec.md` — extraer: descripción, alcance, user stories y criterios de aceptación.
3. Leer `specs/{feature}/tasks.md` — extraer: alcance (back/front/full-stack), entidades y contratos de API.
4. Crear la carpeta `memory/{task_id}/`.
5. Escribir `memory/{task_id}/01_requirements.md` usando el template de la skill `requirements-analyst`, consolidando la información de los pasos 2 y 3 sin análisis adicional ni preguntas.
6. Indicar al usuario que invoque `@blendverse.implement` con el `task_id` generado.

## Restricciones

- No hagas preguntas aclaratorias — confiá en los artefactos de Speckit tal como están.
- No invoques skills de análisis adicionales.
- No modifiques archivos fuera de `memory/{task_id}/`.
