<!--
SYNC IMPACT REPORT
Version change: N/A → 1.0.0 (primera ratificación)
Modified principles: ninguno — primera versión
Added sections:
  - Core Principles (I–VII)
  - Stack Tecnológico y Path Aliases
  - Pipeline de Calidad — Agentes y Skills
  - Governance
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check actualizado con los 7 principios
  ✅ .github/instructions/memory.instructions.md — schema 05_test_log.md agregado + Tester_Agent en history_log
  ✅ .github/agents/back.agent.md — handoff directo a @qa reemplazado por handoff a @tester
  ✅ .github/agents/front.agent.md — handoff directo a @qa reemplazado por handoff a @tester
  ✅ .github/agents/tester.agent.md — prompt del handoff a @qa actualizado para mencionar 05_test_log.md
Follow-up TODOs:
  - RATIFICATION_DATE aproximada (2026-05-17, inferida desde memory/history_log.json). Actualizar si se conoce la fecha exacta.
-->

# MacroGest Core Constitution

## Core Principles

### I. Arquitectura Hexagonal / DDD (NON-NEGOTIABLE)

Todo dominio del servidor DEBE seguir la estructura de 5 capas:
`Domain/` (entidad + puerto de repositorio) → `Application/` (use cases + tipos + servicio) →
`Infrastructure/` (controller tRPC + modelo Sequelize + implementación de repositorio + rutas),
con un archivo `[domain].di.ts` de registro Awilix en la raíz del dominio.

- Los DTOs de Input/Output DEBEN residir en `Application/[domain].types.ts` como `z.infer<typeof Schema>`.
  Ninguna interface de DTO manual pertenece a la capa `Domain/`.
- Los repositorios son **puertos abstractos** — solo se inyectan vía Awilix; no se importan directamente entre dominios.
- Las specs (`.spec.ts` / `.spec.tsx`) residen en una carpeta `specs/` dentro de la capa que contiene los archivos fuente testeados.
- `index.ts` en cada capa es un barrel puro (solo re-exports). Toda lógica DI va en `[domain].di.ts`.

### II. Multi-Tenant Obligatorio (NON-NEGOTIABLE)

Toda query al repositorio DEBE filtrar por `requestContext.values.ownerId`. Ningún dato cruza fronteras de tenant.

- `ownerId` se obtiene exclusivamente de `RequestContext.values.ownerId` — nunca de parámetros del cliente.
- El cumplimiento multi-tenant es verificado por `@reviewer` como ítem crítico en cada revisión.
- Los tests del agente `@tester` DEBEN incluir al menos un caso que valide la propagación correcta del `ownerId`.

### III. TypeScript Estricto + Zod como Fuente de Verdad

`any` está **prohibido** en todo el codebase. Todos los tipos deben ser explícitos.

- **Backend:** Zod valida en el controlador (`procedure.input()`). Los tipos de Input/Output se derivan con `z.infer<>`.
- **Frontend:** Los tipos de entidad se derivan con `inferRouterOutputs<TDomainRouter>`.
  Solo `TEntitySearch` (parámetros de URL/filtros) se define manualmente.
- Nunca duplicar definiciones de tipos entre capas; si el schema ya existe como Zod en el controller, derivar de él.

### IV. Flujo de Agentes Orquestado (NON-NEGOTIABLE)

Toda nueva feature DEBE transitar por el pipeline completo en este orden:

```
@analyst → 01_requirements.md
    ↓
@back / @front → código + 02_dev_log.md
    ↓
@tester → tests + 05_test_log.md
    ↓
@qa → 03_qa_report.md
    ├── FAIL (máx. 3 intentos) → @back / @front
    └── PASS → @reviewer → 04_review_log.md
                  ├── REJECTED (máx. 3 intentos) → @back / @front
                  └── APPROVED → Director cierra en history_log.json
```

- Ningún código llega a producción sin un `status: APPROVED` en `04_review_log.md`.
- Si cualquier agente alcanza `attempts: 3` sin resolución, se activa el Break-Loop:
  crear `memory/BLOCKED.md` y detener toda ejecución automática hasta intervención humana.
- Los agentes Speckit (`speckit.*`) gestionan planificación y branching; no reemplazan a los agentes de dominio.

### V. Tests por Regla de Negocio

Los tests validan **reglas de negocio reales** con datos concretos — no stubs genéricos.
El objetivo no es el porcentaje de cobertura sino que cada regla relevante tenga al menos un test.

- El agente `@tester` analiza el código fuente por capas (Entity, Use Case, Service, Controller, Hooks)
  y genera tests completos sin `TODO` pendientes antes de hacer handoff a `@qa`.
- `@qa` puede crear stubs mínimos (`it.todo`) solo si `@tester` no corrió antes; nunca sobreescribe tests existentes.
- Los archivos de spec DEBEN compilar y ejecutarse sin errores antes del handoff a `@qa`.

### VI. Conventional Commits + Linting Gates (NON-NEGOTIABLE)

Todos los commits DEBEN seguir el formato Conventional Commits: `<type>(<scope>): <subject>`.

