---
name: business-report
description: 'Trigger: reporte de mejoras, reporte de negocio, business report, reporte de evolucion, resumen de cambios, generar reporte. Genera un reporte HTML orientado a negocio con la estetica oscura de GestDoc (indigo/violeta sobre negro), analizando git desde un commit hash hasta HEAD en la rama main.'
---

# Skill: business-report

## Proposito

Generar `reporte-mejoras.html` en la raiz del proyecto: un reporte orientado a negocio que muestra las mejoras incorporadas desde un **commit hash de inicio** hasta la actualidad, en la rama `main`. Estetica, estructura y criterio son fijos (template); solo cambia el contenido segun los cambios reales del repositorio.

## Hard Rules

1. **Siempre sobre `main`** — el rango de analisis es `git log <hash>..HEAD` (y `git diff <hash>..HEAD`) con la rama `main` como base. Si se indica otro hash, ese es el punto de inicio.
2. **Input obligatorio: commit hash** — el usuario debe indicar el hash desde el cual analizar. Si no lo da, pedirlo antes de empezar.
3. **Copiar el template, no inventar el diseño** — partir de `assets/reporte-mejoras-template.html`. NO modificar el `<style>`: la estetica es fija. Reemplazar SOLO los placeholders `{{...}}`.
4. **Solo datos reales del diff** — cada cifra, componente, use case o template listado debe provenir de `git diff`/`git log`. No inventar funcionalidades ni metricas.
5. **Español, sin acentos en el HTML** — el template usa texto sin acentos (ej. "Gestion", "Analisis", "Lineas") por consistencia con la fuente de verdad. No cambiar ese criterio.
6. **Secciones condicionales** — solo incluir las secciones cuyos archivos cambiaron en el rango. Si no hubo cambios de emails, omitir la seccion 01. Si no hubo dominios nuevos, poner el numero real (0 en la metrica). La seccion IA y MCP siempre se incluye.
7. **Numeracion corrida** — las secciones se numeran 01, 02, 03... en orden real de aparicion, sin huecos.
8. **Salida en la raiz** — escribir `reporte-mejoras.html` en la raiz del monorepo y abrirlo con `open reporte-mejoras.html` al finalizar.
9. **No incluir Co-Authored-By, firmas, ni metadatos de IA.**

## Execution Steps

### Paso 1 — Validar el input y la rama

```bash
# Verificar que el hash existe
git rev-parse --verify <HASH>

# Verificar que estamos en main
git branch --show-current
```

Si no estamos en `main`, hacer checkout a `main` (o avisar al usuario).

### Paso 2 — Recolectar metricas globales

```bash
# Commits en el rango (sin merges)
git log <HASH>..HEAD --oneline --no-merges | wc -l

# Pull requests (commits de merge)
git log <HASH>..HEAD --oneline --merges | wc -l

# Archivos y lineas agregadas
git diff <HASH>..HEAD --stat | tail -1

# Lineas agregadas netas
git diff <HASH>..HEAD --numstat | awk '{s+=$1} END {print s}'
```

### Paso 3 — Listar archivos por estado

```bash
git diff <HASH>..HEAD --name-status
```

Clasificar por:

- **Dominios nuevos**: carpetas `packages/server/src/domains/[Nuevo]/` o `packages/app/src/Domains/[Nuevo]/` que no existian en el hash anterior.
- **Emails**: cambios en `packages/server/src/domains/*/Application/...EmailSender*`, templates de email, `docs/email-notifications.md`.
- **Dominios con cambios**: por cada carpeta de dominio tocada.
- **Componentes compartidos**: cambios en `packages/app/src/Application/Components/`.
- **IA/OpenCode**: cambios en `.opencode/`, `.github/`, `AGENTS.md`, `opencode.json`.

### Paso 4 — Analizar contenido real por dominio

Para cada dominio con cambios, inspeccionar los archivos clave para describir funcionalidad real:

```bash
git diff <HASH>..HEAD -- <ruta/dominio> --stat
```

- **Server**: leer use cases (`Application/UseCases/*.usecase.ts`), entidades (`Domain/*.entity.ts`), controladores, modelos, schedulers.
- **App**: leer `Hooks/`, `Pages/`, `Components/`, `[Domain].router.tsx`, `[Domain].routes.ts`.
- **Emails**: leer los senders, templates y `docs/email-notifications.md` para destinatario (Admin/Empleado/Ambos), disparador y contenido.
- **Tests nuevos**: contar `*.spec.ts`/`*.spec.tsx`/`*.test.ts` agregados y sus lineas:
  ```bash
  git diff <HASH>..HEAD --numstat -- '*.spec.ts' '*.spec.tsx' '*.test.ts' '*.test.tsx' | awk '{s+=$1; n+=1} END {print n" archivos, "s" lineas"}'
  ```

