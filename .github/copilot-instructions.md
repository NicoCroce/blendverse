# MacroGest Core — Instrucciones Globales de Copilot

## Contexto del Proyecto

Monorepo de e-commerce B2B multi-tenant. La empresa puede tener múltiples propietarios (owners); toda entidad pertenece a un `id_propietario` que se obtiene del `RequestContext.values.ownerId`.

| Paquete           | Descripción                                                 |
| ----------------- | ----------------------------------------------------------- |
| `packages/server` | API Node.js · Express + tRPC · Hexagonal Architecture / DDD |
| `packages/app`    | SPA React · Vite · Organizada por dominios funcionales      |

## Stack Tecnológico

| Capa     | Tecnologías                                                                        |
| -------- | ---------------------------------------------------------------------------------- |
| Monorepo | pnpm workspaces, TypeScript 5.x                                                    |
| Backend  | Express, tRPC v11, Sequelize v6 (MySQL), Awilix (DI), Zod, Pino                    |
| Frontend | React 18, Vite, TanStack Query, React Router v6, RHF + Zod, Radix UI, Tailwind CSS |
| Calidad  | ESLint 9, Prettier, Husky, lint-staged, Commitlint (Conventional Commits)          |

## Reglas Universales

1. **TypeScript estricto** — Nunca uses `any`. Los tipos deben ser explícitos.
2. **Zod es la fuente de verdad** para validaciones en controladores y formularios.
3. **Multi-tenant obligatorio** — Filtrá siempre por `requestContext.values.ownerId` en las queries del repositorio.
4. **Conventional Commits** — `feat(articles): add price calculation use case`.
5. **Nunca toques archivos de otro paquete** salvo los archivos de registro global indicados en cada skill.
6. **Nunca importes el repositorio de otro dominio** — importá su caso de uso (ver skill `cross-domain-relations`).
7. **Sin tests** — El proyecto no tiene suite de testing configurada; no generes archivos de test.

## Path Aliases

| Alias       | Resuelve a              |
| ----------- | ----------------------- |
| `@server/*` | `packages/server/src/*` |
| `@app/*`    | `packages/app/src/*`    |

## Agentes Disponibles

- **`@back`** — Crea/modifica dominios del servidor. Usa la skill `back-ddd-generator`.
- **`@front`** — Crea/modifica dominios del frontend. Usa la skill `front-ddd-generator`.

Ante una tarea full-stack, `@back` construye el dominio primero y hace handoff a `@front`.

## Skills Disponibles

| Skill                    | Cuándo usarla                                        |
| ------------------------ | ---------------------------------------------------- |
| `back-ddd-generator`     | Crear un dominio nuevo completo en el server         |
| `front-ddd-generator`    | Crear un dominio nuevo completo en el frontend       |
| `cross-domain-relations` | Relacionar datos de dos dominios del server          |
| `sequelize-associations` | Definir asociaciones y eager loading en Sequelize v6 |
| `usecases-migration`     | Mover UseCases de `Domain/` a `Application/`         |
| `commit-conventions`     | Dudas sobre commits, hooks y lint-staged             |

## Instrucciones Específicas

- Backend → `.github/instructions/server.instructions.md`
- Frontend → `.github/instructions/app.instructions.md`
