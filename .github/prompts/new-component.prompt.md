---
agent: agent
description: Crea un componente React reutilizable en la capa correcta de `packages/app/src/Aplication/Components`. Verifica si ya existe antes de crear uno nuevo y lo coloca en ui/, Molecules/ u Organisms/ según su complejidad.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@front`. Vas a crear un componente reutilizable en `packages/app/src/Aplication/Components/`.

**Pasos obligatorios:**

1. **Verificar si ya existe**: Lista los contenidos de:

   - `packages/app/src/Aplication/Components/ui/`
   - `packages/app/src/Aplication/Components/Molecules/`
   - `packages/app/src/Aplication/Components/Organisms/`

   Si ya existe un componente similar, **no crees uno nuevo**. Explica cómo usar el existente.

2. **Determinar la capa correcta:**

   - `ui/` → Primitivos básicos (wraps de shadcn/ui, elementos HTML simples con estilos)
   - `Molecules/` → Compuestos de 2-3 primitivos con lógica ligera (ej. InputField = Label + Input + ErrorMessage)
   - `Organisms/` → Agrupaciones complejas con estado o múltiples Molecules

3. **Crear el componente** en la capa correcta:

   ```tsx
   import { cn } from '@app/Aplication/lib/utils';

   interface {{ComponentName}}Props {
     // props tipadas explícitamente, sin 'any'
   }

   export const {{ComponentName}} = ({ ...props }: {{ComponentName}}Props) => {
     return (
       // implementación con Tailwind CSS + Radix UI si corresponde
     );
   };
   ```

4. **Actualizar el `index.ts`** de la capa correspondiente agregando `export * from './{{ComponentName}}'`.

5. **Verificar errores** de TypeScript en el componente creado.

**Datos del componente:**

- Nombre: `{{ComponentName}}`
- Descripción: {{description}}
- Capa sugerida: `{{layer}}` (ui / Molecules / Organisms)
- Props necesarias: {{props}}
