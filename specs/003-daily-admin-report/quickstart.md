# Quickstart: Daily Admin Report

**Feature**: `003-daily-admin-report` | **Date**: 2026-08-05

## Overview

Guía de validación rápida para verificar que el reporte diario funciona correctamente end-to-end. Este documento asume que la implementación ya está completa.

---

## Prerequisites

1. **Base de datos**: MySQL corriendo con datos de prueba (al menos 1 empresa con empleados, licencias, documentos).
2. **Variables de entorno**: SMTP configurado (`EMAIL_SMTPSERVER`, `EMAIL_SMTPUSER`, `EMAIL_SMTPPASSWORD`).
3. **Servidor**: `pnpm server:dev` corriendo.
4. **Dependencias**: `node-cron` instalado (`pnpm add node-cron` en `packages/server`).

---

## Validation Scenarios

### Scenario 1: Scheduler se inicializa correctamente

**Objetivo**: Verificar que el scheduler se registra al arrancar el servidor.

**Pasos**:

1. Iniciar el servidor: `pnpm server:dev`.
2. Observar los logs de inicio.

**Expected**:

```
INFO: Daily report scheduler initialized (9:00 AM America/Argentina/Buenos_Aires)
```

**Validación**: El mensaje de log aparece después de `registerDI()` y antes de `app.listen()`.

---

### Scenario 2: Trigger manual del reporte (controller tRPC)

**Objetivo**: Verificar que el reporte se genera y envía correctamente sin esperar al scheduler.

**Pasos**:

1. Asegurar que hay al menos 1 empresa con administradores configurados.
2. Ejecutar el mutation manualmente (usando tRPC client, Postman, o curl):
   ```bash
   curl -X POST http://localhost:5500/trpc/dailyReport.generateManual \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{}'
   ```
3. Revisar los logs del servidor.
4. Revisar la bandeja de entrada de los administradores.

**Expected**:

- Log: `Starting daily report job`
- Log: `Daily report sent successfully` (por cada empresa)
- Log: `Daily report job completed` con `sent: N, failed: 0, total: N`
- Email recibido por cada administrador con las 7 secciones del reporte.

**Validación**:

- El email tiene el asunto: `[GestDoc] Reporte diario — {companyName} — {date}`.
- Las 7 secciones están presentes en el email.
- Los datos mostrados coinciden con el estado real de la base de datos.

---

### Scenario 3: Multi-tenant — Reporte independiente por empresa

**Objetivo**: Verificar que cada empresa recibe su propio reporte con datos filtrados por `id_propietario`.

**Pasos**:

1. Crear 2 empresas (owners) con administradores y datos de prueba:
   - Empresa A: 2 empleados de licencia hoy, 1 licencia pendiente.
   - Empresa B: 1 empleado de licencia hoy, 3 documentos sin firmar.
2. Ejecutar el trigger manual.
3. Revisar los emails recibidos por los administradores de cada empresa.

**Expected**:

- Admin de Empresa A recibe email con:
  - Sección 1: 2 empleados de licencia.
  - Sección 2: 1 licencia pendiente.
  - Sección 3: 0 documentos sin firmar.
- Admin de Empresa B recibe email con:
  - Sección 1: 1 empleado de licencia.
  - Sección 2: 0 licencias pendientes.
  - Sección 3: 3 documentos sin firmar.

**Validación**: Los datos de Empresa A no aparecen en el email de Empresa B, y viceversa.

---

### Scenario 4: Resiliencia — Fallo en una empresa no bloquea las demás

**Objetivo**: Verificar que si el envío a una empresa falla, las demás reciben su reporte.

**Pasos**:

1. Crear 3 empresas (A, B, C) con administradores.
2. Configurar un email inválido para un admin de Empresa B (ej: `invalid@nonexistent.domain`).
3. Ejecutar el trigger manual.
4. Revisar los logs y los emails recibidos.

**Expected**:

- Log: `Failed to generate/send daily report` para Empresa B (error SMTP).
- Admin de Empresa A recibe su email correctamente.
- Admin de Empresa C recibe su email correctamente.
- Log: `Daily report job completed` con `sent: 2, failed: 1, total: 3`.

**Validación**: El fallo en Empresa B no afecta a A ni C.

---

### Scenario 5: Sección 1 — Empleados de licencia hoy

**Objetivo**: Verificar que la sección muestra correctamente los empleados de licencia hoy.

**Pasos**:

1. Crear licencias con las siguientes condiciones:
   - Licencia A: `startDate = ayer`, `endDate = mañana`, `status = 'aprobado'` → DEBE aparecer.
   - Licencia B: `startDate = mañana`, `endDate = próximo mes`, `status = 'aprobado'` → NO debe aparecer.
   - Licencia C: `startDate = ayer`, `endDate = ayer`, `status = 'aprobado'` → NO debe aparecer.
   - Licencia D: `startDate = ayer`, `endDate = mañana`, `status = 'pendiente'` → NO debe aparecer.
2. Ejecutar el trigger manual.
3. Revisar la sección 1 del email.

**Expected**:

- Solo Licencia A aparece en la sección.
- Muestra: nombre del empleado, tipo de licencia, fecha de inicio, fecha de fin, fecha de reintegro.

---

### Scenario 6: Sección 2 — Licencias pendientes de aprobación

**Objetivo**: Verificar que la sección muestra correctamente las licencias pendientes.

**Pasos**:

1. Crear licencias con `status = 'pendiente'`:
   - Licencia A: creada hace 3 días.
   - Licencia B: creada hoy.
2. Ejecutar el trigger manual.
3. Revisar la sección 2 del email.

**Expected**:

- Ambas licencias aparecen en la sección.
- Muestra: nombre del empleado, tipo de licencia, fechas solicitadas, antigüedad (3 días, 0 días).
- Ordenadas por antigüedad descendente (más antiguas primero).

---

### Scenario 7: Sección 3 — Documentos sin firmar

**Objetivo**: Verificar que la sección muestra correctamente los documentos sin firmar.

**Pasos**:

1. Crear documentos con las siguientes condiciones:
   - Documento A: `requireSign = true`, `signed = null`, `view = ayer` → DEBE aparecer con estado "Visto".
   - Documento B: `requireSign = true`, `signed = null`, `view = null` → DEBE aparecer con estado "No visto".
   - Documento C: `requireSign = true`, `signed = ayer` → NO debe aparecer.
   - Documento D: `requireSign = false`, `signed = null` → NO debe aparecer.
2. Ejecutar el trigger manual.
3. Revisar la sección 3 del email.

**Expected**:

- Documentos A y B aparecen en la sección.
- Documento A muestra estado "Visto".
- Documento B muestra estado "No visto".

---

### Scenario 8: Sección 4 — Términos y condiciones sin aceptar

**Objetivo**: Verificar que la sección muestra correctamente los empleados que no han aceptado los términos.

**Pasos**:

1. Crear empleados:
   - Empleado A: sin registro en `DisclaimerAcceptance` → DEBE aparecer.
   - Empleado B: con registro en `DisclaimerAcceptance` → NO debe aparecer.
2. Ejecutar el trigger manual.
3. Revisar la sección 4 del email.

**Expected**:

- Solo Empleado A aparece en la sección.
- Muestra: nombre y email del empleado.

---

### Scenario 9: Sección 5 — Vacaciones próximas (15 días)

**Objetivo**: Verificar que la sección muestra correctamente las vacaciones próximas.

**Pasos**:

1. Crear licencias de vacaciones (`tipo_certificados.id = 1`, descripción contiene "vacaciones"):
   - Vacaciones A: `startDate = dentro de 10 días`, `status = 'aprobado'` → DEBE aparecer.
   - Vacaciones B: `startDate = dentro de 20 días`, `status = 'aprobado'` → NO debe aparecer.
   - Vacaciones C: `startDate = hoy`, `status = 'aprobado'` → NO debe aparecer (aparece en sección 1).
   - Vacaciones D: `startDate = mañana`, `status = 'pendiente'` → NO debe aparecer.
2. Ejecutar el trigger manual.
3. Revisar la sección 5 del email.

**Expected**:

- Solo Vacaciones A aparece en la sección.
- Muestra: nombre del empleado, sector/segmento, fecha de inicio, fecha de fin.

---

### Scenario 10: Sección 6 — Licencias que vencen esta semana

**Objetivo**: Verificar que la sección muestra correctamente las licencias que vencen en los próximos 7 días.

**Pasos**:

1. Crear licencias aprobadas:
   - Licencia A: `endDate = dentro de 5 días` → DEBE aparecer.
   - Licencia B: `endDate = dentro de 10 días` → NO debe aparecer.
   - Licencia C: `endDate = hoy` → DEBE aparecer.
   - Licencia D: `endDate = dentro de 5 días`, `status = 'pendiente'` → NO debe aparecer.
2. Ejecutar el trigger manual.
3. Revisar la sección 6 del email.

**Expected**:

- Licencias A y C aparecen en la sección.
- Muestra: nombre del empleado, tipo de licencia, fecha de fin.

