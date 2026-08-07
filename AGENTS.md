# MacroGest Core — Project Context

Monorepo TypeScript con pnpm workspaces. Arquitectura Modular Monolith con DDD y Hexagonal.

## Estructura

- `packages/server` — Backend: Express 5, tRPC v11, Sequelize v6 (MySQL), Awilix DI. Dominios en `src/domains/[Domain]/` con capas Domain/Application/Infrastructure/Presentation/DI.
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

Active feature: **employee-daily-reminders**

- Spec: `specs/004-employee-daily-reminders/spec.md`
- Plan: `specs/004-employee-daily-reminders/plan.md`
- Branch: `004-employee-daily-reminders`

Design artifacts: `specs/004-employee-daily-reminders/{research,data-model,quickstart}.md`, `specs/004-employee-daily-reminders/contracts/`

<!-- SPECKIT END -->
