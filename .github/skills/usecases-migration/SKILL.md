---
name: usecases-migration
description: Mueve la carpeta `UseCases` que se encuentra en `packages/server/src/domains/[domain]/Domain/UseCases` a `packages/server/src/domains/[domain]/Application/UseCases`
---

# Mueve la carpeta UseCases

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No utilices el índice global de `@workspace` solo el contexto de la carpeta del dominio que se adjunta.
- **REFERENCIAS PERMITIDAS:** Solo puedes leer archivos del contexto adjuntado.
- **PROHIBIDO:** No escanees carpetas de otros dominios para evitar el exceso de referencias.
- **NO DEBEN MOVERSE LOS CASOS DE USO DIRECTAMENTE A LA CARPETA Application. Siempre deben mover a la carpeta `packages/server/src/domains/[domain]/Application/UseCases`**

## Cuándo se utiliza esta Skill

Utiliza esta Skill cuando se solicite `mover UseCase en el dominio adjunto`.

## Protocolo de Activación

Debes seguir este orden estrictamente:

1. **Mover la carpeta UseCases a un nivel arriba**, saliendo de `Domain` y pegándola en `Application` sin salir del dominio adjunto.
2. **Actuilar index.ts**, correxión de los imports.
3. **Actualizar imports** en \*.service.ts de la carpeta `Application` verificar que los casos de uso no se llamen desde la carpeta `Domain`.
4. **Actualizar imports** en \*.usecase.ts de la carpeta `UseCase` verificar que las interfaces y entidades se importen desde `Domain`.
5. **Actualizar imports** en \[domain].app.ts para qeu los casos de uso coincidan.
