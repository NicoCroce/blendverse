# MacroGest Core — Documentación de Artefactos de Copilot

Índice central de todos los artefactos de GitHub Copilot configurados en este repositorio. Cada sección documenta el propósito, el flujo que automatiza y cómo invocarlo.

---

## Resumen de Artefactos

| Tipo        | Nombre                    | Invocación                                            | Propósito resumido                                      |
| ----------- | ------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| Instrucción | `copilot-instructions.md` | Automática (global)                                   | Reglas universales, Director orquestador y flujo        |
| Instrucción | `server.instructions.md`  | Automática (`packages/server/**`)                     | Arquitectura Hexagonal/DDD del backend                  |
| Instrucción | `app.instructions.md`     | Automática (`packages/app/**`)                        | Arquitectura por dominios del frontend                  |
| Instrucción | `memory.instructions.md`  | Automática (`memory/**`)                              | Schema frontmatter, break-loop y estructura de memoria  |
| Agente      | `@blendverse.analyst`     | `@blendverse.analyst` en chat                         | Analista UX · genera `01_requirements.md`               |
| Agente      | `@blendverse.back`        | `@blendverse.back` en chat                            | DDD Specialist · genera dominios de servidor            |
| Agente      | `@blendverse.front`       | `@blendverse.front` en chat                           | React Specialist · genera dominios de frontend          |
| Agente      | `@blendverse.qa`          | `@blendverse.qa` en chat                              | QA Híbrido · valida tsc + ESLint + estructura           |
| Agente      | `@blendverse.reviewer`    | `@blendverse.reviewer` en chat                        | Crítico de Estándares · checklist 12 ítems              |
| Skill       | `back-ddd-generator`      | automática / `@blendverse.back`                       | Templates completos para un dominio DDD en server       |
| Skill       | `front-ddd-generator`     | automática / `@blendverse.front`                      | Templates completos para un dominio React/tRPC          |
| Skill       | `cross-domain-relations`  | automática / `/cross-domain`                          | Patrón para relacionar dominios sin acoplamiento        |
| Skill       | `sequelize-associations`  | automática / `@blendverse.back`                       | Associations, eager loading y tipado en Sequelize v6    |
| Skill       | `usecases-migration`      | automática / `/migrate-usecases`                      | Mover UseCases de Domain/ → Application/                |
| Skill       | `commit-conventions`      | automática                                            | Commits Conventional, Husky, lint-staged                |
| Skill       | `requirements-analyst`    | automática / `@blendverse.analyst`                    | Template `01_requirements.md` con User Stories          |
| Skill       | `dev-logger`              | automática / `@blendverse.back` · `@blendverse.front` | Template `02_dev_log.md` al cerrar sesión de coder      |
| Skill       | `qa-runner`               | automática / `@blendverse.qa`                         | Secuencia tsc + lint + estructura → `03_qa_report.md`   |
| Skill       | `code-reviewer`           | automática / `@blendverse.reviewer`                   | Checklist 12 ítems → `04_review_log.md`                 |
| Prompt      | `/start-task`             | `/start-task`                                         | Kickoff del flujo orquestado completo                   |
| Prompt      | `/qa-check`               | `/qa-check`                                           | Trigger manual de @blendverse.qa sobre el código actual |
| Prompt      | `/new-domain-server`      | `/new-domain-server`                                  | Crea un dominio DDD completo en `packages/server`       |
| Prompt      | `/new-domain-app`         | `/new-domain-app`                                     | Crea un dominio front en `packages/app`                 |
| Prompt      | `/new-component`          | `/new-component`                                      | Crea un componente React reutilizable                   |
| Prompt      | `/new-usecase`            | `/new-usecase`                                        | Agrega un use case a un dominio existente               |
| Prompt      | `/new-hook`               | `/new-hook`                                           | Agrega un React Query hook a un dominio existente       |
| Prompt      | `/migrate-usecases`       | `/migrate-usecases`                                   | Ejecuta la migración de UseCases Domain→Application     |
| Prompt      | `/cross-domain`           | `/cross-domain`                                       | Conecta dos dominios con inyección de use cases         |
| Hook        | `block-destructive`       | Automático (PreToolUse)                               | Bloquea comandos destructivos irreversibles             |
| Hook        | `format-on-edit`          | Automático (PostToolUse)                              | Ejecuta `pnpm format` tras editar/crear archivos        |

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

