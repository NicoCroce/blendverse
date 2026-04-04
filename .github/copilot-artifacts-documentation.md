# MacroGest Core — Documentación de Artefactos de Copilot

Índice central de todos los artefactos de GitHub Copilot configurados en este repositorio. Cada sección documenta el propósito, el flujo que automatiza y cómo invocarlo.

---

## Resumen de Artefactos

| Tipo        | Nombre                    | Invocación                        | Propósito resumido                                   |
| ----------- | ------------------------- | --------------------------------- | ---------------------------------------------------- |
| Instrucción | `copilot-instructions.md` | Automática (global)               | Reglas universales del stack y convenciones          |
| Instrucción | `server.instructions.md`  | Automática (`packages/server/**`) | Arquitectura Hexagonal/DDD del backend               |
| Instrucción | `app.instructions.md`     | Automática (`packages/app/**`)    | Arquitectura por dominios del frontend               |
| Agente      | `@back`                   | `@back` en chat                   | DDD Specialist · genera dominios de servidor         |
| Agente      | `@front`                  | `@front` en chat                  | React Specialist · genera dominios de frontend       |
| Skill       | `back-ddd-generator`      | automática / `@back`              | Templates completos para un dominio DDD en server    |
| Skill       | `front-ddd-generator`     | automática / `@front`             | Templates completos para un dominio React/tRPC       |
| Skill       | `cross-domain-relations`  | automática / `/cross-domain`      | Patrón para relacionar dominios sin acoplamiento     |
| Skill       | `sequelize-associations`  | automática / `@back`              | Associations, eager loading y tipado en Sequelize v6 |
| Skill       | `usecases-migration`      | automática / `/migrate-usecases`  | Mover UseCases de Domain/ → Application/             |
| Skill       | `commit-conventions`      | automática                        | Commits Conventional, Husky, lint-staged             |
| Prompt      | `/new-domain-server`      | `/new-domain-server`              | Crea un dominio DDD completo en `packages/server`    |
| Prompt      | `/new-domain-app`         | `/new-domain-app`                 | Crea un dominio front en `packages/app`              |
| Prompt      | `/new-component`          | `/new-component`                  | Crea un componente React reutilizable                |
| Prompt      | `/new-usecase`            | `/new-usecase`                    | Agrega un use case a un dominio existente            |
| Prompt      | `/new-hook`               | `/new-hook`                       | Agrega un React Query hook a un dominio existente    |
| Prompt      | `/migrate-usecases`       | `/migrate-usecases`               | Ejecuta la migración de UseCases Domain→Application  |
| Prompt      | `/cross-domain`           | `/cross-domain`                   | Conecta dos dominios con inyección de use cases      |
| Hook        | `block-destructive`       | Automático (PreToolUse)           | Bloquea comandos destructivos irreversibles          |
| Hook        | `format-on-edit`          | Automático (PostToolUse)          | Ejecuta `pnpm format` tras editar/crear archivos     |

---

## Instrucciones

### `copilot-instructions.md`

**Ruta:** `.github/copilot-instructions.md`  
**Se aplica:** Globalmente, en todas las conversaciones.

Define el contexto general del proyecto (monorepo B2B multi-tenant), las reglas universales (TypeScript estricto, Zod como fuente de verdad, filtro multi-tenant obligatorio, Conventional Commits, sin tests) y el índice de skills y agentes disponibles. **Este es el primer archivo que debe leerse antes de cualquier tarea.**

---

### `server.instructions.md`

**Ruta:** `.github/instructions/server.instructions.md`  
**Se aplica:** Automáticamente cuando se trabaja en `packages/server/**`.

Documenta la estructura completa de un dominio hexagonal en el servidor: capas Domain, Application e Infrastructure, templates de código reales para cada capa, el registro Awilix (`[domain].app.ts`), y los archivos globales a actualizar al crear un dominio.

---

### `app.instructions.md`

**Ruta:** `.github/instructions/app.instructions.md`  
**Se aplica:** Automáticamente cuando se trabaja en `packages/app/**`.

Documenta la estructura de un dominio frontend: archivos de entity, service tRPC, hooks (query/mutation/cache), rutas, router y páginas. Incluye patrones de formularios RHF+Zod, mapa de componentes compartidos y convenciones de nomenclatura.

---

## Agentes

