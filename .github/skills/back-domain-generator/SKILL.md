---
name: back-domain-generator
description: Genera la capa de Dominio (DDD) para un nuevo módulo en el backend.
---

# Generador de Dominio DDD

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No utilices el índice global de `@workspace`.
- **REFERENCIAS PERMITIDAS:** Solo puedes leer archivos dentro de `.github/skills/back-domain-generator/templates/`.
- **PROHIBIDO:** No escanees carpetas de otros dominios en `packages/server/src/...` para evitar el exceso de referencias.

## Cuándo se utiliza esta Skill

Utiliza esta Skill cuando se solicite `crear un nuevo dominio`.

## Protocolo de Activación

Debes seguir este orden estrictamente:

1. **Input Inicial:** Solicita al usuario un "Brief de Dominio" que incluya:

   - Nombre del Dominio.
   - Definición de la Entidad (Atributos y tipos).
   - Interfaz del Repositorio (Listado de métodos).

2. **Generación en Lote:** Una vez recibido el Brief, procede a generar la estructura completa de archivos (Domain) en una sola respuesta para optimizar el contexto.

3. **Análisis de Contexto Local:** Utiliza los archivos `.template.txt` en la carpeta local de esta skill como única base de estilo. Ignora el código real del proyecto hasta el momento de la escritura.

## Restricción de Scope:

- Solo puedes crear/modificar archivos dentro de: `packages/server/src/domains/[NombreDominio]/Domain/`.
- **No toques Infrastructure ni Application.**
- **No debes crear el modelo, las relaciones de las tablas ni tampoco debes utilizar sequelize.**

## Estructura de Archivos a Generar y Mapeo de Templates

**Implementación:** Recuerda crear solo los archivos de Domain.

### 1. Capa de Dominio (Domain)

**Ruta:** `packages/server/src/domains/{{DomainName}}/Domain/`

| Archivo a Crear                | Template a Usar                           | Descripción                   |
| ------------------------------ | ----------------------------------------- | ----------------------------- |
| `{{EntityName}}.entity.ts`     | `templates/Entity.entity.template.txt`    | Clase principal de la entidad |
| `{{EntityName}}.interfaces.ts` | `templates/EntityInterfaces.template.txt` | Interfaces y DTOs             |
| `{{EntityName}}.repository.ts` | `templates/EntityRepository.template.txt` | Interfaz del repositorio      |
| `index.ts`                     | `templates/domain.index.template.txt`     | Barrel exports del Domain     |

## Reglas de Estilo y Ejecución

**Debes respetar las reglas definidas en el agente y sumar esta**

- **Casos de Uso:** Crea un caso de uso para cada método del repositorio (Get, GetAll, Register, Update, Delete).

### 3. Validación:

Al terminar, confirma que han creado los archivos correspondientes.

## Estructura Completa del Dominio

```
packages/server/src/domains/{{DomainName}}/
└── Domain/
   ├── index.ts
   ├── {{EntityName}}.entity.ts
   ├── {{EntityName}}.interfaces.ts
   └── {{EntityName}}.repository.ts
```

## Ejemplo de Brief de Dominio

El usuario debe proporcionar un brief como este:

```
Nombre del Dominio: Products
Entidad: Product

Atributos:
- id: string
- name: string
- description: string
- price: number
- active: boolean

Métodos del Repositorio:
- getProducts(filters?: IProductFilter): Promise<Product[]>
- getProduct(id: string): Promise<Product | null>
- registerProduct(data: IProductCreate): Promise<Product>
- updateProduct(data: IProductUpdate): Promise<Product>
- deleteProduct(id: string): Promise<boolean>
```