### `@blendverse.back` — Backend DDD Specialist

**Ruta:** `.github/agents/blendverse.blendverse.back.agent.md`  
**Invocación:** `@blendverse.back <tarea>` en el chat.

Agente autónomo para el servidor. Solo trabaja en `packages/server/`. Para cualquier creación de dominio ejecuta mandatoriamente la skill `back-ddd-generator`. Tiene acceso también a `usecases-migration` y `cross-domain-relations`.

**Handoff disponible:** Al finalizar un dominio de servidor, puede derivar automáticamente a `@blendverse.front` para crear la capa de presentación.

**Flujo típico:**

1. El usuario describe la entidad y sus atributos.
2. `@blendverse.back` ejecuta el protocolo de preguntas de la skill.
3. Lista el árbol de archivos y espera aprobación.
4. Crea los archivos en orden: Domain → Application → Infrastructure → app.ts → index.ts.
5. Actualiza `register.ts` y `Router.ts`.
6. Invoca skill `dev-logger` para escribir `02_dev_log.md`.
7. Hace handoff a `@blendverse.qa`.
8. (Opcional, si tarea full-stack) Hace handoff a `@blendverse.front` antes del QA.

---

### `@blendverse.front` — Frontend React Specialist

**Ruta:** `.github/agents/blendverse.front.agent.md`  
**Invocación:** `@blendverse.front <tarea>` en el chat.

Agente autónomo para el frontend. Solo trabaja en `packages/app/`. Ejecuta mandatoriamente `front-ddd-generator` al crear dominios. Antes de cualquier creación lee los tipos del dominio servidor. Tiene handoff hacia `@blendverse.back` cuando se necesita modificar la lógica de negocio y hacia `@blendverse.qa` al finalizar la implementación.

**Flujo típico:**

1. Lee `[Entity].interfaces.ts` y `[Domain].routes.ts` del servidor.
2. Lista el árbol de archivos y espera aprobación.
3. Crea archivos en orden: entity → service → routes → router → hooks → pages → index.ts.
4. Actualiza `Routes.tsx` y opcionalmente `MenuAccess.tsx`.
5. Verifica errores.
6. Invoca skill `dev-logger` para escribir `02_dev_log.md`.
7. Hace handoff a `@blendverse.qa`.

---

### `@blendverse.analyst` — Analista Funcional y UX

**Ruta:** `.github/agents/blendverse.analyst.agent.md`  
**Invocación:** `@blendverse.analyst <requerimiento>` en el chat.

Primer eslabón del flujo orquestado. Transforma el input del usuario en `memory/{task_id}/01_requirements.md` con User Stories, criterios de aceptación y propuestas UX. No genera código.

**Flujo típico:**

1. Obtiene o genera el `task_id` activo desde `history_log.json`.
2. Lee las instrucciones del proyecto.
3. Ejecuta la skill `requirements-analyst`.
4. Escribe `memory/{task_id}/01_requirements.md`.
5. Hace handoff a `@blendverse.back` o `@blendverse.front` según el tipo de tarea.

---

### `@blendverse.qa` — QA Híbrido

**Ruta:** `.github/agents/blendverse.qa.agent.md`  
**Invocación:** `@blendverse.qa` en el chat, o via handoff desde `@blendverse.back`/`@blendverse.front`.

