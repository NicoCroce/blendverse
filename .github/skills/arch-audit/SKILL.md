---
name: arch-audit
description: Auditoría de arquitectura del proyecto. Escanea todos los dominios del server y del frontend y produce un reporte tabular de desvíos respecto a las convenciones DDD/Hexagonal del proyecto. Usar antes de ejecutar cualquier skill de corrección (interfaces-to-application, domain-consolidation) o cuando el usuario pida "auditar arquitectura", "ver qué está mal" o como primer paso del agente @blendverse.arch-fixer.
---

# Arch Audit

## ⚠️ CONTROL DE CONTEXTO

- **MODO READ-ONLY:** Esta skill solo lee y reporta. No modifica ningún archivo.
- **NO uses `@workspace` globalmente.** Explorá carpeta por carpeta para evitar saturar el contexto.
- Trabajá siempre desde la raíz del monorepo.

## Herramientas Requeridas

- `read/readFile` — Leer archivos específicos
- `search/fileSearch` — Buscar archivos por patrón
- `search/searchInFiles` — Buscar contenido dentro de archivos
- `execute/runInTerminal` — Listar directorios con `ls` cuando sea necesario

---

## Protocolo de Auditoría

### Paso 1 — Listar dominios del server

```bash
ls packages/server/src/domains/
```

Para cada carpeta encontrada, verificar la presencia de los siguientes ítems:

| Chequeo                                     | Comando / método                                                      |
| ------------------------------------------- | --------------------------------------------------------------------- |
| ¿Tiene `Domain/` con `.repository.ts`?      | `ls packages/server/src/domains/[Domain]/Domain/`                     |
| ¿Tiene `Application/` con `.service.ts`?    | `ls packages/server/src/domains/[Domain]/Application/`                |
| ¿Tiene `Application/[domain].types.ts`?     | buscar archivo `.types.ts` en `Application/`                          |
| ¿Tiene archivos de tipos en `Domain/`?      | buscar tipos legacy en `Domain/` ← **DESVÍO**                         |
| ¿Tiene `[domain].di.ts` en raíz?            | buscar `*.di.ts` en la raíz del dominio ← **CANDIDATO CONSOLIDACIÓN** |
| ¿Está registrado en `register.ts`?          | leer `packages/server/src/domains/register.ts`                        |
| ¿Tiene `Infrastructure/Database/` completa? | `ls packages/server/src/domains/[Domain]/Infrastructure/Database/`    |

### Paso 2 — Verificar `Application/Utils/` global del server

Leer `packages/server/src/Application/Utils/`. Si contiene carpetas como `Email/` o archivos como `LoadImages.ts`, reportarlo como **DESVÍO B4** (infraestructura ubicada en capa Application).

### Paso 3 — Listar dominios del frontend

```bash
ls packages/app/src/Domains/
```

Para cada dominio, verificar:

| Chequeo                                                      | Señal de desvío                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| ¿`[Entity].entity.ts` importa `IEntity` manualmente?         | Import desde `@server/domains/...` sin usar `inferRouterOutputs` ← **DESVÍO D1** |
| ¿Tiene carpeta `Hooks/`?                                     | Ausencia es desvío si hay más de 1 página                                        |
| ¿`[Domain].routes.tsx` usa extensión `.ts` en vez de `.tsx`? | Inconsistencia de extensión                                                      |

### Paso 4 — Detectar desvíos de naming

Buscar en `packages/server/src/domains/`:

- Carpetas con nombre duplicado/typo (ej. `Ownersyss` con doble `s`)
- Dominios que tienen solo `Infrastructure/` sin `Domain/` ni `Application/` → stubs incompletos

Buscar en `packages/app/src/`:

- Carpeta `Application/` (typo, falta la `p`)

---

## Formato del Reporte

Al finalizar los 4 pasos, presentar el reporte en el siguiente formato:

```
## 🔍 Reporte de Auditoría Arquitectónica
Fecha: [fecha]

### Server — packages/server/src/domains/

| Dominio     | Tipos legacy en Domain | *.di.ts en raíz | Registrado | Infrastructure completa | Estado         |
|-------------|--------------------------|-----------------|------------|------------------------|----------------|
| Auth        | ✗ DESVÍO (B1)            | ✓ CONSOLIDAR    | ✓          | ✓                      | ⚠️  2 desvíos  |
| Users       | ✗ DESVÍO (B1)            | ✓ CONSOLIDAR    | ✓          | ✓                      | ⚠️  2 desvíos  |
| Companies   | —                        | —               | ✗ DESVÍO   | ✗ INCOMPLETO           | 🔴 STUB        |
| ...         |                          |                 |            |                        |                |

### Server — Capa Application global

| Archivo/Carpeta                    | Problema                          | ID    |
|------------------------------------|-----------------------------------|-------|
| Application/Utils/Email/           | Infraestructura en capa Application | B4  |
| Application/Utils/LoadImages.ts    | Infraestructura en capa Application | B4  |

### Frontend — packages/app/src/Domains/

| Dominio | Entity usa inferRouterOutputs | Hooks/ presente | Extensión routes |
|---------|------------------------------|-----------------|-----------------|
| Auth    | ✗ DESVÍO (D1)                | ✓               | .tsx ✓           |
| Users   | ✗ DESVÍO (D1)                | ✗ DESVÍO        | .ts ⚠️           |

### Naming y Stubs

| Elemento                          | Problema                        | Acción sugerida (manual) |
|-----------------------------------|---------------------------------|--------------------------|
| packages/server/src/domains/Ownersyss/ | Typo: doble 's'            | Renombrar → Owners/      |
| packages/app/src/Application/      | Typo: falta 'p'                 | Renombrar → Application/ |
| domains/Companies/                | Stub sin Domain/Application     | Completar o eliminar     |
| domains/Profiles/                 | Stub sin Domain/Application     | Completar o eliminar     |

### Resumen

- 🔴 Desvíos críticos automáticamente corregibles (B1, B3, D1): N dominios
- 🟡 Desvíos de infraestructura (B4): M archivos
- ⚫ Desvíos manuales (naming, stubs): K elementos
```

---

## Salida al Agente @blendverse.arch-fixer

Al finalizar el reporte, listar explícitamente los dominios **aptos para corrección automática** (tienen tipos legacy en `Domain/` y/o `*.di.ts` en raíz) en este formato para que el agente los procese:

```
DOMINIOS APTOS PARA CORRECCIÓN:
- Auth (B1: interfaces.ts → types.ts) (B3: app.ts → consolidar)
- Users (B1) (B3)
- Themes (B3)
...
```
