---
agent: agent
description: Agrega un hook de React Query a un dominio del frontend ya existente. El hook puede ser de tipo query (useQuery) o mutation (useMutation). Actualiza el index.ts de Hooks automáticamente.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@front`. Vas a agregar un hook nuevo al dominio `{{domain}}` en `packages/app/src/Domains/{{domain}}/Hooks/`.

**Pasos obligatorios:**

1. Lee los archivos de contexto:

   - `Hooks/index.ts` → para ver los hooks existentes
   - `{{domain}}.service.ts` → para conocer los procedures tRPC disponibles (`{{Domain}}Service.*`)
   - `{{entity}}.entity.ts` → para los tipos disponibles

2. Crea el hook en `Hooks/use{{hookName}}.ts`:

   **Si es query** (`useQuery`):

   ```typescript
   import { {{Domain}}Service } from '../{{Domain}}.service';

   export const use{{hookName}} = (input?: ...) => {
     return {{Domain}}Service.{{procedure}}.useQuery(input, {
       staleTime: 1000,
       enabled: !!input,
     });
   };
   ```

   **Si es mutation** (`useMutation`):

   ```typescript
   import { toast } from 'sonner';
   import { {{Domain}}Service } from '../{{Domain}}.service';
   import { useCache{{Entities}} } from './useCache{{Entities}}';

   export const use{{hookName}} = () => {
     const cache = useCache{{Entities}}();
     return {{Domain}}Service.{{procedure}}.useMutation({
       onSuccess: () => { toast.success('{{successMessage}}'); cache.invalidate(); },
       onError: () => { toast.error('{{errorMessage}}'); },
     });
   };
   ```

3. Agrega `export * from './use{{hookName}}';` en `Hooks/index.ts`.

4. Verifica que no haya errores de TypeScript en los archivos modificados.

**Datos del hook:**

- Dominio: `{{domain}}`
- Nombre del hook: `use{{hookName}}`
- Tipo: `{{queryOrMutation}}`
- Procedure tRPC: `{{Domain}}Service.{{procedure}}`
