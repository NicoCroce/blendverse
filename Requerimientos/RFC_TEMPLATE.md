# RFC (Request for Comments) / Technical Design

> **Nota para Spec-kit / Blendverse:**
> Este documento se utiliza como entrada para la fase técnica (`speckit.plan`). Permitirá que herramientas como `@blendverse.back` y `@blendverse.front` entiendan el contexto técnico (patrones DDD, tRPC, Zod) y puedan generar `plan.md`, `data-model.md` y `contracts`.

## 1. Resumen Técnico

- Descripción breve y a alto nivel de cómo se va a implementar el requerimiento funcional (PRD).

## 2. Modelo de Datos (Sequelize v6)

_(Atención: Respetar asociaciones `belongsTo`/`hasMany` y multi-tenant)_

- **Entidad principal**: `NombreEntidad`
  - Atributos clave:
    - `id_propietario` (Obligatorio)
    - `...`
  - Relaciones/Asociaciones con otros dominios.

## 3. Contratos de API (tRPC + Zod)

- **Dominio**: (ej. `Users`, `Empresas`)
- **Queries/Mutations (tRPC)**:
  - `dominio.createAlgunaCosa`: Mutation.
    - Input (Zod): `{ parametro1: z.string(), ... }`
    - Output: `{ success: boolean, data: ... }`

## 4. Arquitectura y Frontend

### 4.1. Backend (Hexagonal / DDD)

- ¿Se creará un nuevo dominio o se ampliará uno existente (`packages/server/src/domains/...`)?
- Casos de uso (Application) a desarrollar.
- Relaciones entre dominios cruzados (Cross-domain relations).

### 4.2. Frontend (React / Vite.js)

- Componentes clave a crear/editar (`packages/app/src/Domains/...`).
- Manejo de estado/caché temporal con TanStack Query y llamadas a tRPC.

## 5. Seguridad, Testing y Consideraciones

- **Filtros de Multi-tenant**: Verificar que las consultas utilicen siempre `requestContext.values.ownerId`.
- **Riesgos Técnicos**: ¿Afecta al rendimiento de alguna query existente? ¿Hay necesidad de migraciones complejas de BDD?
