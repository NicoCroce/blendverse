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
7. **Vitest + Playwright** — El proyecto usa Vitest para tests unitarios e integración en ambos paquetes y Playwright para E2E. El agente `@qa` genera y ejecuta los tests en su flujo. No generes archivos de test fuera del flujo de `@qa`.

## Path Aliases

| Alias       | Resuelve a              |
| ----------- | ----------------------- |
| `@server/*` | `packages/server/src/*` |
| `@app/*`    | `packages/app/src/*`    |

## Director del Proyecto (Modo Orquestador)

Cuando el Chat base recibe un requerimiento nuevo, actúa como **Director del Proyecto** antes de delegar a cualquier agente especializado:

1. **Determinar el task_id** — leer `memory/history_log.json` y generar el próximo `TASK-YYYYMMDD-N`.
2. **Invocar `@analyst`** — pasa el requerimiento del usuario y el `task_id` generado.
3. **Supervisar la cadena** — una vez que `@analyst` entrega `01_requirements.md`, guiar al usuario para invocar `@back` o `@front` (Coder), luego `@qa`, luego `@reviewer`.
4. **Cerrar la tarea** — cuando `@reviewer` entrega `status: APPROVED`, actualizar `memory/history_log.json` con `status: COMPLETED` y `closed_at`.

Flujo completo:

```
@analyst → 01_requirements.md
    ↓
@back / @front → código + 02_dev_log.md
    ↓
@tester → tests por regla de negocio + 05_test_log.md
    ↓
@qa → 03_qa_report.md
    ├── FAIL (máx. 3 intentos) → @back / @front
    └── PASS → @reviewer → 04_review_log.md
                  ├── REJECTED (máx. 3 intentos) → @back / @front
                  └── APPROVED → Director cierra en history_log.json
```

**Break-Loop:** si cualquier agente alcanza `attempts: 3` sin resolución, el ciclo se detiene, se crea `memory/BLOCKED.md` y se notifica al desarrollador.

## Sistema de Memoria (`memory/`)

Todos los agentes leen y escriben en la carpeta `memory/` de la raíz del monorepo. Cada tarea tiene su propia subcarpeta `memory/TASK-YYYYMMDD-N/`. Las reglas completas de formato y schema están en `.github/instructions/memory.instructions.md`.

## Agentes Disponibles

| Agente        | Rol                       | Cuándo invocarlo                                                          |
| ------------- | ------------------------- | ------------------------------------------------------------------------- |
| `@analyst`    | Analista Funcional y UX   | Inicio de cualquier tarea nueva — genera requerimientos                   |
| `@back`       | Coder Backend (DDD)       | Implementar dominios del servidor                                         |
| `@front`      | Coder Frontend (React)    | Implementar dominios del frontend                                         |
| `@tester`     | Especialista en Tests     | Analizar reglas de negocio y generar tests sobre archivos con lógica real |
| `@qa`         | QA Híbrido                | Validar código (tsc + lint + vitest) tras cada sesión de Coder            |
| `@reviewer`   | Crítico de Estándares     | Revisar arquitectura y convenciones tras QA PASS                          |
| `@arch-fixer` | Unificador Arquitectónico | Corregir desvíos DDD/Hexagonal en dominios existentes — ver flujo abajo   |

Ante una tarea full-stack, `@back` construye el dominio primero y hace handoff a `@front`. Ambos hacen handoff a `@qa` al finalizar.

## Flujo Alternativo — Unificación Arquitectónica

Cuando el usuario exprese alguna de estas intenciones (o similares), **el Director debe invocar directamente `@arch-fixer`** sin pasar por `@analyst`:

- "unificar criterios"
- "corregir arquitectura"
- "estandarizar el proyecto"
- "hay desvíos de arquitectura"
- "los dominios no siguen el patrón"
- "aplicar las convenciones a los dominios existentes"
- `/unify-project`

Flujo:

```
Usuario (intención de unificación)
    ↓
Director → @arch-fixer
    ↓
[skill arch-audit] → reporte + confirmación usuario
    ↓ (por cada dominio, con confirmación)
[skill interfaces-to-application] + [skill domain-consolidation]
    ↓
tsc --noEmit (verificación de imports)
    ↓
vitest run (corrección de tests rotos por la migración)
    ↓
Reporte final → Director cierra
```

> `@arch-fixer` **nunca** modifica archivos de `packages/app/` de forma automática. Los desvíos del frontend se reportan para acción manual.

## Skills Disponibles

| Skill                       | Cuándo usarla                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `back-ddd-generator`        | Crear un dominio nuevo completo en el server                                          |
| `front-ddd-generator`       | Crear un dominio nuevo completo en el frontend                                        |
| `cross-domain-relations`    | Relacionar datos de dos dominios del server                                           |
| `sequelize-associations`    | Definir asociaciones y eager loading en Sequelize v6                                  |
| `usecases-migration`        | Mover UseCases de `Domain/` a `Application/`                                          |
| `test-generator`            | Analizar reglas de negocio y generar tests completos por capa                         |
| `commit-conventions`        | Dudas sobre commits, hooks y lint-staged                                              |
| `arch-audit`                | Auditar todos los dominios y reportar desvíos arquitectónicos                         |
| `interfaces-to-application` | Migrar `Domain/*.interfaces.ts` → `Application/[domain].types.ts`                     |
| `domain-consolidation`      | Extraer lógica DI de `index.ts` a `[domain].di.ts`; dejar `index.ts` como barrel puro |
| `requirements-analyst`      | Usada por `@analyst` — template de `01_requirements.md`                               |
| `dev-logger`                | Usada por `@back`/`@front` — template de `02_dev_log.md`                              |
| `qa-runner`                 | Usada por `@qa` — secuencia de validación + `03_qa_report.md`                         |
| `code-reviewer`             | Usada por `@reviewer` — checklist 12 ítems + `04_review_log.md`                       |

## Instrucciones Específicas

- Backend → `.github/instructions/server.instructions.md`
- Frontend → `.github/instructions/app.instructions.md`
- Memoria → `.github/instructions/memory.instructions.md`

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

<!-- SPECKIT END -->