### `@back` — Backend DDD Specialist

**Ruta:** `.github/agents/back.agent.md`  
**Invocación:** `@back <tarea>` en el chat.

Agente autónomo para el servidor. Solo trabaja en `packages/server/`. Para cualquier creación de dominio ejecuta mandatoriamente la skill `back-ddd-generator`. Tiene acceso también a `usecases-migration` y `cross-domain-relations`.

**Handoff disponible:** Al finalizar un dominio de servidor, puede derivar automáticamente a `@front` para crear la capa de presentación.

**Flujo típico:**

1. El usuario describe la entidad y sus atributos.
2. `@back` ejecuta el protocolo de preguntas de la skill.
3. Lista el árbol de archivos y espera aprobación.
4. Crea los archivos en orden: Domain → Application → Infrastructure → app.ts → index.ts.
5. Actualiza `register.ts` y `Router.ts`.
6. Verifica errores.
7. (Opcional) Hace handoff a `@front`.

---

### `@front` — Frontend React Specialist

**Ruta:** `.github/agents/front.agent.md`  
**Invocación:** `@front <tarea>` en el chat.

Agente autónomo para el frontend. Solo trabaja en `packages/app/`. Ejecuta mandatoriamente `front-ddd-generator` al crear dominios. Antes de cualquier creación lee los tipos del dominio servidor. Tiene handoff hacia `@back` cuando se necesita modificar la lógica de negocio.

**Flujo típico:**

1. Lee `[Entity].interfaces.ts` y `[Domain].routes.ts` del servidor.
2. Lista el árbol de archivos y espera aprobación.
3. Crea archivos en orden: entity → service → routes → router → hooks → pages → index.ts.
4. Actualiza `Routes.tsx` y opcionalmente `MenuAccess.tsx`.
5. Verifica errores.

---

## Skills

### `back-ddd-generator`

**Ruta:** `.github/skills/back-ddd-generator/SKILL.md`

Genera un dominio DDD completo en el servidor con todos los templates necesarios. Se activa automáticamente cuando `@back` recibe una tarea de creación.

**Protocolos incluidos:**

- Protocolo de preguntas al usuario si faltan datos.
- Validación de estructura (árbol de archivos) antes de crear.
- Templates para: entidad, interfaces, repositorio abstracto, 5 use cases (GetAll, Get, Create, Update, Delete), service, controller tRPC, modelo Sequelize, implementación de repositorio, rutas tRPC, `[domain].app.ts` e `index.ts`.
- Instrucciones para actualizar `register.ts` y `Router.ts`.
- Checklist final de verificación.

---

### `front-ddd-generator`

**Ruta:** `.github/skills/front-ddd-generator/SKILL.md`

Genera un dominio completo en el frontend con todos los templates necesarios. Se activa automáticamente cuando `@front` recibe una tarea de creación.

**Protocolos incluidos:**

- Prerequisito: leer tipos del dominio servidor antes de generar.
- Protocolo de preguntas al usuario si faltan datos.
- Templates para: entity, service tRPC, routes, router, 6 hooks (cache, getAll, get, add, update, delete), 3 páginas (List, New, Update), `Components/index.ts` e `index.ts`.
- Instrucciones para actualizar `Routes.tsx` y `MenuAccess.tsx`.
- Checklist final.

---

### `cross-domain-relations`

**Ruta:** `.github/skills/cross-domain-relations/SKILL.md`

Patrón para relacionar datos entre dominios del servidor sin romper el aislamiento DDD. Se activa cuando un dominio consumidor necesita datos de otro dominio.

**Estructura del patrón (4 pasos):**

1. Crear use case en el dominio proveedor que exponga solo lo necesario.
2. Crear use case en el dominio de datos por IDs.
3. Inyectar los use cases en el constructor del dominio consumidor y usar `executeUseCase`.
4. Registrar los use cases del proveedor en el `[consumer].app.ts`.

**Anti-patrones documentados:**

- No importar repositorios de otros dominios.
- No importar modelos de base de datos de otros dominios.
- No crear queries con joins multi-dominio en un solo repositorio.

---

### `sequelize-associations`

**Ruta:** `.github/skills/sequelize-associations/SKILL.md`

Patrones para definir y usar asociaciones Sequelize v6 en la capa `Infrastructure/Database/`. Se activa cuando se necesita hacer eager loading entre modelos.

