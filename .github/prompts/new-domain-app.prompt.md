---
agent: agent
description: Crea un dominio completo en el frontend React (entity types, service tRPC, hooks, páginas y registro de rutas). Invoca al agente @front con la skill front-ddd-generator. Requiere que el dominio backend ya exista.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@front`. Carga y sigue estrictamente la skill `front-ddd-generator`.

El usuario quiere crear un nuevo dominio en `packages/app`. El dominio backend en `packages/server/src/domains/[Domain]` **ya existe**.

**Antes de escribir código:**

1. Lee `packages/server/src/domains/{{serverDomain}}/Domain/{{entityName}}.interfaces.ts` para obtener la interfaz `I{{entityName}}`.
2. Lee `packages/server/src/domains/{{serverDomain}}/Infrastructure/Routes/{{serverDomain}}.routes.ts` para obtener el tipo `T{{serverDomain}}Router`.
3. Lista el árbol de archivos completo y espera aprobación.
4. Crea los archivos en orden: entity → service → routes → router → hooks → pages → index.ts.
5. Actualiza `Routes.tsx` (y `MenuAccess.tsx` si corresponde).
6. Verifica que no haya errores de TypeScript en los archivos creados.

Dominio frontend: **{{domainName}}**
Dominio servidor: **{{serverDomain}}**
Entidad: **{{entityName}}**
