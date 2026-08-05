---
name: email-notifications
description: 'Trigger: agregar un nuevo email, nuevo mail, caso de envío de correo, template de email, recordatorio. Define el proceso para implementar un nuevo caso de envío de email en GestDoc y exige actualizar docs/email-notifications.md como definition of done.'
license: Apache-2.0
metadata:
  author: 'MacroGest'
  version: '1.0'
---

# Email Notifications — MacroGest Core

## Activation Contract

Usar esta skill cuando se implemente un **nuevo caso de envío de email** (nuevo disparador, nuevo template, nuevo destinatario) o se modifique un envío existente en el server.

## Hard Rules

- La **fuente de verdad** de casos, destinatarios e infraestructura es `docs/email-notifications.md`. Leerla antes de empezar.
- El envío real se hace **siempre** con `MailNotificationService.sendOne()` / `send()` (Nodemailer). `EmailSender.ts` (axios/`EMAIL_HOST`) es **código muerto**: no usarlo.
- El template va en `Infrastructure/utils/Email/EmailsTemplates.ts` con forma `{ subject, body }`. No templates inline en la capa Application.
- Resolver destinatarios solo vía casos de uso (`GetAdmins`, `GetUser`, repos de dominio). **Nunca** consultar modelos Sequelize desde la capa Application.
- **Actualizar `docs/email-notifications.md` con el nuevo caso es obligatorio** antes de dar la tarea por cerrada.

## Decision Gates

| Situación                                                        | Hacer                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Email notifica a admins (nueva licencia, firma, etc.)            | Usar `SendEmailService.sendEmailToAdmins<Targs>()`                              |
| Email notifica al empleado (estado licencia, confirmación firma) | Usar método de `SendEmailService` + `GetUser`                                   |
| Email masivo por lotes (recordatorios)                           | Servicio propio en `Infrastructure/` + `MailNotificationService.send()` (batch) |
| PDF o archivo adjunto                                            | Descargar a `Buffer` y pasarlo en `attachments`                                 |

## Execution Steps

1. Leer `docs/email-notifications.md` y la sección del caso más parecido al nuevo.
2. Agregar la función template en `EmailsTemplates.ts` (interfaz de args + `{ subject, body }`) y exportarla en `emailTemplates`.
3. Agregar el método al servicio que corresponda (`SendEmailService` o servicio propio del dominio) resolviendo destinatarios vía casos de uso.
4. Invocar el método desde el service/caso de uso que dispara el email (mismo patrón que `Certificates.service` / `Documents.service`).
5. Actualizar `docs/email-notifications.md`: agregar fila/tabla del caso nuevo (disparador, destinatarios, asunto, template, adjuntos).
6. Correr `pnpm tsc` y los specs del dominio afectado.

## Output Contract

- Código del caso nuevo con el patrón de los casos existentes.
- `docs/email-notifications.md` actualizado con el caso nuevo (si se omite, la tarea NO está completa).
- Verificación `pnpm tsc` sin errores en los archivos tocados.

## References

- `../../../docs/email-notifications.md` — inventario de casos, destinatarios e infraestructura (fuente de verdad).
- `packages/server/src/Infrastructure/utils/Email/EmailsTemplates.ts` — templates `{ subject, body }`.
- `packages/server/src/Application/Services/SendEmail.service.ts` — orquestador y resolución de destinatarios.
- `packages/server/src/domains/Disclaimer/Infrastructure/DisclaimerEmail.service.ts` — patrón de envío masivo por lotes.
