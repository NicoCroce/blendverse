---
name: usecases-migration
description: Mueve la carpeta `UseCases` que se encuentra en `packages/server/src/domains/[domain]/Domain/UseCases` a `packages/server/src/domains/[domain]/Application/UseCases`
---

# Mueve la carpeta UseCases

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No utilices el índice global de `@workspace` solo el contexto de la carpeta del dominio que se adjunta y se solicita.
- **REFERENCIAS PERMITIDAS:** Solo puedes leer archivos del contexto adjuntado.
- **PROHIBIDO:** No escanees carpetas de otros dominios para evitar el exceso de referencias.
- **NO DEBEN MOVERSE LOS CASOS DE USO DIRECTAMENTE A LA CARPETA Application. Siempre deben mover a la carpeta `packages/server/src/domains/[domain]/Application/UseCases`**
- **Siempre debes trabajar un dominio a la vez y verificar que los imports son correctos**.

## Herramientas Requeridas

Para ejecutar esta skill correctamente necesitas:

- `read/readFile`: Para leer archivos index.ts, service.ts, app.ts y usecase.ts
- `terminal/runCommand`: Para mover carpetas con el comando `mv`
- `edit/editFiles`: Para actualizar imports en múltiples archivos
- `diagnostics/getErrors`: Para verificar que no haya errores después de cada migración

## Cuándo se utiliza esta Skill

Utiliza esta Skill cuando se solicite `mover UseCase en el dominio adjunto`.

## Protocolo de Activación

Debes seguir este orden estrictamente:

0. **Verificación Previa (si es un listado de dominios):**
   - Verifica que dentro de la carpeta `[domain]/Domain/UseCases` existan casos de uso.
   - Si existen, lista los dominios que requieren migración.
   - Solicita confirmación del usuario antes de continuar.

1. **Leer Contexto del Dominio:**
   - Leer `Domain/index.ts` para ver exports de UseCases
   - Leer `Application/index.ts` para ver estructura actual
   - Leer `Application/*.service.ts` para identificar imports de UseCases
   - Leer `[domain].di.ts` para identificar imports de UseCases
   - Listar archivos en `Domain/UseCases/` para conocer todos los casos de uso

2. **Mover la carpeta UseCases:**
   - Usar comando `mv` para mover desde `Domain/UseCases` a `Application/UseCases`
   - Verificar que el movimiento fue exitoso

3. **Actualizar Domain/index.ts:**
   - Remover la línea `export * from './UseCases';`
   - Mantener todos los demás exports intactos

4. **Actualizar Application/index.ts:**
   - Agregar la línea `export * from './UseCases';`
   - Mantener todos los demás exports intactos

5. **Actualizar \*.service.ts en Application:**
   - Cambiar imports de UseCases desde `../Domain` a `./UseCases`
   - Mantener imports de entidades e interfaces desde `../Domain`
   - Verificar que todos los casos de uso estén correctamente importados

6. **Actualizar archivos \*.usecase.ts en Application/UseCases:**
   - Cambiar todos los imports de entidades desde `../../Domain/`
   - Cambiar todos los imports de interfaces desde `../../Domain/`
   - Cambiar todos los imports de repositorios desde `../../Domain/`
   - Mantener imports de `@server/Application` sin cambios

7. **Actualizar [domain].di.ts:**
   - Cambiar imports de UseCases desde `./Domain` a `./Application`
   - Mantener imports de Infrastructure sin cambios

8. **Verificación Final:**
   - Ejecutar `diagnostics/getErrors` en la carpeta del dominio
   - Si hay errores, corregirlos antes de continuar con el siguiente dominio
   - Reportar éxito de la migración al usuario
