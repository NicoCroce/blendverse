# MacroGest Core — Project Context

Monorepo TypeScript con pnpm workspaces. Arquitectura Modular Monolith con DDD y Hexagonal.

## Estructura

- `packages/server` — Backend: Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix DI. Dominios en `src/domains/[Domain]/` con `Domain/`, `Application/`, `Infrastructure/` y `[domain].di.ts`; los controllers viven en `Infrastructure/Controllers`.
- `packages/app` — Frontend: React 19, Vite, TanStack Query, React Router, Tailwind. Dominios en `src/Domains/[Domain]/`.
- `specs/` — Artefactos Speckit por feature (`{spec,plan,tasks}.md`).
- `memory/` — Artefactos del pipeline de agentes por tarea.

## Comandos

| Comando           | Uso                                  |
| ----------------- | ------------------------------------ |
| `pnpm app:dev`    | Frontend en dev (Vite)               |
| `pnpm server:dev` | Backend en dev (tsx watch)           |
| `pnpm test`       | Tests de todos los packages (Vitest) |
| `pnpm lint`       | ESLint sobre server y app            |
| `pnpm tsc`        | TypeScript check sin emit            |
| `pnpm build`      | Build de server y app                |

## Fuente de Verdad

- `.specify/memory/constitution.md` — principios de arquitectura (I–VII). Prevalece sobre prácticas ad-hoc.
- `.opencode/instructions/server.instructions.md` — reglas normativas del backend.
- `.opencode/instructions/app.instructions.md` — reglas normativas del frontend.
- `.opencode/instructions/memory.instructions.md` — reglas de persistencia de memoria.
- Los tres archivos de instrucciones se cargan automáticamente vía `opencode.json`.

## Convenciones

- Commits: Conventional Commits (`<type>(<scope>): <subject>`), sin atribución IA.
- Workflow de implementación: pipeline orquestado de agentes (ver constitution, principio IV) con cierre en `memory/history_log.json`.

<!-- SPECKIT START -->

## Spec Kit — Feature Plan

Active feature: **company-email-settings**

- Spec: `specs/company-email-settings/spec.md`
- Plan: `specs/company-email-settings/plan.md`
- Branch: `005-company-email-settings`

Design artifacts: `specs/company-email-settings/{research,data-model,quickstart}.md`, `specs/company-email-settings/contracts/`

<!-- SPECKIT END -->
