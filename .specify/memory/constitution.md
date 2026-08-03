<!--
SYNC IMPACT REPORT
Version change: 1.0.0 → 2.0.0 (MAJOR — redefinición de los principios IV y V, reemplazo de
la fuente de verdad operacional y ampliación material de los principios I, II, III, VI y VII)

Modified principles:
  - I. Arquitectura Hexagonal / DDD — agregada regla de barrel de dominio (solo
    `./Infrastructure/Routes`, nunca `./Infrastructure` completo) y referencia a las
    instrucciones normativas `.opencode/instructions/*`
  - II. Multi-Tenant Obligatorio — prohibición explícita de `id_propietario` en los
    schemas Zod de entrada del controller (nunca como input del cliente)
  - III. TypeScript Estricto + Zod — los templates de `back-ddd-generator` y
    `front-ddd-generator` son la implementación normativa; un template que contradiga
    `inferRouterOutputs` / `z.infer` es un desvío
  - IV. Flujo de Agentes Orquestado (renombrado) — pipeline reescrito con
    `@blendverse-implement` como orquestador, doble fuente de contexto (input crudo vs
    Speckit sin transcripción) y espejo de estado en Engram
  - V. Tests por Regla de Negocio — removida la cláusula de stubs de `@qa` (contradice
    el rol actual); `@blendverse-qa` no crea ni regenera tests; se explicitan los
    archivos sin lógica de negocio que no requieren tests
  - VI. Conventional Commits + Linting Gates — tipos de commit alineados con commitlint
    (`@commitlint/config-conventional`) y el skill `commit-conventions`; agregada regla
    anti-attribución IA en commits
  - VII. Aislamiento de Dominios — clarificado que el frontend SÍ importa tipos de
    `@server` (unidireccional server → app); el server nunca importa de app

Added sections:
  - Fuente de Verdad Operacional (`.opencode/` reemplaza `.github/copilot-instructions.md`)
  - Mecánica de persistencia multi-agente (`memory/` + espejo Engram)

Removed sections:
  - Referencias a `.github/copilot-instructions.md` (archivo eliminado del repo)
  - Tabla de agentes con handles cortos sin mapeo a los agentes reales

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check alineado con v2.0.0
     (handles `blendverse-*`, flujo dual, Pr. IV)
  ✅ .specify/templates/tasks-template.md — tests obligatorios (Pr. V), generados por
     `@blendverse-tester` tras la implementación
  ✅ .specify/templates/spec-template.md — verificado, sin cambios requeridos

Resolved TODOs (2026-07-31):
  ✅ .opencode/skills/back-ddd-generator — template del `index.ts` público corregido:
     exporta solo `./Domain`, `./Application`, `./Infrastructure/Routes` y `./[domain].di`
     (nunca `./Infrastructure` completo); se agregó la regla al Checklist Final
  ✅ .specify/extensions/agent-context/agent-context-config.yml — `context_file` ahora
     apunta a `AGENTS.md` (archivo de instrucciones que opencode lee en la raíz del repo)
  ✅ .specify/init-options.json y .specify/integration.json — integración actualizada a
     "opencode" (integración válida del workflow Speckit)
  ✅ .opencode/skills/back-ddd-generator — templates de `[domain].types.ts` y use cases
     corregidos: `id_propietario` eliminado de los schemas Zod de entrada y asignado en
     el use case desde `requestContext.values.ownerId` (Pr. II)
  ✅ .opencode/skills/commit-conventions — eliminadas las referencias a `--no-verify`;
     el skill ahora documenta la prohibición (Pr. VI)
  ✅ .opencode/skills/front-ddd-generator — template `[Entity].entity.ts` convertido a
     `inferRouterOutputs<T[Domain]Router>` con `NonNullable` (Pr. III); el desvío D1 de
     `arch-audit` desaparece de los dominios nuevos

Follow-up TODOs (artefactos que contradicen esta constitución — corregir en tareas
separadas):
  - ⚠ Dominios existentes del server (`Auth`, `Users`, `Documents`, etc.) siguen
    usando `export * from './Infrastructure'` y varias relaciones importan
    `UserModel`/`ProfileModel` desde el barrel del dominio; requieren refactor a
    rutas directas de `Infrastructure/Database` (tarea para `@blendverse-arch-fixer`)
-->

# MacroGest Core Constitution

## Project Identity

- Project Name: MacroGest Core
- Architecture Focus: Modular Monolith with Domain-Driven Design (DDD) and Hexagonal Architecture
- Version: 2.0.0
- Ratified: 2026-05-17
- Last Amended: 2026-07-31

