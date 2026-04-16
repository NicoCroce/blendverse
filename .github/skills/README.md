# Skills de Desarrollo para MacroGest Core

Este directorio contiene skills documentadas para ayudar en el desarrollo del proyecto MacroGest Core.

## Skills Disponibles

### 1. back-ddd-generator

**Ubicación:** `back-ddd-generator/SKILL.md`  
**Invocación:** `@back` o `/new-domain-server`  
**Descripción:** Genera un dominio DDD completo en el servidor: entidad, interfaces, repositorio, use cases, servicio, controlador, modelo Sequelize, implementación de repositorio, rutas tRPC y registro DI.

**Temas cubiertos:**

- Templates para todas las capas (Domain, Application, Infrastructure)
- Protocolo de preguntas antes de generar código
- Validación de estructura antes de crear archivos
- Actualización de archivos globales de registro (`register.ts`, `Router.ts`)
- Checklist final de verificación

### 2. front-ddd-generator

**Ubicación:** `front-ddd-generator/SKILL.md`  
**Invocación:** `@front` o `/new-domain-app`  
**Descripción:** Genera un dominio completo en el frontend React/tRPC: entity types, service tRPC, rutas, router, hooks (query + mutation + cache), páginas vacías y actualización de los archivos globales.

**Temas cubiertos:**

- Templates para entity, service, routes, router, hooks y pages
- Protocolo de lectura del dominio server antes de generar
- Actualización de `Routes.tsx` y `MenuAccess.tsx`
- Checklist final de verificación

### 3. cross-domain-relations

**Ubicación:** `cross-domain-relations/SKILL.md`  
**Invocación:** `/cross-domain`  
**Descripción:** Patrones para relacionar datos entre dominios usando casos de uso e inyección de dependencias.

**Temas cubiertos:**

- Relaciones entre dominios respetando DDD
- Patrón de obtener IDs y luego datos completos
- Inyección de casos de uso entre dominios
- Uso de `executeUseCase` para comunicación entre dominios
- Anti-patrones a evitar
- Ejemplos prácticos con Customeruserss, Users y Recipt

### 4. sequelize-associations

**Ubicación:** `sequelize-associations/SKILL.md`  
**Descripción:** Patrones de asociaciones y carga ansiosa (eager loading) en Sequelize v6 para este proyecto. Cómo definir `belongsTo`, `hasMany`, `hasOne`, cómo usarlos en `findAll` con `include`, y cómo tipar los resultados.

**Temas cubiertos:**

- Definición de asociaciones estáticas en modelos
- Eager loading con `include` en queries
- Tipado TypeScript para modelos con asociaciones
- Patterns de uso seguro con multi-tenant (`ownerId`)

### 5. usecases-migration

**Ubicación:** `usecases-migration/SKILL.md`  
**Invocación:** `/migrate-usecases`  
**Descripción:** Mueve la carpeta `UseCases` de `Domain/UseCases` a `Application/UseCases` y actualiza todos los imports afectados.

**Temas cubiertos:**

- Protocolo de verificación previa y activación
- Movimiento de carpetas con `mv`
- Actualización de imports en `index.ts`, `service.ts`, `app.ts` y `usecase.ts`
- Verificación de errores con `diagnostics/getErrors`

### 6. commit-conventions

**Ubicación:** `commit-conventions/SKILL.md`  
**Descripción:** Convenciones de commits, hooks de Husky, lint-staged y formato de mensajes Conventional Commits.

**Temas cubiertos:**

- Husky pre-commit hooks
- Lint-staged configuration
- Conventional Commits format
- ESLint y Prettier automation
- Troubleshooting común
- Workflow completo de commits

## Cómo Usar las Skills

Las skills están diseñadas para ser consultadas cuando necesites:

1. **back-ddd-generator**: Al crear un dominio nuevo en el servidor
2. **front-ddd-generator**: Al crear la capa front de un dominio
3. **cross-domain-relations**: Al necesitar relacionar datos entre dominios
4. **sequelize-associations**: Al definir relaciones entre modelos Sequelize
5. **usecases-migration**: Al refactorizar dominios existentes
6. **commit-conventions**: Antes de hacer commits o cuando falle Husky

## Agregar una Nueva Skill

Para agregar una nueva skill:

1. Crear un directorio en `.github/skills/nombre-skill/`
2. Crear el archivo `SKILL.md` con el siguiente formato:

```markdown
---
name: nombre-skill
description: Descripción breve de la skill
---

# Título de la Skill

## Descripción

...

## Contenido

...
```

3. Actualizar este README con la referencia a la nueva skill