Agente de validación estática. Ejecuta TypeScript compiler + ESLint + verificación de estructura de carpetas. No genera tests — los documenta como pendientes. Activa el self-correction loop si detecta errores.

**Flujo típico:**

1. Lee `02_dev_log.md` para obtener los archivos a validar.
2. Verifica `attempts` (si >= 3, ejecuta break-loop).
3. Ejecuta `tsc --noEmit` y `pnpm lint`.
4. Verifica estructura de carpetas.
5. Escribe `memory/{task_id}/03_qa_report.md`.
6. Si PASS → handoff a `@blendverse.reviewer`. Si FAIL → handoff al Coder.

---

### `@blendverse.reviewer` — Crítico de Estándares

**Ruta:** `.github/agents/blendverse.reviewer.agent.md`  
**Invocación:** `@blendverse.reviewer` en el chat, o via handoff desde `@blendverse.qa`.

Último filtro antes del cierre de tarea. Solo actúa si `03_qa_report.md` tiene `status: PASS`. Verifica 12 ítems de arquitectura, tipado, seguridad y convenciones.

**Flujo típico:**

1. Confirma que `03_qa_report.md` tiene `status: PASS`.
2. Lee todos los archivos en `affected_files`.
3. Ejecuta la skill `code-reviewer` (checklist 12 ítems).
4. Escribe `memory/{task_id}/04_review_log.md`.
5. Si APPROVED → indica al Director cerrar la tarea. Si REJECTED → handoff al Coder.

---

## Instrucciones

### `memory.instructions.md`

**Ruta:** `.github/instructions/memory.instructions.md`  
**Se aplica:** Automáticamente cuando se trabaja en `memory/**`.

Define el sistema de memoria multi-agente: schema YAML frontmatter obligatorio para cada tipo de archivo (`01_requirements.md`, `02_dev_log.md`, `03_qa_report.md`, `04_review_log.md`, `BLOCKED.md`), convención de IDs de tarea, mecanismo break-loop (máx. 3 intentos) y formato del `history_log.json`.

---

## Skills

**Ruta:** `.github/skills/back-ddd-generator/SKILL.md`

Genera un dominio DDD completo en el servidor con todos los templates necesarios. Se activa automáticamente cuando `@blendverse.back` recibe una tarea de creación.

**Protocolos incluidos:**

- Protocolo de preguntas al usuario si faltan datos.
- Validación de estructura (árbol de archivos) antes de crear.
- Templates para: entidad, interfaces, repositorio abstracto, 5 use cases (GetAll, Get, Create, Update, Delete), service, controller tRPC, modelo Sequelize, implementación de repositorio, rutas tRPC, `[domain].app.ts` e `index.ts`.
- Instrucciones para actualizar `register.ts` y `Router.ts`.
- Checklist final de verificación.

---

### `front-ddd-generator`

**Ruta:** `.github/skills/front-ddd-generator/SKILL.md`

Genera un dominio completo en el frontend con todos los templates necesarios. Se activa automáticamente cuando `@blendverse.front` recibe una tarea de creación.

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

**Ruta:** `.github/prompts/blendverse.new-domain-server.prompt.md`  
**Modo:** `agent`

Crea un dominio DDD completo en `packages/server`. Invoca al agente `@blendverse.back` con la skill `back-ddd-generator`.

**Variables:** `{{domainName}}`, `{{entityName}}`, `{{attributes}}`

**Flujo:** protocolo de preguntas → aprobación del árbol → creación en capas → actualización de globals → verificación de errores.

---

### `/new-domain-app`

**Ruta:** `.github/prompts/blendverse.new-domain-app.prompt.md`  
**Modo:** `agent`

Crea un dominio completo en `packages/app`. Invoca al agente `@blendverse.front` con la skill `front-ddd-generator`. Requiere que el dominio backend ya exista.

**Variables:** `{{domainName}}`, `{{serverDomain}}`, `{{entityName}}`

