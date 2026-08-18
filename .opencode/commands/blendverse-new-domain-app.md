---
description: Crea un dominio completo en el frontend React (entity types, service tRPC, hooks, páginas y registro de rutas). Invoca al agente @blendverse-front con la skill front-ddd-generator. Requiere que el dominio backend ya exista.
agent: blendverse-front
---

Actúa como el agente `@blendverse-front`. Carga y sigue estrictamente la skill `front-ddd-generator`.

El usuario quiere crear un nuevo dominio en `packages/app`. El dominio backend en `packages/server/src/domains/[Domain]` **ya existe**.

**Antes de escribir código:**

1. Lee `packages/server/src/domains/{{serverDomain}}/Infrastructure/Routes/{{serverDomain}}.routes.ts` para obtener el tipo `T{{serverDomain}}Router`.
2. Lista el árbol de archivos completo y espera aprobación.
3. Crea los archivos en orden: entity → service → routes → router → hooks → pages → index.ts.
4. Actualiza `Routes.tsx` (y `MenuAccess.tsx` si corresponde).
5. Verifica que no haya errores de TypeScript en los archivos creados.

Si existe `specs/{feature}/contracts/operations.json`, ejecútalo mediante el
CLI `generate-front --operations-file`. El generator crea únicamente el
scaffold técnico; después debes implementar la UI y lógica específica de la
feature.

Dominio frontend: **{{domainName}}**
Dominio servidor: **{{serverDomain}}**
Entidad: **{{entityName}}**
