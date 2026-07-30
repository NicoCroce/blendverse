---
name: qa-runner
description: Guía al agente @blendverse-qa en la ejecución de validación estática (TypeScript + ESLint + Vitest + estructura de carpetas) y la generación del reporte QA.
---

# Skill: qa-runner

## Propósito

Guía al agente `@blendverse-qa` en la ejecución de validación estática (TypeScript + ESLint + Vitest + estructura de carpetas) y la generación del reporte `memory/{task_id}/03_qa_report.md`.

---

## Secuencia de Validación

Los tres primeros pasos (TypeScript, Linting, Vitest) son independientes entre sí — ninguno depende del resultado de otro. **Lanzar los 3 en paralelo, esperar a que terminen los 3, y recién ahí evaluar el status de cada uno.** El criterio PASS/FAIL de cada paso no cambia; solo cambia que no se esperan en serie.

### 1. Compilación TypeScript

Ejecutar según el scope detectado en `02_dev_log.md → affected_files`:

```bash
# Si hay archivos en packages/server/
cd packages/server && npx tsc --noEmit 2>&1

# Si hay archivos en packages/app/
cd packages/app && npx tsc --noEmit 2>&1
```

**Criterio:** `status: PASS` solo si la salida no contiene `error TS`.

### 2. Linting

Acotar el lint al paquete afectado en vez de correr `pnpm lint` (que lintea todo el monorepo) — mismo set de reglas ESLint, menos archivos analizados:

```bash
# Si hay archivos solo en packages/server/
npx eslint "packages/server/src/**/*.{js,ts,tsx}" 2>&1

# Si hay archivos solo en packages/app/
cd packages/app && npx eslint . 2>&1

# Si el scope es full-stack (archivos en ambos paquetes)
pnpm lint 2>&1
```

**Criterio:** `status: PASS` solo si no hay errores (warnings son aceptables, los errores no).

### 3. Ejecutar Tests con Vitest

```bash
# Si hay archivos en packages/server/
cd packages/server && npx vitest run 2>&1

# Si hay archivos en packages/app/
cd packages/app && npx vitest run 2>&1
```

**Criterio:** `status: PASS` solo si todos los tests pasan (0 failed).

### 4. Verificación de Estructura de Carpetas

Para cada archivo en `affected_files`, verificar que se encuentra en la capa correcta.

**Backend — estructura esperada:**

```
domains/{domain}/
  Domain/
    {Entity}.entity.ts
    {Entity}.repository.ts
    index.ts
  Application/
    {domain}.types.ts
    UseCases/
      GetAll{Entities}.usecase.ts
      Get{Entity}.usecase.ts
      Create{Entity}.usecase.ts
      Update{Entity}.usecase.ts
      Delete{Entity}.usecase.ts
      index.ts
    {Domain}.service.ts
    index.ts
  Infrastructure/
    Controllers/{Domain}.controller.ts
    Database/
      {Entity}.model.ts
      {Entity}Repository.implementation.ts
    Routes/{Domain}.routes.ts
  {domain}.di.ts
  index.ts
```

**Frontend — estructura esperada:**

```
Domains/{Domain}/
  {Entity}.entity.ts
  {Domain}.service.ts
  {Domain}.routes.tsx
  {Domain}.router.tsx
  Hooks/
    useCache{Entities}.ts
    useGet{Entities}.ts
    useGet{Entity}.ts
    useAdd{Entity}.ts
    useUpdate{Entity}.ts
    useDelete{Entity}.ts
    index.ts
  Components/index.ts
  Pages/
    {Entity}List.page.tsx
    {Entity}New.page.tsx
    {Entity}Update.page.tsx
```

**Criterio:** Marcar cada archivo como ✅ (en lugar correcto) o ❌ (incorrecto o faltante).

### 5. Determinación del Status Final

| Condición                                                             | Status |
| --------------------------------------------------------------------- | ------ |
| tsc sin errores + linter sin errores + tests OK + estructura correcta | `PASS` |
| Cualquier error de tsc                                                | `FAIL` |
| Cualquier error de linter (no warning)                                | `FAIL` |
| Cualquier test fallado                                                | `FAIL` |
| Archivo en capa incorrecta                                            | `FAIL` |

---

## Template Obligatorio — `03_qa_report.md`

> **Regla de brevedad:** Si el resultado es `PASS`, omitir el output de terminal — solo registrar el estado de cada paso. Si el resultado es `FAIL`, incluir únicamente el error concreto (mensaje + archivo + línea) del paso que falló, no el output completo.

```markdown
---
task_id: 'TASK-YYYYMMDD-N'
agent: 'QA_Agent'
status: 'PASS' # PASS | FAIL
attempts: 1
date: 'YYYY-MM-DD'
---

# Reporte de QA — [Título de la Tarea]

## Resultado General: ✅ PASS / ❌ FAIL

| Paso          | Comando                                        | Paquete(s)           | Estado      |
| ------------- | ---------------------------------------------- | -------------------- | ----------- |
| 1. TypeScript | `npx tsc --noEmit`                             | server / app / ambos | ✅ / ❌     |
| 2. Linting    | `eslint` (acotado) / `pnpm lint` si full-stack | server / app / ambos | ✅ / ❌     |
| 3. Tests      | `npx vitest run`                               | server / app / ambos | ✅ X passed |
| 4. Estructura | verificación manual                            | —                    | ✅ / ❌     |

---

## Error (solo si status: FAIL)

**Paso fallido:** [1 / 2 / 3 / 4]

**Error:**
```

[Copiar únicamente el mensaje de error relevante — máximo 20 líneas]

```

**Archivo afectado:** `ruta/al/archivo.ts` — línea X
```

**Acción esperada:** [Descripción concisa de qué debe corregirse]

```

---

## Reglas de Calidad

1. **Pegar el output completo del terminal** — no resumir ni truncar los errores.
2. **Sección "Tests (Vitest)"** es obligatoria aunque `status: PASS`.
3. **Si `status: FAIL`**, la sección "Contexto para el Coder" es obligatoria.
4. **`attempts`** comienza en `1` y se incrementa en cada re-ejecución.
5. **Si `attempts >= 3`**, no escribir el reporte — ejecutar el Protocolo Break-Loop definido en `@blendverse-qa`.
```
