# Quickstart: Employee Daily Reminders — Guía de Validación

**Feature**: `004-employee-daily-reminders` | **Date**: 2026-08-06

Guía para validar end-to-end que la feature funciona. Documenta **qué ejecutar y qué se espera**; los contratos y tipos viven en `contracts/interfaces.md` y `data-model.md`. No incluye implementación.

---

## Prerrequisitos

- Server corriendo: `pnpm server:dev` (desde la raíz del monorepo).
- Base de datos MySQL accesible con datos de prueba (empleados, empresas, documentos).
- SMTP configurado en `.env` (el transporter de `MailNotificationService` se inicializa al arrancar).
- `node-cron` ya instalado (dependency existente).

## 1. Validación del batch diario (US1..US5)

### Setup de datos

1. En la BD, elegir una empresa (`empresas.id`) con al menos 2 empleados en `usuarios`.
2. Empleado A: sin documento pendiente (todos firmados/visualizados o sin documentos), `renovar_clave = false`, con registro válido en `disclaimer_firmas`.
3. Empleado B: al menos 1 documento con `firmado IS NULL`, otro con `visualizado IS NULL`, `renovar_clave = true` y sin registro en `disclaimer_firmas` (o inválido).

### Trigger manual (sin esperar las 9 AM)

Llamar la mutation tRPC de testing:

```text
employeeReminders.sendDailyReminders   → mutation (manual trigger)
```

> Equivalente a lo que dispara el cron `0 9 * * *` (America/Argentina/Buenos_Aires). También puede dispararse iniciando el server y esperando la corrida.

### Resultados esperados

| Caso       | Acción                                              | Resultado esperado                                                                                                                                                                           |
| ---------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1        | Correr `sendDailyReminders`                         | Empleado B recibe UN email individual con su nombre en el saludo y SOLO sus pendientes (docs sin firmar, docs sin visualizar, términos, renovar clave). Empleado A NO recibe email (FR-008). |
| US2/FR-004 | Doc con `firmado IS NULL`                           | Aparece con su `titulo` en la sección "Documentos sin firmar".                                                                                                                               |
| US3/FR-005 | Empleado sin registro válido en `disclaimer_firmas` | Aparece la sección "Términos y condiciones".                                                                                                                                                 |
| US4/FR-006 | `renovar_clave = true`                              | Aparece "Renovar contraseña".                                                                                                                                                                |
| US5/FR-007 | Doc con `visualizado IS NULL`                       | Aparece en "Documentos sin visualizar".                                                                                                                                                      |
| FR-009     | Empleado sin email válido                           | No se envía; log con identidad del empleado y motivo.                                                                                                                                        |

## 2. Validación de la notificación en tiempo real (US6)

### Setup

1. Tener un empleado con email válido.
2. Invocar el punto de ingreso (procedure tRPC nuevo):

```text
documents.ingestDocument   → mutation
input: {
  documents: [
    { employeeId: <id del empleado>, tipo: <id tipo>, titulo: "Recibo Septiembre", archivo: "/uploads/.../recibo.pdf", extension: "pdf" },
    { employeeId: <mismo empleado>, tipo: <id tipo>, titulo: "Contrato actualizado", archivo: "/uploads/.../contrato.pdf", extension: "pdf" }
  ]
}
```

### Resultados esperados

| Caso          | Acción                                     | Resultado esperado                                                           |
| ------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| FR-011/FR-012 | Ingresar doc asignado a empleado con email | El empleado recibe UN email inmediato que lista ambos documentos (FR-013).   |
| FR-014        | Ingresar doc sin `employeeId`              | No se envía notificación; el documento se persiste igual.                    |
| FR-014        | Empleado sin email válido                  | Omitido + log.                                                               |
| FR-015        | SMTP caído / error de envío                | El ingreso NO falla (no bloquea); error en log.                              |
| FR-016        | Al día siguiente correr el batch           | El documento sin firmar/visualizar aparece en el email diario (convivencia). |

## 3. Validación de resiliencia multi-tenant (US7)

### Setup

- 3 empresas (A, B, C) con empleados con pendientes.
- En B, forzar un fallo (p. ej. empleado con email malformado o SMTP rechaza esa dirección).

### Resultados esperados

- A y C reciben sus emails; B falla y se registra en log con `ownerId` y motivo (FR-009/FR-003).
- Un email inválido dentro de una empresa NO bloquea a los demás empleados de esa empresa (FR-003).
- Una empresa sin empleados con email válido se omite con log.

## 4. Validación del scheduler (US1/FR-001/FR-010)

- Reiniciar el server: en el log debe aparecer

  ```text
  Employee reminders scheduler initialized (0 9 * * * America/Argentina/Buenos_Aires)
  ```

- Verificar que no se duplican envíos del día tras reinicios (el cron es idempotente; un reinicio no re-dispara la corrida del día — sin catch-up, edge case del spec).
- Opcional: ajustar temporalmente la expresión del cron a un minuto futuro para observar la corrida automática y luego revertir.

## 5. Validación de calidad (gates)

```bash
pnpm tsc        # sin errores
pnpm lint       # sin errores
pnpm test       # tests del dominio EmployeeReminders + Documents nuevos pasando
```

## 6. Validación de performance (SC-001 / SC-005)

### SC-001: 100% de empleados con pendientes recibe email en ≤15 min

**Protocolo de medición:**

1. Antes de ejecutar `sendDailyReminders`, registrar timestamp de inicio: `const start = Date.now()`.
2. Ejecutar el batch (manual trigger o esperar el cron).
3. En el log del service, cada owner procesado debe loguear: `ownerId`, `sent`, `skipped`, `failed`, `durationMs`.
4. Al finalizar, calcular `totalDuration = Date.now() - start`.
5. **Criterio de aceptación**: `totalDuration ≤ 15 * 60 * 1000` (15 minutos). Si falla, documentar en el QA report.

**Nota**: para volúmenes grandes (>1000 empleados), evaluar migrar a `Promise.all` por owner (mejora futura documentada en plan.md Risk 4).

### SC-005: No degrada latencia del sistema

**Protocolo de medición:**

1. Antes del batch, medir latencia baseline de 3 operaciones críticas: `documents.getAll`, `users.getAll`, `disclaimer.getEmployeesByCompany` (promedio de 10 llamadas).
2. Ejecutar el batch.
3. Inmediatamente después, medir nuevamente las mismas 3 operaciones (promedio de 10 llamadas).
4. **Criterio de aceptación**: la latencia post-batch no debe superar el baseline en más del 20%. Si falla, documentar en el QA report y evaluar optimización de queries (ej. índices compuestos).

**Herramientas**: usar `pino` logs con timestamps o APM si está disponible. Documentar resultados en `memory/{task_id}/03_qa_report.md`.

## Referencias

- Contratos: `specs/004-employee-daily-reminders/contracts/interfaces.md`
- DTOs y tablas: `specs/004-employee-daily-reminders/data-model.md`
- Decisiones de diseño: `specs/004-employee-daily-reminders/research.md`