**Contenido:**

1. Declarar asociaciones estáticas (`belongsTo`, `hasMany`, `hasOne`) en los archivos `.model.ts`.
2. Usar `include` en queries con filtro multi-tenant.
3. Tipar los campos virtuales con `declare` mixins en la clase del modelo.
4. Propagar los campos calculados a la entidad de dominio.
5. Evitar ciclos de importación entre modelos.

---

### `usecases-migration`

**Ruta:** `.github/skills/usecases-migration/SKILL.md`

Protocolo paso a paso para mover la carpeta `UseCases` de `Domain/UseCases/` a `Application/UseCases/` sin perder imports ni introducir errores de TypeScript.

**Pasos:**

1. Verificación previa (listado de dominios a migrar).
2. Lectura de contexto (`index.ts`, `service.ts`, `app.ts`, lista de use cases).
3. Mover carpeta con `mv`.
4. Actualizar `Domain/index.ts` (remover export de UseCases).
5. Actualizar `Application/index.ts` (agregar export de UseCases).
6. Actualizar imports en `service.ts`, `usecase.ts` y `app.ts`.
7. Verificación final con `diagnostics/getErrors`.

---

### `commit-conventions`

**Ruta:** `.github/skills/commit-conventions/SKILL.md`

Referencia completa para Conventional Commits, Husky pre-commit hooks, lint-staged y troubleshooting de problemas comunes de commit.

**Incluye:** tipos permitidos (`feat`, `fix`, `refactor`, etc.), ejemplos correctos e incorrectos, flujo de trabajo completo, y resolución de problemas de ESLint/Prettier/Commitlint.

---

## Prompts

### `/new-domain-server`

**Ruta:** `.github/prompts/new-domain-server.prompt.md`  
**Modo:** `agent`

Crea un dominio DDD completo en `packages/server`. Invoca al agente `@back` con la skill `back-ddd-generator`.

**Variables:** `{{domainName}}`, `{{entityName}}`, `{{attributes}}`

**Flujo:** protocolo de preguntas → aprobación del árbol → creación en capas → actualización de globals → verificación de errores.

---

### `/new-domain-app`

**Ruta:** `.github/prompts/new-domain-app.prompt.md`  
**Modo:** `agent`

Crea un dominio completo en `packages/app`. Invoca al agente `@front` con la skill `front-ddd-generator`. Requiere que el dominio backend ya exista.

**Variables:** `{{domainName}}`, `{{serverDomain}}`, `{{entityName}}`

**Flujo:** lectura de interfaces server → aprobación del árbol → creación en capas → actualización de Route.tsx y MenuAccess.tsx → verificación.

---

### `/new-component`

**Ruta:** `.github/prompts/new-component.prompt.md`  
**Modo:** `agent`

Crea un componente React reutilizable en la capa correcta de `packages/app/src/Aplication/Components/`. Verifica si ya existe antes de crear uno nuevo.

**Variables:** `{{ComponentName}}`, `{{description}}`, `{{layer}}` (ui/Molecules/Organisms), `{{props}}`

**Flujo:** verificar existencia → determinar capa → crear componente → actualizar `index.ts` → verificar errores.

---

### `/new-usecase`

**Ruta:** `.github/prompts/new-usecase.prompt.md`  
**Modo:** `agent`

Agrega un use case nuevo a un dominio del servidor ya existente.

**Variables:** `{{domain}}`, `{{entity}}`, `{{useCaseName}}`, `{{description}}`

**Flujo:** leer archivos del dominio → crear usecase → actualizar interfaces si necesita nuevo repo method → actualizar `index.ts`, `service.ts` y `app.ts` → agregar al controller/routes si aplica → verificar errores.

---

### `/new-hook`

**Ruta:** `.github/prompts/new-hook.prompt.md`  
**Modo:** `agent`

Agrega un hook de React Query a un dominio frontend ya existente.

**Variables:** `{{domain}}`, `{{hookName}}`, `{{queryOrMutation}}`, `{{procedure}}`

**Flujo:** leer hooks e interfaces del domino → crear el hook (query o mutation) → actualizar `Hooks/index.ts` → verificar errores.

---

### `/migrate-usecases`

**Ruta:** `.github/prompts/migrate-usecases.prompt.md`  
**Modo:** `agent`

