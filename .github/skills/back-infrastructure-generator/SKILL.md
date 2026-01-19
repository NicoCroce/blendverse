---
name: back-infrastructure-generator
description: Genera la capa de Infrastructure para un nuevo módulo en el backend.
---

# Generador de Infrastructure

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No utilices el índice global de `@workspace`.
- **REFERENCIAS PERMITIDAS:** Solo puedes leer archivos dentro de `.github/skills/back-infrastructure-generator/templates/` y `packages/server/src/[NombreDominio]/**/*` referido al dominio.
- **PROHIBIDO:** No escanees carpetas de otros dominios en `packages/server/src/...` para evitar el exceso de referencias.

## Cuándo se utiliza esta Skill

Utiliza esta Skill cuando se solicite `crear un nueva nueva infraestructura para {{DomainName}}`.

## Protocolo de Activación

Debes seguir este orden estrictamente:

1. **Input Inicial:** Debes leer y listar todos los métodos expuestos en `*.service.ts` que corresponde al dominio y también listar los métodos que implementará en el repositorio, donde deberá leer los datos de `packages/server/src/[NombreDominio]/Domain/*.repository.ts` pra saber qué implementar.

2. **Generación en Lote:** Una vez confirmados todos los métodos, debes mostrar cada controller que crearás y la implementación del repositorio.

3. **Análisis de Contexto Local:** Utiliza los archivos `.template.txt` en la carpeta local de esta skill como única base de estilo. Ignora el código real del proyecto hasta el momento de la escritura.

## Restricción de Scope:

- Solo puedes crear/modificar archivos dentro de: `packages/server/src/domains/[NombreDominio]/Infrastructure/`.
- **No toques Services ni Domain.**
- **No debes crear el modelo, las relaciones de las tablas ni tampoco debes utilizar sequelize.**
- Debes crear los archivos necesarios dentro de `packages/server/src/domains/[NombreDominio]/Infrastructure/`
- Solo deja `throw new Error('Method not implemented.');` en cada método del `repository.implementation.ts`.
- Debes agregar todas las referencias necesarias en `packages/server/src/domains/register.ts`.
- Debes agregar todas las referencias necesarias en `packages/server/src/Infrastructure/Routes/Router.ts`.

## Estructura de Archivos a Generar y Mapeo de Templates

**Implementación:** Recuerda crear los archivos de Infrastructure secuencialmente.

### Capa de Infraestructura (Infrastructure)

**Ruta:** `packages/server/src/domains/{{DomainName}}/Infrastructure/Controllers/`

| Archivo a Crear                 | Template a Usar                              | Descripción                   |
| ------------------------------- | -------------------------------------------- | ----------------------------- |
| `{{EntityName}}s.controller.ts` | `templates/Entities.controller.template.txt` | Controlador HTTP              |
| `index.ts`                      | `templates/controllers.index.template.txt`   | Barrel exports de Controllers |

**Ruta:** `packages/server/src/domains/{{DomainName}}/Infrastructure/Database/`

| Archivo a Crear                               | Template a Usar                                            | Descripción                    |
| --------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| `{{EntityName}}sRepository.implementation.ts` | `templates/EntitiesRepository.implementation.template.txt` | Implementación del repositorio |
| `index.ts`                                    | `templates/database.index.template.txt`                    | Barrel exports de Database     |

**Ruta:** `packages/server/src/domains/{{DomainName}}/Infrastructure/Routes/`

| Archivo a Crear           | Template a Usar                       | Descripción                  |
| ------------------------- | ------------------------------------- | ---------------------------- |
| `Router.ts`               | `templates/EntityRouter.template.txt` | Router principal del dominio |
| `{{EntityName}}Routes.ts` | `templates/EntityRoutes.template.txt` | Definición de rutas          |
| `index.ts`                | `templates/routes.index.template.txt` | Barrel exports de Routes     |

**Ruta:** `packages/server/src/domains/{{DomainName}}/Infrastructure/`

| Archivo a Crear | Template a Usar                               | Descripción                      |
| --------------- | --------------------------------------------- | -------------------------------- |
| `index.ts`      | `templates/infrastructure.index.template.txt` | Barrel exports de Infrastructure |

### 4. Archivo Principal del Dominio

**Ruta:** `packages/server/src/domains/{{DomainName}}/`

| Archivo a Crear         | Template a Usar                            | Descripción                              |
| ----------------------- | ------------------------------------------ | ---------------------------------------- |
| `{{entityName}}.app.ts` | `templates/entity.domain.app.template.txt` | Inicialización y exportación del dominio |
| `index.ts`              | Exporta desde `{{entityName}}.app.ts`      | Entry point del dominio                  |

## Reglas de Estilo y Ejecución

- **Controladroes:** Crea un controlador para cada método del servicio del {{DomainName}}.
- **Implementación del repositorio:** Dentro de `Domain` encontrarás el \*.repository relacionado con {{DomainName}}. Deberás implementar cada método.
-

## Registro Global (Paso Final)

Después de generar todos los archivos de la infraestructura, **DEBES** registrar el dominio en los archivos globales:

### 1. Registrar en `packages/server/src/domains/register.ts`

Añade la importación y exportación del nuevo dominio:

```typescript
export * from './{{DomainName}}';
```

### 2. Registrar en `packages/server/src/Infrastructure/Routes/Router.ts`

Añade el router del nuevo dominio:

```typescript
import {{entityName}}Router from '../../domains/{{DomainName}}/Infrastructure/Routes/Router';

// Dentro de la función de registro de rutas:
router.use('/api/{{entityNameLower}}s', {{entityName}}Router);
```

### 3. Validación:

Al terminar, confirma que has registrado el nuevo dominio en `packages/server/src/domains/register.ts` y `packages/server/src/Infrastructure/Routes/Router.ts`.

## Estructura Completa del Dominio

```
packages/server/src/domains/{{DomainName}}/
└── Infrastructure/
    ├── index.ts
    ├── Controllers/
    │   ├── index.ts
    │   └── {{EntityName}}s.controller.ts
    ├── Database/
    │   ├── index.ts
    │   └── {{EntityName}}sRepository.implementation.ts
    └── Routes/
        ├── index.ts
        ├── Router.ts
        └── {{EntityName}}Routes.ts
```