- Husky ejecuta `lint-staged` (ESLint + Prettier) y `commitlint` en cada commit. `--no-verify` está **prohibido**.
- El `<scope>` DEBE coincidir con el nombre del dominio afectado (ej. `feat(articles): add price calculation`).
- Tipos válidos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`.

### VII. Aislamiento de Dominios

Ningún dominio importa el repositorio de otro dominio. La comunicación entre dominios es EXCLUSIVAMENTE
vía casos de uso (ver skill `cross-domain-relations`).

- El código de `packages/server/` no importa de `packages/app/` y viceversa,
  salvo los archivos de registro global explicitados en cada skill.
- La inyección de dependencias es responsabilidad exclusiva de Awilix en `[domain].di.ts`.
- La capa `Application/` global de cada paquete contiene únicamente lógica transversal (tipos base, hooks compartidos, contexto).
  Infraestructura (email, imágenes, etc.) NO pertenece a `Application/`.

## Stack Tecnológico y Path Aliases

| Capa     | Tecnologías                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces, TypeScript 5.x strict                                                         |
| Backend  | Express, tRPC v11, Sequelize v6 (MySQL), Awilix (DI), Zod, Pino                                |
| Frontend | React 18, Vite, TanStack Query, React Router v6, React Hook Form + Zod, Radix UI, Tailwind CSS |
| Calidad  | ESLint 9, Prettier, Husky, lint-staged, Commitlint (Conventional Commits)                      |
| Tests    | Vitest (unit + integration), Playwright (E2E)                                                  |

| Alias       | Resuelve a              |
| ----------- | ----------------------- |
| `@server/*` | `packages/server/src/*` |
| `@app/*`    | `packages/app/src/*`    |

## Pipeline de Calidad — Agentes y Skills

### Agentes del Proyecto

| Agente        | Rol                       | Skill principal                                                   |
| ------------- | ------------------------- | ----------------------------------------------------------------- |
| `@analyst`    | Analista Funcional y UX   | `requirements-analyst`                                            |
| `@back`       | Coder Backend (DDD)       | `back-ddd-generator`                                              |
| `@front`      | Coder Frontend (React)    | `front-ddd-generator`                                             |
| `@tester`     | Generador de Tests        | `test-generator`                                                  |
| `@qa`         | Validación estática       | `qa-runner`                                                       |
| `@reviewer`   | Crítico de Estándares     | `code-reviewer`                                                   |
| `@arch-fixer` | Corrección arquitectónica | `arch-audit`, `interfaces-to-application`, `domain-consolidation` |

### Skills de Arquitectura

| Skill                       | Propósito                                                   |
| --------------------------- | ----------------------------------------------------------- |
| `back-ddd-generator`        | Genera dominio DDD completo en el servidor                  |
| `front-ddd-generator`       | Genera dominio completo en el frontend                      |
| `cross-domain-relations`    | Patrón para relacionar datos entre dominios vía use cases   |
| `sequelize-associations`    | Asociaciones y eager loading en Sequelize v6                |
| `usecases-migration`        | Mueve `UseCases` de `Domain/` a `Application/`              |
| `arch-audit`                | Audita desvíos DDD/Hexagonal en todos los dominios          |
| `interfaces-to-application` | Migra DTOs de `Domain/` a `Application/[domain].types.ts`   |
| `domain-consolidation`      | Extrae lógica DI de `index.ts` a `[domain].di.ts`           |
| `test-generator`            | Analiza reglas de negocio y genera tests completos por capa |
| `commit-conventions`        | Convenciones de commits, Husky y lint-staged                |

### Skills de Flujo de Agentes

| Skill                  | Propósito                                                       |
| ---------------------- | --------------------------------------------------------------- |
| `requirements-analyst` | Template de `01_requirements.md` (usado por `@analyst`)         |
| `dev-logger`           | Template de `02_dev_log.md` (usado por `@back`/`@front`)        |
| `qa-runner`            | Secuencia de validación + `03_qa_report.md` (usado por `@qa`)   |
| `code-reviewer`        | Checklist 12 ítems + `04_review_log.md` (usado por `@reviewer`) |

## Governance

Esta constitución define los estándares no negociables del proyecto MacroGest Core.
Prevalece sobre cualquier práctica ad-hoc o convención implícita.

**Reglas de Enmienda (Semver):**

- MAJOR (X.0.0): Remoción o redefinición incompatible de un principio — requiere justificación documentada y plan de migración.
- MINOR (1.X.0): Nuevo principio o sección añadida; ampliación material de guía existente.
- PATCH (1.0.X): Clarificaciones, correcciones de redacción, sin cambios semánticos.

**Cumplimiento:**

- Todo PR debe verificar cumplimiento con los principios I, II, III y VII antes de ser aprobado.
- El agente `@reviewer` aplica el checklist de `code-reviewer` como guardián final de esta constitución en cada tarea.
- Los desvíos detectados por `arch-audit` deben corregirse antes de añadir nuevas features al dominio afectado.
- El Director (Chat base) es responsable de mantener `memory/history_log.json` como registro cronológico fidedigno.

Para guía de desarrollo en tiempo de ejecución y flujo de agentes unificado (Speckit + Blendverse) ver `.github/copilot-instructions.md`.

> **Fuente de verdad operacional**: `.github/copilot-instructions.md` — flujo de agentes, comandos del día a día e integración Speckit/Blendverse.
> **Fuente de verdad de principios**: este archivo — define los 7 principios NON-NEGOTIABLE, stack y gobernanza.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-06-06