Ejecuta la migración completa de la carpeta `UseCases` de un dominio aplicando el protocolo de la skill `usecases-migration`.

**Variables:** `{{domains}}`

**Flujo:** verificar existencia → lista + confirmación → mover → actualizar imports en 4 archivos → verificar errores.

---

### `/cross-domain`

**Ruta:** `.github/prompts/cross-domain.prompt.md`  
**Modo:** `agent`

Conecta dos dominios del servidor mediante inyección de use cases siguiendo el patrón de `cross-domain-relations`.

**Variables:** `{{providerDomain}}`, `{{providerEntity}}`, `{{providerUseCase}}`, `{{consumerDomain}}`, `{{consumerUseCase}}`, `{{dataDescription}}`

**Flujo:** leer archivos de ambos dominios → crear use case en proveedor si no existe → inyectar en consumidor → registrar en `app.ts` del consumidor → verificar errores.

---

## Hooks

### `block-destructive`

**Ruta:** `.github/hooks/block-destructive.json`  
**Evento:** `PreToolUse` (antes de ejecutar comandos de terminal)

Bloquea automáticamente comandos destructivos o irreversibles:

- `rm -rf`
- `git push --force`
- `git reset --hard`
- `DROP TABLE` / `DROP DATABASE`
- `truncate`
- `git clean -fd`
- `npx prisma migrate reset`

Cuando un comando coincide, el agente muestra el mensaje: _"⛔ Comando destructivo bloqueado. Requiere confirmación explícita del usuario antes de ejecutar."_

---

### `format-on-edit`

**Ruta:** `.github/hooks/format-on-edit.json`  
**Evento:** `PostToolUse` (después de editar o crear archivos)

Ejecuta automáticamente `pnpm format` (Prettier) cada vez que el agente crea o edita un archivo. Garantiza formato consistente en todo el código generado sin necesidad de intervención manual.

---

## Convenciones de Nomenclatura Global

| Artefacto   | Patrón                 | Ejemplo                       |
| ----------- | ---------------------- | ----------------------------- |
| Skill       | `kebab-case/SKILL.md`  | `back-ddd-generator/SKILL.md` |
| Prompt      | `kebab-case.prompt.md` | `new-domain-server.prompt.md` |
| Agente      | `name.agent.md`        | `back.agent.md`               |
| Instrucción | `name.instructions.md` | `server.instructions.md`      |
| Hook        | `name.json`            | `block-destructive.json`      |

---

## Flujos Completos

### Flujo Full-Stack: Crear un dominio nuevo de punta a punta

```
1. Usuario: @back /new-domain-server domainName=Products entityName=Product ...
2. @back: Protocolo de preguntas → árbol de archivos → (espera aprobación)
3. @back: Crea Domain/ → Application/ → Infrastructure/ → app.ts → index.ts
4. @back: Actualiza register.ts y Router.ts
5. @back: Verifica errores → Hace handoff a @front
6. @front: Lee interfaces y tipos del server
7. @front: /new-domain-app domainName=Products serverDomain=Products ...
8. @front: Crea entity → service → hooks → pages → routes → router → index.ts
9. @front: Actualiza Routes.tsx y MenuAccess.tsx
10. @front: Verifica errores
```

### Flujo: Agregar relación entre dominios existentes

```
1. Usuario: /cross-domain providerDomain=Users providerUseCase=GetEmailsByUsersId consumerDomain=Recipt ...
2. Agente: Lee archivos del proveedor (Users) y del consumidor (Recipt)
3. Agente: Crea GetEmailsByUsersId.usecase.ts en Users/Application/UseCases/ (si no existe)
4. Agente: Inyecta el use case en CreateRecipt.usecase.ts
5. Agente: Agrega _getEmailsByUsersId en recipt.app.ts
6. Agente: Verifica errores
```

### Flujo: Migrar UseCases de un dominio

```
1. Usuario: /migrate-usecases domains=Articles
2. Agente: Verifica que Articles/Domain/UseCases/ exista
3. Agente: Lista archivos a mover → (espera confirmación)
4. Agente: mv Domain/UseCases → Application/UseCases
5. Agente: Actualiza Domain/index.ts, Application/index.ts, service.ts, app.ts, usecase.ts
6. Agente: diagnostics/getErrors → corrige si hay errores
```
