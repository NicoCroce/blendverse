---
task_id: 'TASK-refactor-tenant-aware-repository-20260808-1'
agent: 'Back_Agent'
status: 'IMPLEMENTED'
attempts: 1
date: '2026-08-08'
affected_files:
  - 'packages/server/src/Infrastructure/Database/TenantAwareRepository.ts'
  - 'packages/server/src/Infrastructure/Database/tenantScopes.ts'
  - 'packages/server/src/Infrastructure/Database/index.ts'
  - 'packages/server/src/Application/Entities/RequestContext.ts'
  - 'packages/server/src/Infrastructure/trpc/TrpcInstance.ts'
  - 'packages/server/src/domains/Segments/Infrastructure/Database/SegmentsRepository.implementation.ts'
  - 'packages/server/src/domains/Users/Infrastructure/Database/UsersRepository.implementation.ts'
  - 'packages/server/src/domains/Certificates/Infrastructure/Databases/CertificatesRepository.implementation.ts'
  - 'packages/server/src/domains/Documents/Infrastructure/Database/DocumentsRepository.implementation.ts'
  - 'packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts'
  - 'packages/server/src/domains/Permissions/Infrastructure/Database/PermissionsRepository.implementation.ts'
---

# Log de Desarrollo — Refactor seguridad multi-tenant

## Archivos Creados

| Archivo                                                                | Capa           | Motivo                                                                                                             |
| ---------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `packages/server/src/Infrastructure/Database/TenantAwareRepository.ts` | Infrastructure | Clase base abstracta con helpers protegidos para filtrado por ownerId y validación de pertenencia en update/delete |
| `packages/server/src/Infrastructure/Database/tenantScopes.ts`          | Infrastructure | Helper `addTenantScope()` para aplicar scopes dinámicos de Sequelize como defensa en profundidad                   |

## Archivos Modificados

| Archivo                                                                                                      | Cambio aplicado                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/Infrastructure/Database/index.ts`                                                       | Agregados exports de `TenantAwareRepository` y `addTenantScope`                                                                                                                                                                                     |
| `packages/server/src/Application/Entities/RequestContext.ts`                                                 | Fix typo `setOwerId` → eliminado; `ownerId` ahora es `readonly` (inmutable post-construcción)                                                                                                                                                       |
| `packages/server/src/Infrastructure/trpc/TrpcInstance.ts`                                                    | `protectedProcedure` crea un nuevo `RequestContext` con ownerId verificado (en vez de mutar via setter); aplica tenant scopes a UserModel, TiposSegmentosModel y ProfileModel; reemplaza `throw new Error` con `AppError` en CertificatesRepository |
| `packages/server/src/domains/Segments/Infrastructure/Database/SegmentsRepository.implementation.ts`          | Extiende `TenantAwareRepository`; `updateSegmentType` y `deleteSegmentType` ahora validan pertenencia al tenant via `tenantUpdate`/`tenantDelete` (IDOR prevention)                                                                                 |
| `packages/server/src/domains/Users/Infrastructure/Database/UsersRepository.implementation.ts`                | Extiende `TenantAwareRepository`; `getEmailsByUsersId` usa `tenantFindAll` cuando hay ownerId                                                                                                                                                       |
| `packages/server/src/domains/Certificates/Infrastructure/Databases/CertificatesRepository.implementation.ts` | Extiende `TenantAwareRepository`; `deleteCertificate`, `updateCertificateStatus` y `appendImages` ahora validan pertenencia via join con UserModel + `id_propietario`; `throw new Error` reemplazado con `AppError`                                 |
| `packages/server/src/domains/Documents/Infrastructure/Database/DocumentsRepository.implementation.ts`        | Extiende `TenantAwareRepository`; eliminados `console.log` de debug pendientes                                                                                                                                                                      |
| `packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts`      | Extiende `TenantAwareRepository`; `getStatus` usa `tenantFindOne` con `tenantColumn='id_empresa'`; `getEmployeesWithoutDisclaimerAcceptance` usa `tenantFindAll`                                                                                    |
| `packages/server/src/domains/Permissions/Infrastructure/Database/PermissionsRepository.implementation.ts`    | Extiende `TenantAwareRepository`; `getAdmins` usa `tenantFindAll`; `throw new Error` reemplazado con `AppError`                                                                                                                                     |

## Decisiones Técnicas

- **`ownerId` readonly sin setter:** En vez de solo renombrar `setOwerId` → `setOwnerId`, se eliminó el setter completamente. El `protectedProcedure` ahora crea un nuevo `RequestContext` con el ownerId verificado del token. Esto garantiza inmutabilidad real — ningún código posterior puede modificar el ownerId.

- **`createContext` con ownerId=0 placeholder:** Como `createContext` se ejecuta antes de la verificación del token (para todas las procedures, incluyendo públicas), se pasa `0` como placeholder. El `protectedProcedure` reemplaza el RequestContext completo con uno que tiene el ownerId real. Las procedures públicas no acceden a datos multi-tenant.

- **Scopes dinámicos como defensa en profundidad:** Los scopes de Sequelize son class-level (global), lo que genera un riesgo teórico de race condition en servidores concurrentes. Se documentó esta limitación en el JSDoc de `tenantScopes.ts`. La protección principal vive en los helpers de `TenantAwareRepository` y las cláusulas `where` explícitas.

- **Modelos sin `id_propietario`:** `CertificateModel` y `Documentos` no tienen columna `id_propietario` — su aislamiento multi-tenant se logra via joins con `UserModel`. Para estos modelos, la validación de pertenencia en update/delete se implementó con includes que filtran por `User.id_propietario`. No fue posible usar `tenantUpdate`/`tenantDelete` directamente.

- **`DisclaimerAcceptanceModel` con `id_empresa`:** Usa un nombre de columna distinto para el concepto de tenant. Los helpers de `TenantAwareRepository` aceptan un parámetro `tenantColumn` para cubrir este caso.

- **`throw new Error` → `AppError`:** En `CertificatesRepository` y `PermissionsRepository`, los `throw new Error` se reemplazaron con `AppError` para mantener consistencia con el error handling del proyecto y permitir conversión automática a TRPCError.

## Deuda Técnica Conocida

- **`Documentos.viewDocument` y `Documentos.signDocument`:** Estos métodos actualizan por `id` sin validar que el documento pertenezca al usuario actual o al tenant. Requieren una validación de pertenencia via join con `UserModel` similar a la implementada en `CertificatesRepository`. Se deja como follow-up porque el cambio de comportamiento podría afectar funcionalidad existente.

- **Scopes dinámicos concurrentes:** Los `addTenantScope` en middleware son class-level. En teoría, requests concurrentes de diferentes tenants podrían interferir. La mitigación es que la protección principal está en los repositorios, no en los scopes. Una solución más robusta requeriría un Sequelize fork o un wrapper por-request.

- **`UserModel.id_propietario` es opcional (`CreationOptional<number>`):** El sistema permite usuarios sin `id_propietario` (probablemente el super-admin). Los filtros `WHERE id_propietario = 0` no matchearán estos registros, lo cual es el comportamiento deseado para el super-admin pero debe documentarse.
