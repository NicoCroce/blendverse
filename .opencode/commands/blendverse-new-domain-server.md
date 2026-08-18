---
description: Crea un dominio DDD completo en el servidor (entidad, use cases, servicio, controlador, repositorio, modelo Sequelize y registro DI). Invoca al agente @blendverse-back con la skill back-ddd-generator.
agent: blendverse-back
---

Actúa como el agente `@blendverse-back`. Carga y sigue estrictamente la skill `back-ddd-generator`.

El usuario quiere crear un nuevo dominio en `packages/server`.

**Antes de escribir código:**

1. Ejecuta el Protocolo de Preguntas de la skill si no tienes toda la información.
2. Lista el árbol de archivos completo y espera aprobación.
3. Crea los archivos en orden: Domain → Application → Infrastructure → [domain].di.ts → index.ts.
4. Actualiza los dos archivos globales de registro.
5. Verifica que no haya errores de TypeScript en los archivos creados.

Si existe `specs/{feature}/contracts/operations.json`, ejecútalo mediante el
CLI `generate-back --operations-file`. El generator crea únicamente el
scaffold técnico y CRUD genérico; después debes implementar la lógica de
negocio específica solicitada.

Dominio a crear: **{{domainName}}**
Entidad: **{{entityName}}**
Atributos: **{{attributes}}**
