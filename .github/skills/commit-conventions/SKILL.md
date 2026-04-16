---
name: commit-conventions
description: Convenciones de commits, hooks de Husky, lint-staged y formato de mensajes para MacroGest Core
---

# Commit Conventions

## Descripción

Convenciones y herramientas automatizadas para garantizar la calidad del código y mensajes de commit consistentes en MacroGest Core.

## Herramientas Configuradas

### 1. Husky - Pre-commit Hooks

El proyecto utiliza **Husky v9** para ejecutar hooks de Git automáticamente.

**Archivo de configuración:** `.husky/pre-commit`

```bash
pnpm lint-staged
```

### 2. Lint-Staged

Ejecuta linters y formateadores solo en los archivos staged (listos para commit).

**Configuración en `package.json`:**

```json
{
  "lint-staged": {
    "**/*.{js,ts,tsx}": ["eslint --fix"],
    "**/*": "prettier --write --ignore-unknown"
  }
}
```

**¿Qué hace?**

- Ejecuta ESLint en archivos JS/TS/TSX y corrige automáticamente errores solucionables
- Formatea TODOS los archivos staged con Prettier
- Si ESLint encuentra errores no solucionables automáticamente, el commit se rechaza

### 3. Commitlint

Valida que los mensajes de commit sigan las convenciones establecidas.

**Archivo de configuración:** `commitlint.config.js`

```javascript
export default { extends: ['@commitlint/config-conventional'] };
```

## Formato de Commits (Conventional Commits)

### Estructura del Mensaje

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types Permitidos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bugs
- **docs**: Cambios en documentación
- **style**: Cambios de formato (espacios, comas, etc.) sin afectar lógica
- **refactor**: Refactorización sin cambiar funcionalidad
- **perf**: Mejoras de performance
- **test**: Agregar o corregir tests
- **chore**: Tareas de mantenimiento (actualizar dependencias, configuración, etc.)
- **ci**: Cambios en CI/CD
- **build**: Cambios en el sistema de build
- **revert**: Revertir un commit anterior

### Ejemplos Correctos

```bash
# Feature nueva
git commit -m "feat(articles): add image upload functionality"

# Bug fix
git commit -m "fix(customers): resolve null pointer in customer search"

# Chore (usualmente para merges o tareas de manteniemiento)
git commit -m "chore: merge main into feat/parametros"

# Refactor
git commit -m "refactor(userprofiles): move UseCases from Domain to Application"

# Documentación
git commit -m "docs(readme): update installation instructions"

# Con scope y body
git commit -m "feat(profiles): add profile selection component

- Add SelectProfiles component
- Integrate with useGetProfiles hook
- Update routes and menu access"
```

### Ejemplos Incorrectos ❌

```bash
# Sin type
git commit -m "add new feature"

# Type incorrecto
git commit -m "added: new feature"

# Sin subject
git commit -m "feat:"

# Subject con mayúscula inicial (debe ser minúscula)
git commit -m "feat: Add new feature"

# Subject terminando con punto
git commit -m "feat: add new feature."
```

## Flujo de Trabajo Recomendado

### 1. Antes de Hacer Commit

```bash
# Verificar estado
git status

# Agregar archivos
git add <archivos>

# (Opcional) Verificar lint-staged manualmente
pnpm lint-staged
```

### 2. Si Lint-Staged Falla

```bash
# Ver errores de ESLint
pnpm eslint "packages/**/*.{ts,tsx}"

# Corregir errores manualmente y volver a agregar
git add <archivos-corregidos>
```

### 3. Hacer Commit

```bash
# Commit normal (Husky ejecutará validaciones automáticamente)
git commit -m "feat(domain): add new functionality"

# Saltar hooks solo en casos excepcionales (NO RECOMENDADO)
git commit --no-verify -m "feat: emergency fix"
```

### 4. Después de un Merge con Conflictos

```bash
# 1. Resolver conflictos manualmente
# 2. Agregar archivos resueltos
git add <archivos-resueltos>

# 3. lint-staged formateará los archivos automáticamente
# 4. Commit del merge
git commit -m "chore: merge <branch> into <current-branch>"
```

## Troubleshooting

### Problema: ESLint falla en el pre-commit

**Solución:**

1. Corregir los errores de ESLint manualmente
2. Agregar los archivos corregidos: `git add .`
3. Volver a intentar el commit

### Problema: Prettier modifica archivos y el commit falla

**Solución:**

1. Prettier ya formateó los archivos, solo falta agregarlos
2. `git add -A`
3. Volver a intentar el commit

### Problema: Commitlint rechaza el mensaje

**Solución:**

1. Verificar que el mensaje siga el formato: `<type>: <subject>`
2. Usar uno de los types permitidos
3. El subject debe estar en minúsculas
4. No terminar el subject con punto

### Problema: Necesito hacer commit urgente sin validaciones

**Solución (usar con precaución):**

```bash
git commit --no-verify -m "fix: emergency hotfix"
```

⚠️ **Advertencia:** Solo usar `--no-verify` en casos excepcionales. Los hooks existen para mantener calidad del código.

## Configuración para Nuevos Desarrolladores

### Instalación Inicial

```bash
# Instalar dependencias (esto configura Husky automáticamente)
pnpm install

# Verificar que Husky esté instalado
ls -la .husky/

# Debería ver el archivo pre-commit
```

### Verificar Configuración

```bash
# Probar lint-staged manualmente
pnpm lint-staged

# Probar ESLint
pnpm eslint "packages/**/*.{ts,tsx}"

# Probar Prettier
pnpm prettier --write "packages/**/*.{ts,tsx}"
```

## Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
- [Lint-Staged](https://github.com/lint-staged/lint-staged)

## Notas Importantes

1. **Todos los commits** deben pasar las validaciones de Husky
2. **ESLint** debe ejecutarse sin errores
3. **Prettier** formatea automáticamente los archivos
4. **Commitlint** valida el formato del mensaje
5. El formato **Conventional Commits** es obligatorio
6. Los **merge commits** deben usar el type `chore`

## Ejemplos de Workflow Completo

### Agregar una nueva feature

```bash
# 1. Crear rama
git checkout -b feat/nueva-funcionalidad

# 2. Hacer cambios
# ... editar archivos ...

# 3. Agregar archivos
git add .

# 4. Commit (hooks automáticos se ejecutan)
git commit -m "feat(domain): add nueva funcionalidad

- Add new component
- Update routes
- Add tests"

# Si hay errores de ESLint, corregir y repetir:
# git add .
# git commit -m "feat(domain): add nueva funcionalidad"
```

### Hacer merge de main

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Volver a tu rama
git checkout feat/tu-rama

# 3. Merge
git merge main

# 4. Si hay conflictos, resolver
# ... resolver conflictos ...

# 5. Agregar archivos resueltos
git add .

# 6. Commit del merge (formato específico)
git commit -m "chore: merge main into feat/tu-rama"
```

## Integración con IDEs

### VS Code

Instalar extensiones recomendadas:

- **ESLint** - Para ver errores en tiempo real
- **Prettier** - Para formateo automático al guardar
- **Conventional Commits** - Para ayuda con mensajes de commit

### Configuración recomendada en `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true
}
```
