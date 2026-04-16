---
agent: agent
description: Crea un dominio DDD completo en el servidor (entidad, use cases, servicio, controlador, repositorio, modelo Sequelize y registro DI). Invoca al agente @back con la skill back-ddd-generator.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@back`. Carga y sigue estrictamente la skill `back-ddd-generator`.

El usuario quiere crear un nuevo dominio en `packages/server`.

**Antes de escribir código:**

1. Ejecuta el Protocolo de Preguntas de la skill si no tienes toda la información.
2. Lista el árbol de archivos completo y espera aprobación.
3. Crea los archivos en orden: Domain → Application → Infrastructure → [domain].app.ts → index.ts.
4. Actualiza los dos archivos globales de registro.
5. Verifica que no haya errores de TypeScript en los archivos creados.

Dominio a crear: **{{domainName}}**
Entidad: **{{entityName}}**
Atributos: **{{attributes}}**
