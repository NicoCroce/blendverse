---
name: pr-detail
description: 'Trigger: PR detail, pull request description, resumen de PR, detalle PR, generar PR. Genera un archivo markdown con el detalle de un PR comparando main con la rama actual.'
---

# Skill: pr-detail

## Propósito

Generar un archivo `pr-detail.md` con el detalle conciso de un Pull Request, comparando `main` con la rama actual. Muestra las diferencias y la funcionalidad agregada sin ser extenso.

## Hard Rules

1. **Siempre comparar `main` con la rama actual** — `git diff main...HEAD` y `git log main..HEAD`.
2. **Generar el archivo en la raíz del proyecto** como `pr-detail.md`.
3. **No escribir más de ~40 líneas** en el markdown — ser conciso pero informativo.
4. **No incluir issue/PR numbers ni labels** — esto es un detalle técnico, pero también quiero que te centres en las funcionalidades cambiadas.
5. **No incluir Co-Authored-By, firmas, ni metadatos de IA.**

## Output — `pr-detail.md`

```markdown
# PR: [Nombre descriptivo inferido de los cambios]

## Resumen

[2-3 oraciones: qué se agregó/cambió y por qué. Enfocado en el valor para el usuario.]

## Archivos modificados

| Archivo              | Tipo          | Descripción                  |
| -------------------- | ------------- | ---------------------------- |
| `ruta/al/archivo.ts` | ✨ Nuevo      | Breve descripción del cambio |
| `ruta/al/archivo.ts` | 🔧 Modificado | Breve descripción del cambio |

**Tipos:** ✨ Nuevo · 🔧 Modificado · 🗑️ Eliminado · ♻️ Refactor

## Cambios principales

- **[Feature/fix]:** descripción concisa del cambio y su impacto.
- **[Feature/fix]:** descripción concisa del cambio y su impacto.

## Notas adicionales

- Breaking changes, migraciones de BD, cambios de configuración, o deuda técnica generada.
- _Sección omitible si no aplica nada relevante._
```

## Execution Steps

### Paso 1 — Obtener metadata de la rama

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Rama actual: $BRANCH"

# Verificar que main existe
git rev-parse --verify main
```

### Paso 2 — Obtener el log de commits

```bash
git log main..HEAD --oneline --no-decorate
```

Extraer el título del PR del conjunto de commits.

### Paso 3 — Obtener diff de archivos

```bash
# Resumen de archivos cambiados con estado
git diff main...HEAD --stat

# Lista detallada con estado: A (added), M (modified), D (deleted)
git diff main...HEAD --name-status

# Para ver cambios específicos de contenido solo si es necesario aclarar algo
git diff main...HEAD -- <archivo>
```

### Paso 4 — Analizar los cambios

Clasificar cada archivo como:

- **Nuevo**: si está en la lista como `A`
- **Modificado**: si está como `M`
- **Eliminado**: si está como `D`

Agrupar los cambios lógicos: features, bugfixes, refactors, config, tests.

### Paso 5 — Escribir `pr-detail.md`

Usar el template de Output. Reglas:

- **Resumen**: escribir 2-3 oraciones de alto nivel. No repetir la lista de archivos.
- **Archivos modificados**: todos los archivos tocados, máximo 3 palabras de descripción cada uno.
- **Cambios principales**: agrupar por funcionalidad, no por archivo. Ej: "Autenticación — se agregó middleware JWT y ruta de login" en vez de listar cada archivo por separado.
- **Notas adicionales**: solo si hay breaking changes, migraciones, deuda técnica o cosas fuera de lo común. Si no, omitir la sección.

### Paso 6 — Verificar

Leer el archivo generado y confirmar que:

- Refleja los cambios reales del diff
- No tiene secciones vacías (si no hay "Notas adicionales", no incluir el encabezado)
- Tiene el formato correcto

## Reglas de Calidad

1. **Cada archivo listado debe existir en el diff real** — no inventar cambios.
2. **Descripciones cortas** — menos de 5 palabras por archivo, menos de 15 palabras por cambio principal.
3. **No incluir issues, números de ticket, ni usuarios** — es detalle técnico, no comunicacional.
4. **No incluir secciones vacías** — si no aplica, no la pongas.
5. **El resumen es lo único que se lee primero** — que sea la parte más cuidada.
