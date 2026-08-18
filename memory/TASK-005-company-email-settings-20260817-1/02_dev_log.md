---
task_id: 'TASK-005-company-email-settings-20260817-1'
agent: 'Front_Agent'
status: 'IN_PROGRESS'
attempts: 3
date: '2026-08-17'
affected_files:
  - 'packages/server/src/Application/Interfaces/IEmailNotificationPort.ts'
  - 'packages/server/src/Application/Services/SendEmail.service.ts'
  - 'packages/server/src/Infrastructure/utils/Email/InstitutionalEmailNotificationAdapter.ts'
  - 'packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts'
  - 'packages/server/src/domains/CompanyEmailSettings/Infrastructure/Database/CompanyEmailSettingsRepository.implementation.ts'
---

# Log de Desarrollo — Retry backend de Company Email Settings

## Archivos creados

| Archivo                                                                                   | Capa           | Motivo                                                                                                                    |
| ----------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/Application/Interfaces/IEmailNotificationPort.ts`                    | Application    | Puerto para transportar la notificación, código de catálogo y mensaje institucional sin depender de SMTP o del decorator. |
| `packages/server/src/Infrastructure/utils/Email/InstitutionalEmailNotificationAdapter.ts` | Infrastructure | Adapter que compone el mensaje una sola vez inmediatamente antes de delegar en `MailNotificationService.sendOne()`.       |

## Archivos modificados

| Archivo                                                                                                                     | Cambio aplicado                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/server/src/Application/Services/SendEmail.service.ts`                                                             | Eliminó la composición institucional y el acceso directo a `MailNotificationService`; ahora transporta código y mensaje por el puerto, manteniendo `requester_document_manual` sin decoración efectiva. |
| `packages/server/src/domains/Disclaimer/Infrastructure/Database/DisclaimerRepository.implementation.ts`                     | Agregó `id_empresa` del `RequestContext` a los dos `include.where` de aceptaciones, junto con la versión vigente.                                                                                       |
| `packages/server/src/domains/CompanyEmailSettings/Infrastructure/Database/CompanyEmailSettingsRepository.implementation.ts` | Limitó la importación de administradores legacy al branch de creación inicial; resoluciones posteriores conservan exactamente los destinatarios persistidos, incluidos hard deletes.                    |

## Decisiones técnicas

- **Puerto y adapter de email:** `SendEmailService` solo prepara el cuerpo renderizado y pasa `code`/`welcomeMessage` al puerto. El adapter de Infrastructure aplica `applyInstitutionalWelcome` justo antes de `MailNotificationService.sendOne()`.
- **Decoración única:** los adapters existentes de Disclaimer, DailyReport y EmployeeReminders ya componen una vez en el mismo boundary; el adapter nuevo cubre los envíos de `SendEmailService`. `requester_document_manual` queda fuera del conjunto explícito de códigos decorables y los términos legales permanecen como cuerpo posterior al preámbulo.
- **Tenant de aceptaciones:** el filtro de empresa se toma exclusivamente de `requestContext.values.ownerId`, nunca de inputs del cliente.
- **Provisioning lazy:** `created` es la única señal que permite importar admins legacy; no se usa `bulkCreate` en lecturas posteriores para evitar recrear destinatarios eliminados.

## Verificaciones

- `git diff --check` sobre los archivos backend modificados — PASS.
- `pnpm --filter @blendverse/server exec tsc --noEmit` — bloqueado por dos tests existentes que aún instancian `SendEmailService` con la firma anterior de cuatro argumentos; no se modificaron tests por instrucción.
- No se ejecutaron tests, SQL, migraciones ni clientes MySQL.

## Deuda técnica conocida

- Los tests reconciliados del workspace todavía contienen el constructor legacy de `SendEmailService`; deben ser actualizados por el agente de tests si el pipeline requiere TypeScript global sin modificar el alcance de este retry.

# Retry frontend — termsVersion de Disclaimer

## Resultado

La corrección no puede implementarse de forma segura respetando el alcance frontend-only. `DisclaimerForm` actualmente recibe únicamente `onSuccess`, y el contrato tipado de `DisclaimerService.getText` devuelve `string`; no existe en el frontend una versión asociada al texto mostrado.

## Evidencia verificada

- `packages/server/src/domains/Disclaimer/Application/UseCases/GetDisclaimerText.usecase.ts` devuelve solo `currentTerms.content`/texto legacy.
- `packages/server/src/domains/Disclaimer/Infrastructure/Controllers/Disclaimer.controller.ts` expone `getText` sin versión.
- `packages/app/src/Domains/CompanyEmailSettings/` sí expone `currentTerms.version`, pero `companyEmailSettings.get` exige `dashboard-access`; usarlo en `DisclaimerModal` rompería la aceptación para empleados sin ese permiso y no sería una fuente válida general.
- Por lo tanto, agregar `termsVersion` con un valor inventado, `as never` o un DTO manual violaría el contrato y los requisitos de seguridad solicitados.

## Verificaciones

- No se modificó código frontend, backend, tests ni SQL al detectar el contrato insuficiente.
- No se ejecutó SQL ni cliente MySQL.

## Bloqueo

Se alcanzó el tercer intento de Front_Agent sin una fuente frontend-usable que entregue `termsVersion` junto con el texto realmente mostrado. Se requiere exponer esa versión en el contrato de lectura de Disclaimer o proporcionar un endpoint accesible al flujo de aceptación; ambas alternativas implican backend y están fuera de este retry.