## Core Principles

### I. Arquitectura Hexagonal / DDD (NON-NEGOTIABLE)

- Mínimo 5 capas: Domain, Infrastructure, Application, Presentation, DI.
- Múltiples dominios separados en `packages/server/src/domains/[Domain]/`, cada uno con su propio `Application/`, `Domain/`, `Infrastructure/`, `Presentation/` y `Infrastructure/Routes/`.
- DTOs de entrada/salida definidos con Zod (`z.infer<typeof Schema>`) en `Application/[domain].types.ts`.
- Repositorios son puertos abstractos definidos en Domain e implementados en Infrastructure, inyectados mediante Awilix.
- Los specs aislados viven dentro de su capa, en una carpeta `specs/` que espeja la estructura del dominio (especificación formal del contrato y del comportamiento por cada capa).
- El `index.ts` público de cada dominio es un barrel puro que SOLO re-exporta `./Infrastructure/Routes`; toda la lógica de DI (Awilix) vive en `[domain].di.ts` (nunca `./Infrastructure` completo, nunca lógica en `index.ts`).
- La arquitectura queda formalmente definida por las instrucciones normativas `.opencode/instructions/server.instructions.md` y `.opencode/instructions/app.instructions.md`, junto con las skills de generación `back-ddd-generator` y `front-ddd-generator`.

### II. Multi-Tenant Obligatorio (NON-NEGOTIABLE)

- Toda query DEBE filtrar por `RequestContext.values.ownerId`.
- El `ownerId` se obtiene EXCLUSIVAMENTE de `RequestContext` (inyectado en `[domain].di.ts`), NUNCA de parámetros del cliente.
- Prohibido declarar `id_propietario` en los schemas Zod de entrada del controller; el cliente nunca lo envía.
- El incumplimiento es CRITICAL en la revisión y desencadena la corrección de la tarea.
- Los tests de negocio deben incluir al menos un caso multi-tenant (datos de otro owner NO visibles).

### III. TypeScript Estricto + Zod (NON-NEGOTIABLE)

- Prohibido el uso de `any` explícito.
- Backend: validación con Zod en `procedure.input`; los tipos se derivan con `z.infer`.
- Frontend: los tipos se derivan con `inferRouterOutputs<typeof T[Domain]Router>`; solo se escribe manualmente `TEntitySearch`.
- Nunca duplicar tipos: derivar del contrato tRPC/Zod siempre que sea posible.
- Los templates de `back-ddd-generator` / `front-ddd-generator` son la implementación normativa de este principio; si un template contradice esta regla (ej. `T[Entity] = I[Entity]` en lugar de `inferRouterOutputs`), el template DEBE corregirse.

### IV. Flujo de Agentes Orquestado (NON-NEGOTIABLE)

El trabajo se ejecuta mediante un pipeline de agentes orquestado. Todo desarrollo pasa por la cadena y se cierra en `memory/history_log.json`; nadie salta el flujo.

```
Input crudo              Input Speckit
@blendverse-analyst      specs/{feature}/{spec,plan,tasks}.md
→ 01_requirements.md     (sin transcripción, se consume directo)
         │
         ▼
@blendverse-implement   (orquestador: task_id, alcance, resume_point)
         │
         ▼
@blendverse-back / @blendverse-front   → código + 02_dev_log.md
         │
         ▼
@blendverse-tester       → tests + 05_test_log.md
         │
         ▼
@blendverse-qa           → 03_qa_report.md
   ├── FAIL (máx. 3) → coder (incremento de attempts)
   └── PASS → @blendverse-reviewer → 04_review_log.md
         ├── REJECTED (máx. 3) → coder
         └── APPROVED → @blendverse-implement cierra en history_log.json
```

- Dos fuentes de contexto válidas: (1) input crudo del usuario, transformado por `@blendverse-analyst` en `01_requirements.md`; (2) artefactos Speckit (`spec.md`, `plan.md`, `tasks.md`), consumidos directamente SIN transcripción ni duplicación.
- `@blendverse-implement` detecta el alcance (back-only, front-only, full-stack) desde los artefactos de diseño, invoca la cadena como subagentes sin intervención del usuario y cierra la tarea en `history_log.json`.
- Ciclos de corrección acotados: `@blendverse-qa` y `@blendverse-reviewer` reenvían al coder (máx. 3 intentos cada uno); el límite se registra en `memory/BLOCKED.md`.
- Convención de `task_id`: `TASK-{rama-sanitizada}-YYYYMMDD-N` (la rama se sanitiza reemplazando `/` por `-`).

