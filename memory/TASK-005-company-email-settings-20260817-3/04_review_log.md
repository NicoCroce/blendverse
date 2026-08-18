---
task_id: 'TASK-005-company-email-settings-20260817-3'
agent: 'Reviewer_Agent'
status: 'REJECTED'
attempts: 1
date: '2026-08-17'
---

# Revisión de Estándares — Company Email Settings

## Resultado: ❌ REJECTED

---

## Checklist

| #   | Criterio                                               | Nivel | Estado | Detalle                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------ | ----- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Domain no importa Infrastructure/Application           | 🔴    | ✅     | `CompanyEmailSettings/Domain` permanece independiente.                                                                                                                                                                        |
| 2   | Use Cases usan interfaz abstracta del dominio correcto | 🔴    | ❌     | `Disclaimer` importa/injecta `OwnersyssRepository` y `UserRepository` desde otros dominios en `GetDisclaimerText.usecase.ts` y `SignDisclaimer.usecase.ts`; la regla exige casos de uso cross-domain, no repositorios ajenos. |
| 3   | Archivos globales actualizados                         | 🔴    | ✅     | `domains/register.ts` y `Infrastructure/Routes/Router.ts` registran el dominio.                                                                                                                                               |
| 4   | Sin `any` explícito                                    | 🔴    | ✅     | No se encontró `any` explícito en el código revisado.                                                                                                                                                                         |
| 5   | Tipos de retorno explícitos                            | 🟡    | ⚠️     | Hay métodos públicos de service/entity sin retorno explícito; no bloquea.                                                                                                                                                     |
| 6   | Solo interfaces compartidas entre capas                | 🔴    | ✅     | Los puertos del nuevo dominio se consumen como tipos; las clases cross-domain usadas son casos de uso/política.                                                                                                               |
| 7   | Zod en controller/formulario                           | 🔴    | ✅     | Procedures y formulario usan schemas Zod.                                                                                                                                                                                     |
| 8   | Filtro `ownerId` en queries                            | 🔴    | ❌     | `DisclaimerRepositoryImplementation.ts` consulta `UsuariosSegmentosModel` sin scope por owner en `segmentIds` y `withoutSegments`; el filtro posterior de usuarios no sustituye el tenant-scope de esas queries.              |
| 9   | Sin `console.log` en producción                        | 🟡    | ⚠️     | `SendReminders.usecase.ts:80` mantiene `console.log(error)`; no bloquea.                                                                                                                                                      |
| 10  | Convenciones de nomenclatura                           | 🔴    | ✅     | Estructura, nombres de dominio, DI, rutas y componentes conformes.                                                                                                                                                            |
| 11  | Entidad con `static create()` etc.                     | 🟡    | ✅     | La entidad nueva implementa `create`, `values` y `toJSON`.                                                                                                                                                                    |
| 12  | Pantallas con error/loading/empty                      | 🔴    | ✅     | La pantalla nueva cubre error, loading, snapshot ausente y contenido.                                                                                                                                                         |
| 13  | Sin texto inline para estados                          | 🔴    | ✅     | Se usan `EmptyScreenError`, `EmptyState` y skeleton de dominio; no hay fallback de carga suelto.                                                                                                                              |
| 14  | Botones con `isLoading`                                | 🔴    | ✅     | Guardado, publicación y aceptación usan `isLoading`; cancelar usa `disabled` correctamente.                                                                                                                                   |
| 15  | Empty states usan `EmptyState`                         | 🟡    | ✅     | Destinatarios vacíos y snapshot ausente usan el wrapper del proyecto.                                                                                                                                                         |
| 16  | Skeletons en `Components/`                             | 🟡    | ✅     | `CompanyEmailSettingsSkeleton.tsx` está en `Components/`.                                                                                                                                                                     |
| 17  | Barrels exportan correctamente                         | 🟡    | ✅     | El barrel público del server solo expone rutas y el módulo frontend exporta sus piezas.                                                                                                                                       |

---

## Feedback

### Ítem 2 — Aislamiento de casos de uso y puertos

**Problema:** Los casos de uso de `Disclaimer` acceden directamente a repositorios de otros dominios (`OwnersyssRepository` y `UserRepository`). Esto contradice la regla de aislamiento: un consumidor debe invocar un caso de uso expuesto por el dominio dueño mediante DI.

**Archivos afectados:**

- `packages/server/src/domains/Disclaimer/Application/UseCases/GetDisclaimerText.usecase.ts`
- `packages/server/src/domains/Disclaimer/Application/UseCases/SignDisclaimer.usecase.ts`

**Solución esperada:** Inyectar los casos de uso públicos del dominio dueño (`GetOwnersys`/la operación de empresa correspondiente y la operación de usuario correspondiente) y registrar sus claves en el DI propietario. `Disclaimer` debe conservar únicamente su propio `DisclaimerRepository` como puerto de persistencia.

```typescript
constructor(
  private readonly disclaimerRepository: DisclaimerRepository,
  private readonly _getCurrentTermsVersion: GetCurrentTermsVersion,
  private readonly _getUser: GetUser,
) {}
```

### Ítem 8 — Tenant isolation en consultas de Disclaimer

**Problema:** `UsuariosSegmentosModel.findAll()` se ejecuta sin restricción derivada de `requestContext.values.ownerId` en las ramas `segmentIds` y `withoutSegments` de `getEmployeesByCompany`. El filtro posterior de `UserModel` evita parte de la exposición, pero no cumple la regla de que toda query esté tenant-scoped y permite que relaciones de otro tenant influyan en el resultado.

**Archivo afectado:** `packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts` — líneas 116–149.

**Solución esperada:** Resolver los IDs mediante un join/filtro por usuarios del owner actual, o delegar la selección al caso de uso/repositorio dueño de Segmentos, manteniendo `ownerId` proveniente exclusivamente del `RequestContext`.

```typescript
// El owner debe formar parte de la consulta de la relación, no solo de la query final.
include: [
  { model: UserModel, required: true, where: { id_propietario: ownerId } },
];
```

### Contexto obligatorio ausente

No existe `memory/TASK-005-company-email-settings-20260817-3/02_dev_log.md`. Por lo tanto no fue posible verificar el `affected_files` ni las decisiones técnicas declaradas por el agente de implementación. Debe regenerarse antes de una nueva revisión.

---

## Deuda Técnica

- Reemplazar `console.log(error)` por el logger estructurado del proyecto en `SendReminders.usecase.ts`.
- Agregar tipos de retorno explícitos a los métodos públicos señalados por el ítem 5.
- Verificar que el registro del task actual y su cadena de agentes se reflejen en `memory/history_log.json` antes del cierre.