**Flujo:** lectura de interfaces server → aprobación del árbol → creación en capas → actualización de Route.tsx y MenuAccess.tsx → verificación.

---

### `/new-component`

**Ruta:** `.github/prompts/blendverse.new-component.prompt.md`  
**Modo:** `agent`

Crea un componente React reutilizable en la capa correcta de `packages/app/src/Application/Components/`. Verifica si ya existe antes de crear uno nuevo.

**Variables:** `{{ComponentName}}`, `{{description}}`, `{{layer}}` (ui/Molecules/Organisms), `{{props}}`

**Flujo:** verificar existencia → determinar capa → crear componente → actualizar `index.ts` → verificar errores.

---

### `/new-usecase`

**Ruta:** `.github/prompts/blendverse.new-usecase.prompt.md`  
**Modo:** `agent`

Agrega un use case nuevo a un dominio del servidor ya existente.

**Variables:** `{{domain}}`, `{{entity}}`, `{{useCaseName}}`, `{{description}}`

**Flujo:** leer archivos del dominio → crear usecase → actualizar interfaces si necesita nuevo repo method → actualizar `index.ts`, `service.ts` y `app.ts` → agregar al controller/routes si aplica → verificar errores.

---

### `/new-hook`

**Ruta:** `.github/prompts/blendverse.new-hook.prompt.md`  
**Modo:** `agent`

Agrega un hook de React Query a un dominio frontend ya existente.

**Variables:** `{{domain}}`, `{{hookName}}`, `{{queryOrMutation}}`, `{{procedure}}`

**Flujo:** leer hooks e interfaces del domino → crear el hook (query o mutation) → actualizar `Hooks/index.ts` → verificar errores.

---

### `/migrate-usecases`

**Ruta:** `.github/prompts/blendverse.migrate-usecases.prompt.md`  
**Modo:** `agent`

Ejecuta la migración completa de la carpeta `UseCases` de un dominio aplicando el protocolo de la skill `usecases-migration`.

**Variables:** `{{domains}}`

**Flujo:** verificar existencia → lista + confirmación → mover → actualizar imports en 4 archivos → verificar errores.

---

### `/cross-domain`

**Ruta:** `.github/prompts/blendverse.cross-domain.prompt.md`  
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
| Agente      | `name.agent.md`        | `blendverse.back.agent.md`    |
| Instrucción | `name.instructions.md` | `server.instructions.md`      |
| Hook        | `name.json`            | `block-destructive.json`      |

---

## Flujos Completos

### Flujo Full-Stack: Crear un dominio nuevo de punta a punta