---

### Scenario 11: Sección 7 — Resumen estadístico

**Objetivo**: Verificar que el resumen muestra los totales correctos.

**Pasos**:

1. Crear datos de prueba:
   - 50 empleados activos.
   - 3 licencias en curso (aprobadas, startDate <= hoy <= endDate).
   - 5 licencias pendientes.
   - 10 documentos sin firmar.
   - 8 empleados sin aceptar términos.
2. Ejecutar el trigger manual.
3. Revisar la sección 7 del email.

**Expected**:

- Resumen muestra:
  - Empleados activos: 50
  - Licencias en curso: 3
  - Licencias pendientes: 5
  - Documentos sin firmar: 10
  - Términos pendientes: 8

**Validación**: Los totales coinciden con los conteos de las secciones anteriores.

---

### Scenario 12: Empresa sin administradores

**Objetivo**: Verificar que si una empresa no tiene administradores, se omite el envío sin error.

**Pasos**:

1. Crear una empresa sin administradores configurados.
2. Ejecutar el trigger manual.
3. Revisar los logs.

**Expected**:

- Log: `No admins found for owner, skipping email` para esa empresa.
- No se envía email para esa empresa.
- El proceso continúa con las demás empresas sin error.

---

### Scenario 13: Timezone — Scheduler corre a las 9:00 AM hora Argentina

**Objetivo**: Verificar que el scheduler usa el timezone correcto.

**Pasos**:

1. Configurar el servidor con timezone diferente (ej: UTC).
2. Esperar a que sean las 9:00 AM hora Argentina (12:00 UTC).
3. Revisar los logs.

**Expected**:

- El scheduler se dispara a las 9:00 AM `America/Argentina/Buenos_Aires` (12:00 UTC).
- Log: `Starting daily report job` a esa hora.

**Validación**: El scheduler respeta el timezone configurado, no el timezone del servidor.

---

## Troubleshooting

### El scheduler no se inicializa

**Posibles causas**:

- `node-cron` no está instalado.
- El scheduler no se está inicializando en `index.ts`.
- Error en el constructor de `DailyReportScheduler`.

**Solución**:

- Verificar que `node-cron` está en `package.json`.
- Verificar que `scheduler.init()` se llama en `index.ts` después de `registerDI()`.
- Revisar los logs de error al iniciar el servidor.

---

### El email no se envía

**Posibles causas**:

- SMTP no está configurado correctamente.
- No hay administradores configurados para la empresa.
- Error en el template HTML.

**Solución**:

- Verificar variables de entorno: `EMAIL_SMTPSERVER`, `EMAIL_SMTPUSER`, `EMAIL_SMTPPASSWORD`.
- Verificar que `getAdmins()` devuelve al menos un admin.
- Revisar los logs de error del `MailNotificationService`.

---

### Los datos del reporte son incorrectos

**Posibles causas**:

- Query de repositorio incorrecta.
- Filtros de `ownerId` no se aplican correctamente.
- Fechas no se comparan correctamente (timezone).

**Solución**:

- Revisar las queries en los repositorios.
- Verificar que `requestContext.values.ownerId` se usa en todas las queries.
- Asegurar que las fechas se comparan usando el timezone correcto (`America/Argentina/Buenos_Aires`).

---

## Performance Testing

### Escenario: 50 empresas activas

**Objetivo**: Verificar que el reporte se genera y envía en ≤15 minutos para 50 empresas.

**Pasos**:

1. Crear 50 empresas con datos de prueba.
2. Ejecutar el trigger manual.
3. Medir el tiempo total de ejecución.

**Expected**:

- Tiempo total ≤ 15 minutos.
- Todas las empresas reciben su reporte.
- Sin degradación del rendimiento del servidor principal.

**Optimización**: Si el tiempo es excesivo, considerar:

- Procesamiento paralelo de empresas (con límite de concurrencia).
- Optimización de queries (índices compuestos).
- Caché de datos que no cambian frecuentemente.

---

## Checklist de Validación

- [ ] Scheduler se inicializa correctamente al arrancar el servidor.
- [ ] Trigger manual genera y envía el reporte.
- [ ] Cada empresa recibe su reporte independiente.
- [ ] Resiliencia: fallo en una empresa no bloquea las demás.
- [ ] Las 7 secciones muestran los datos correctos.
- [ ] Template HTML es responsive y legible.
- [ ] Logging de errores con `ownerId` y motivo.
- [ ] Timezone `America/Argentina/Buenos_Aires` se respeta.
- [ ] Performance: ≤15 minutos para 50 empresas.