### V. Tests por Regla de Negocio (NON-NEGOTIABLE)

- Los tests se escriben por regla de negocio REAL extraída del código fuente, con datos concretos — no stubs ni mocks de bodega.
- Los genera y ejecuta `@blendverse-tester` después de la implementación (registro en `05_test_log.md`); 0 tests fallidos antes del handoff a QA.
- `@blendverse-qa` NO crea ni regenera tests: solo ejecuta validación estática (TypeScript + ESLint + Vitest smoke) sobre los tests ya generados.
- Los archivos sin lógica de negocio (modelo Sequelize, rutas, DI, barrels, schemas de presentación) no requieren tests propios.
- Los specs aislados deben compilar y pasar antes del handoff a `@blendverse-reviewer`.

### VI. Conventional Commits + Linting Gates (NON-NEGOTIABLE)

- Formato obligatorio: `<type>(<scope>): <subject>` (Conventional Commits).
- Tipos permitidos (alineados con `@commitlint/config-conventional` y el skill `commit-conventions`): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`.
- El scope indica el dominio o área afectada.
- Gates automáticos de calidad: Husky 9 (hooks pre-commit / commit-msg) + lint-staged + commitlint en CI. Prohibido esquivarlos con `--no-verify`.
- Prohibida la atribución IA en commits (sin "Co-Authored-By").

### VII. Aislamiento de Dominios (NON-NEGOTIABLE)

- No se importan repositorios de otros dominios; se usan casos de uso de otros dominios vía inyección de dependencias (patrón `cross-domain-relations`).
- El server NUNCA importa de `@app`.
- El frontend SÍ importa tipos y entidades de `@server` (por ejemplo `T[Domain]Router`) — relación unidireccional y permitida.
- Toda inyección de dependencias se hace con Awilix en `[domain].di.ts`.
- `Application/` global es transversal (datasource, logger, tenancy, helpers); la infraestructura de negocio no vive en `Application/`.

## Stack Tecnológico y Path Aliases

| Categoría | Stack                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Monorepo  | pnpm workspaces, TypeScript 6.x estricto                                                               |
| Backend   | Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix 13, Zod 4, Pino 10                                   |
| Frontend  | React 19, Vite 8, TanStack Query v5, React Router v7, React Hook Form + Zod, Radix UI, Tailwind CSS v4 |
| Calidad   | ESLint 10, Prettier 3, Husky 9, lint-staged 16, Commitlint 20 (Conventional Commits)                   |
| Tests     | Vitest 2 (unit + integration), Playwright (E2E)                                                        |

Path aliases:

| Alias                      | Ruta                                    |
| -------------------------- | --------------------------------------- |
| `@server`                  | `packages/server/src`                   |
| `@app`                     | `packages/app/src`                      |
| `@server/domains/[Domain]` | `packages/server/src/domains/[Domain]/` |
| `@app/domains/[Domain]`    | `packages/app/src/Domains/[Domain]/`    |

## Pipeline de Calidad — Agentes y Skills

### Agentes del Proyecto

| Agente                   | Rol                                                                                                  | Skill de referencia                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `@blendverse-implement`  | Orquestador full-stack: alcance, cadena back→front→tester→qa→reviewer y cierre en `history_log.json` | `engram-sync`                                                     |
| `@blendverse-analyst`    | Analista Funcional y UX: input crudo → User Stories con criterios de aceptación                      | `requirements-analyst`                                            |
| `@blendverse-back`       | Coder Backend (Hexagonal + DDD)                                                                      | `back-ddd-generator`                                              |
| `@blendverse-front`      | Coder Frontend (React)                                                                               | `front-ddd-generator`                                             |
| `@blendverse-tester`     | Generador y ejecutor de tests por regla de negocio                                                   | `test-generator`                                                  |
| `@blendverse-qa`         | Validación estática (TypeScript + ESLint + Vitest smoke + estructura)                                | `qa-runner`                                                       |
| `@blendverse-reviewer`   | Crítico de Estándares (arquitectura, seguridad, convenciones)                                        | `code-reviewer`                                                   |
| `@blendverse-arch-fixer` | Corrección automática de desvíos DDD/Hexagonal detectados por auditoría                              | `arch-audit`, `interfaces-to-application`, `domain-consolidation` |

### Skills de Arquitectura

| Skill                       | Uso                                                                         |
| --------------------------- | --------------------------------------------------------------------------- |
| `back-ddd-generator`        | Generar un dominio del server desde cero (estructura + DI)                  |
| `front-ddd-generator`       | Generar un módulo frontend React desde cero                                 |
| `sequelize-associations`    | Asociaciones y eager loading en Sequelize v6                                |
| `cross-domain-relations`    | Relaciones entre dominios vía casos de uso e inyección de dependencias      |
| `interfaces-to-application` | Migrar DTOs legacy de `Domain/` a `Application/[domain].types.ts` (z.infer) |
| `domain-consolidation`      | Extraer DI de `index.ts` hacia `[domain].di.ts`                             |
| `usecases-migration`        | Mover `UseCases/` de `Domain/` a `Application/`                             |
| `arch-audit`                | Detectar desvíos DDD/Hexagonal en server y frontend                         |

### Skills de Flujo de Agentes

| Skill                  | Uso                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `requirements-analyst` | Generar `memory/{task_id}/01_requirements.md`                                        |
| `test-generator`       | Extraer reglas de negocio y generar tests con datos concretos                        |
| `dev-logger`           | Registrar `memory/{task_id}/02_dev_log.md` al final de cada sesión de implementación |
| `qa-runner`            | Generar `memory/{task_id}/03_qa_report.md`                                           |
| `code-reviewer`        | Generar `memory/{task_id}/04_review_log.md`                                          |
| `engram-sync`          | Espejar en Engram cada fase del pipeline y permitir resume entre sesiones            |
| `commit-conventions`   | Mensajes de commit y hooks Husky/lint-staged/commitlint                              |
| `pr-detail`            | Generar el detalle de PR comparando main vs la rama actual                           |

### Mecánica de persistencia multi-agente

- `memory/{task_id}/` contiene los artefactos de la tarea: `01_requirements.md` (opcional, solo flujo crudo), `02_dev_log.md`, `03_qa_report.md`, `04_review_log.md`, `05_test_log.md`.
- `memory/history_log.json` es el registro autoritativo del estado de cada tarea (todo agente actualiza el que le corresponde).
- Engram es un espejo del estado para retomar pipelines entre sesiones; los archivos en disco mandan. Si un espejo contradice un artefacto en disco, se corrige el espejo.
- El break-loop se registra en `memory/BLOCKED.md` cuando un ciclo alcanza `attempts >= 3`.

## Fuente de Verdad Operacional

- Fuente de verdad operacional: `.opencode/` — agentes, instructions, skills y commands viven en `.opencode/agents`, `.opencode/instructions`, `.opencode/skills` y `.opencode/commands`.
- `.specify/memory/constitution.md` es la fuente de verdad de principios; prevalece sobre cualquier práctica ad-hoc o instrucción desactualizada.
- Instrucciones normativas: `.opencode/instructions/server.instructions.md` (backend), `.opencode/instructions/app.instructions.md` (frontend) y `.opencode/instructions/memory.instructions.md` (memoria).
- Cualquier referencia a rutas `.github/` (copilot, agents, instructions) en configuraciones es un residuo obsoleto y debe corregirse a `.opencode/`.

## Governance

### Versioning Policy

- Esta constitución usa **Semantic Versioning** (MAJOR.MINOR.PATCH).
- MAJOR (breaking): se modifica, elimina o redefine un principio existente.
- MINOR (non-breaking): se agregan principios nuevos o una guía no contradictoria.
- PATCH (tipo): se corrigen typos o se agregan aclaraciones que no cambian el significado.
- Cualquier cambio de versión DEBE actualizar el `Sync Impact Report` del header.

### Amendment Procedure

- El Director (Chat base) inicia los cambios vía `/speckit.constitution`.
- Cada enmienda requiere justificación documentada, bump de versión según la política semver y propagación a los templates dependientes (`plan`, `spec`, `tasks`) y a `.opencode/` (agents, instructions, skills, commands) cuando corresponda.

### Compliance Review Expectations

- Todo PR verifica el cumplimiento de los principios I–VII; el `@blendverse-reviewer` es el guardián final y puede rechazar la tarea.
- `@blendverse-arch-fixer` (vía `/unify-project`) corrige los desvíos que detecta `arch-audit`.
- El Director mantiene `memory/history_log.json`; los agentes del pipeline actualizan los artefactos que les corresponden.
- Los espejos de Engram se corrigen si contradicen los archivos en disco.
- Los commits cumplen Conventional Commits sin atribución IA.
