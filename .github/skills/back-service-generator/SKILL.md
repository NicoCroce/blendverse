---
name: back-service-generator
description: Genera la capa de Application para un nuevo módulo en el backend.
---

# Generador de Dominio DDD

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No utilices el índice global de `@workspace`.
- **REFERENCIAS PERMITIDAS:** Solo puedes leer archivos dentro de `.github/skills/back-ddd/templates/`.
- **PROHIBIDO:** No escanees carpetas de otros dominios en `packages/server/src/...` para evitar el exceso de referencias.

## Cuándo se utiliza esta Skill

Utiliza esta Skill cuando se solicite `crear un nuevo servicio para {{DomainName}}`.

## Protocolo de Activación

Debes seguir este orden estrictamente:

1. **Input Inicial:** Debes leer y listar todos los métodos expuestos en `*.repository.ts` que corresponde al dominio.

2. **Generación en Lote:** Una vez confirmados todos los métodos, debes mostrar cada caso de uso que crearás.

3. **Análisis de Contexto Local:** Utiliza los archivos `.template.txt` en la carpeta local de esta skill como única base de estilo. Ignora el código real del proyecto hasta el momento de la escritura.

## Restricción de Scope:

- Solo puedes crear/modificar archivos dentro de: `packages/server/src/domains/[NombreDominio]/Application/`.
- **No toques Infrastructure ni Domain.**
- **No debes crear el modelo, las relaciones de las tablas ni tampoco debes utilizar sequelize.**
- Debes crear los archivos necesarios dentro de `packages/server/src/domains/[NombreDominio]/Application/`
- Solo debes leer los archivos dentro de `Domain` correspondiente al dominio establecido, es decir dentro de `packages/server/src/domains/[NombreDominio]/Application/`

## Estructura de Archivos a Generar y Mapeo de Templates

**Implementación:** Recuerda crear los archivos de Application, es decir .

### Capa de Aplicación (Application)

**Ruta:** `packages/server/src/domains/{{DomainName}}/Application/`

| Archivo a Crear              | Template a Usar                            | Descripción                   |
| ---------------------------- | ------------------------------------------ | ----------------------------- |
| `{{EntityName}}s.service.ts` | `templates/Entities.service.template.txt`  | Servicio de aplicación        |
| `index.ts`                   | `templates/application.index.template.txt` | Barrel exports de Application |

**Subcarpeta:** `packages/server/src/domains/{{DomainName}}/Domain/UseCases/`

| Archivo a Crear                 | Template a Usar                              | Descripción                 |
| ------------------------------- | -------------------------------------------- | --------------------------- |
| `Get{{EntityName}}s.usecase.ts` | `templates/GetEntities.usecase.template.txt` | Obtener todas las entidades |
| `index.ts`                      | `templates/usecases.index.template.txt`      | Barrel exports de UseCases  |

## Reglas de Estilo y Ejecución

- **Casos de Uso:** Crea un caso de uso para cada método del repositorio (Get, GetAll, Register, Update, Delete).
- **Registra los casos de uso en**: Crea un caso de uso para cada método del repositorio (Get, GetAll, Register, Update, Delete), los que sean necesarios.
- **En los casos de uso** si no tienes en claro lo que debes hacer, deja un mensaje diciendo `TODO: iumplementar lógica`.

### 3. Validación:

Al terminar, confirma que has creado todos los archivos dentro de la carpeta UseCases de Application y que se vincularon expusieron los casos de uso dentro del \*.service.

## Estructura Completa del Dominio

```
packages/server/src/domains/{{DomainName}}/
└── Application/
   ├── index.ts
   ├── {{EntityName}}s.service.ts
   └── UseCases/
       ├── index.ts
       ├── Get{{EntityName}}s.usecase.ts
       └── ...
```
