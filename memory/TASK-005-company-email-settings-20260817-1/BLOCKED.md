---
task_id: 'TASK-005-company-email-settings-20260817-1'
agent: 'Front_Agent'
blocked_at: '2026-08-17 18:42'
attempts: 3
failure_class: 'contract_ambiguity'
reason: 'Front_Agent attempt 3 bloqueado: Disclaimer.getText devuelve solo string y no expone termsVersion. CompanyEmailSettings.get sí expone la versión, pero exige dashboard-access y no es válido para empleados que deben aceptar términos. No se puede corregir DisclaimerForm frontend-only sin inventar versión/DTO o modificar backend.'
reopened_from: null
---

# Break-loop — Front_Agent

El contrato de lectura de Disclaimer no entrega la versión junto con el contenido mostrado. Se requiere intervención humana/backend para exponer una lectura tenant-scoped de `{ content, version }` accesible al flujo de aceptación; luego Front_Agent puede enviar `termsVersion` sin inventar una versión.