```
1. Usuario: @blendverse.back /new-domain-server domainName=Products entityName=Product ...
2. @blendverse.back: Protocolo de preguntas → árbol de archivos → (espera aprobación)
3. @blendverse.back: Crea Domain/ → Application/ → Infrastructure/ → app.ts → index.ts
4. @blendverse.back: Actualiza register.ts y Router.ts
5. @blendverse.back: Verifica errores → Hace handoff a @blendverse.front
6. @blendverse.front: Lee interfaces y tipos del server
7. @blendverse.front: /new-domain-app domainName=Products serverDomain=Products ...
8. @blendverse.front: Crea entity → service → hooks → pages → routes → router → index.ts
9. @blendverse.front: Actualiza Routes.tsx y MenuAccess.tsx
10. @blendverse.front: Verifica errores
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

---

### `/start-task`

**Ruta:** `.github/prompts/blendverse.start-task.prompt.md`  
**Modo:** `agent`

Kickoff del flujo orquestado completo. Actúa como Director del Proyecto: genera el `task_id`, registra la tarea en `memory/history_log.json`, delega a `@blendverse.analyst` y muestra al usuario la cadena de ejecución completa.

**Variables:** `{{userRequest}}`

**Flujo:** genera task_id → actualiza history_log.json → invoca @blendverse.analyst → informa al usuario la cadena `analyst → coder → qa → reviewer → cierre`.

---

### `/qa-check`

**Ruta:** `.github/prompts/blendverse.qa-check.prompt.md`  
**Modo:** `agent`

Trigger manual del agente `@blendverse.qa` sobre el código actual. Útil para re-validar después de cambios manuales o para ejecutar QA de forma independiente sin iniciar una tarea nueva.

**Variables:** `{{taskId}}`, `{{scope}}` (`server` | `app` | `both`)

**Flujo:** lee `02_dev_log.md` → ejecuta tsc + lint → verifica estructura → escribe `03_qa_report.md` → handoff según resultado.

---

## Skills — Flujo de Agentes

### `requirements-analyst`

**Ruta:** `.github/skills/requirements-analyst/SKILL.md`  
**Usada por:** `@blendverse.analyst`

Template y protocolo para generar `memory/{task_id}/01_requirements.md`. Define el protocolo de análisis (5 preguntas internas), el template con frontmatter + alcance + User Stories + criterios de aceptación + propuestas UX + dependencias cross-domain + estimación de complejidad. Incluye reglas de calidad (criterios verificables, máx. 3 User Stories por tarea).

---

### `dev-logger`

**Ruta:** `.github/skills/dev-logger/SKILL.md`  
**Usada por:** `@blendverse.back`, `@blendverse.front`

Template y protocolo para generar `memory/{task_id}/02_dev_log.md` al finalizar una sesión de implementación. Documenta archivos creados/modificados, decisiones técnicas y deuda técnica conocida. Debe invocarse siempre como último paso antes del handoff a `@blendverse.qa`.

---

### `qa-runner`

**Ruta:** `.github/skills/qa-runner/SKILL.md`  
**Usada por:** `@blendverse.qa`

Secuencia de validación estática: `tsc --noEmit` → `pnpm lint` → verificación de estructura de carpetas contra las instrucciones del proyecto. Define la tabla de determinación de status (`PASS`/`FAIL`), el template de `03_qa_report.md` con sección obligatoria de tests pendientes y reglas de calidad del reporte.

---

### `code-reviewer`

**Ruta:** `.github/skills/code-reviewer/SKILL.md`  
**Usada por:** `@blendverse.reviewer`

Checklist de 12 ítems categorizados en Arquitectura Hexagonal (3), TypeScript y Tipado (3), Validación y Seguridad OWASP (3) y Convenciones/Mantenibilidad (3). Distingue ítems críticos (🔴, bloquean aprobación) de recomendados (🟡, generan feedback sin bloquear). Define el template de `04_review_log.md` con checklist completo y sección de feedback con ejemplo de código.

---

## Sistema de Memoria

### Estructura de la carpeta `memory/`

```
memory/
  TASK-YYYYMMDD-N/         ← subcarpeta por tarea
    01_requirements.md     ← @blendverse.analyst
    02_dev_log.md          ← @blendverse.back / @blendverse.front
    03_qa_report.md        ← @blendverse.qa
    04_review_log.md       ← @blendverse.reviewer
  history_log.json         ← índice global (Director)
  BLOCKED.md               ← break-loop (máx. 3 intentos)
```

### Self-Correction Loop

```
@blendverse.analyst → 01_requirements.md
     ↓
@blendverse.back / @blendverse.front → código + 02_dev_log.md
     ↓
@blendverse.qa → 03_qa_report.md
    ├── FAIL (attempts < 3) → @blendverse.back / @blendverse.front (incrementa attempts)
    ├── FAIL (attempts = 3) → BLOCKED.md + notificar humano
    └── PASS → @blendverse.reviewer → 04_review_log.md
                  ├── REJECTED (attempts < 3) → @blendverse.back / @blendverse.front
                  ├── REJECTED (attempts = 3) → BLOCKED.md
                  └── APPROVED → Director → history_log.json COMPLETED
```