### Paso 5 — Rellenar el template

Copiar `assets/reporte-mejoras-template.html` a `reporte-mejoras.html` en la raiz y reemplazar:

| Placeholder                                                                        | Contenido                                                                                                                     |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `{{VERSION}}`                                                                      | Numero de version del reporte (segun cantidad de reportes previos; si es el primero, `2.0` por continuar el reporte original) |
| `{{SUBTITULO_GENERAL}}`                                                            | Frase de 1-2 lineas: "Analisis completo de las mejoras incorporadas al producto: [lista breve de areas tocadas]."             |
| `{{COMMITS}}`                                                                      | Total de commits del rango                                                                                                    |
| `{{PULL_REQUESTS}}`                                                                | Total de merges del rango                                                                                                     |
| `{{ARCHIVOS}}`                                                                     | Total de archivos con cambios                                                                                                 |
| `{{LINEAS}}`                                                                       | Lineas agregadas (formato `26.4k` si supera 1000)                                                                             |
| `{{DOMINIOS_NUEVOS}}`                                                              | Cantidad de dominios nuevos                                                                                                   |
| `{{TESTS_NUEVOS}}`                                                                 | Cantidad de archivos de test nuevos                                                                                           |
| `{{EMAIL_ROWS}}`                                                                   | Una `<tr>` por template de email (ver formato abajo)                                                                          |
| `{{EMAIL_FEATURES}}`                                                               | feature-cards de arquitectura/performance del sistema de emails                                                               |
| `{{NOMBRE_DOMINIO}}`, `{{SUBSECCION}}`, `{{DOMINIO_FEATURES}}`, `{{USECASE_ROWS}}` | Seccion por dominio                                                                                                           |
| `{{SHARED_FEATURES}}`                                                              | feature-cards de componentes compartidos                                                                                      |
| `{{LINEAS_TESTS}}`                                                                 | Lineas de tests nuevas (formato `5.7k`)                                                                                       |
| `{{ARCHIVOS_ELIMINADOS}}`                                                          | Archivos de config IA (Copilot) eliminados                                                                                    |
| `{{SKILLS_NUEVOS}}`                                                                | Skills nuevos en el rango                                                                                                     |
| `{{TEST_BARS}}`                                                                    | bar-rows por dominio (ver formato abajo)                                                                                      |
| `{{TIMELINE_ITEMS}}`                                                               | timeline-items de la evolucion IA/OpenCode                                                                                    |
| `{{IA_FEATURES}}`                                                                  | feature-cards de calidad IA                                                                                                   |
| `{{MCP_SERVERS}}`                                                                  | feature-cards de MCP servers integrados                                                                                       |
| `{{FECHA}}`                                                                        | Fecha actual (ej. "8 de agosto de 2026")                                                                                      |
| `{{COMMIT_INICIAL}}`                                                               | Hash de inicio del analisis                                                                                                   |

**Formato fila de email** (con badges de destinatario):

```html
<tr>
  <td>
    <strong>addLicense</strong><br /><small style="color:var(--text-muted)"
      >Nueva licencia</small
    >
  </td>
  <td><span class="badge badge-admin">Admin</span></td>
  <td>Empleado registra licencia medica</td>
  <td>Nombre del empleado y motivo de la licencia</td>
</tr>
```

Badges: `badge-admin` (violeta), `badge-employee` (verde), `badge-both` (ambar), `badge-new` (azul), `badge-improved` (violeta secundario).

**Formato barra de test:**

```html
<div class="bar-row">
  <div class="bar-label">Certificates</div>
  <div class="bar-track">
    <div class="bar-fill" style="width: {{PCT}}%"></div>
  </div>
  <div class="bar-value">{{COUNT}}</div>
</div>
```

`{{PCT}}` = proporcion del maximo de tests del rango (el dominio con mas tests = 100%).

### Paso 6 — Verificar

- `grep` que no queden placeholders `{{` sin reemplazar.
- Leer el archivo generado: secciones en orden numerico sin huecos, solo dominios con cambios reales.
- Confirmar que las metricas del hero y del IA coinciden con los numeros reales del diff.
- `open reporte-mejoras.html`.

## Referencias

- `assets/reporte-mejoras-template.html` — template con estetica y estructura fijas.
- `docs/email-notifications.md` — fuente de verdad del sistema de emails (destinatarios, disparadores).
- `docs/runbook-multiempresas-login.md` — arquitectura multiempresa.
- `reporte-mejoras.html` (raiz, si existe) — ejemplo de reporte previo: referencia de estilo de contenido y criterio.
