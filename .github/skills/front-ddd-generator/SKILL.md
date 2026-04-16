---
name: front-ddd-generator
description: Genera un dominio completo en el frontend React/tRPC: entity types, service tRPC, rutas, router, hooks (query + mutation + cache), páginas vacías y actualización de los archivos globales de registro.
---

# Front DDD Generator

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No uses `@workspace`. Solo el contexto que el usuario te provee.
- **TRABAJA UN DOMINIO A LA VEZ** y verifica errores tras crear cada archivo.
- **NO modifiques archivos fuera de `packages/app/`** excepto los dos archivos de registro global indicados al final.
- **VERIFICAR COMPONENTES:** Antes de cualquier componente, revisar que no exista ya en `packages/app/src/Aplication/Components/`.

## Herramientas Requeridas

- `read/readFile` — Para leer archivos de referencia del servidor (interfaces de dominio)
- `edit/createFile` — Para crear cada archivo del dominio frontend
- `edit/editFiles` — Para actualizar los archivos globales (Routes.tsx, MenuAccess.tsx)
- `diagnostics/getErrors` — Para verificar errores al finalizar

---

## Prerequisito: El Dominio Backend ya debe existir

Esta skill asume que el dominio ya fue creado con `back-ddd-generator`. Necesitas leer de:

- `packages/server/src/domains/[Domain]/Domain/[Entity].interfaces.ts` → para los tipos `I[Entity]`
- `packages/server/src/domains/[Domain]/Infrastructure/Routes/[Domain].routes.ts` → para el tipo `T[Domain]Router`

---

## Protocolo de Preguntas (OBLIGATORIO si faltan datos)

Antes de generar, pregunta al usuario:

1. **Nombre del dominio en el server** (carpeta, PascalCase): ej. `Products`
2. **Nombre de la entidad** (PascalCase singular): ej. `Product`
3. **¿Qué páginas necesita?** (Lista, Nueva, Editar, Detalle)
4. **¿Qué campos de búsqueda/filtro tiene la lista?**
5. **¿Necesita entrada en el menú de navegación?**

---

## Validación de Estructura (OBLIGATORIO)

Antes de crear el primer archivo, lista para el usuario el árbol exacto a crear. **No procedas sin aprobación.**

```
packages/app/src/Domains/[Domain]/
├── [Entity].entity.ts
├── [Domain].service.ts
├── [Domain].routes.tsx
├── [Domain].router.tsx
├── Components/
│   └── index.ts
├── Hooks/
│   ├── useGet[Entities].ts
│   ├── useGet[Entity].ts
│   ├── useAdd[Entity].ts
│   ├── useUpdate[Entity].ts
│   ├── useDelete[Entity].ts
│   ├── useCache[Entities].ts
│   └── index.ts
├── Pages/
│   ├── [Entity]List.page.tsx
│   ├── [Entity]New.page.tsx
│   ├── [Entity]Update.page.tsx
│   └── index.ts
└── index.ts

Archivos globales a actualizar:
  packages/app/src/Infrastructure/Routes.tsx
  packages/app/src/Domains/MenuAccess.tsx  (si necesita menú)
```

---

## Estructura de Archivos y Templates

### Variables de sustitución

- `[Entity]` = singular PascalCase → ej. `Product`
- `[Entities]` = plural PascalCase → ej. `Products`
- `[Domain]` = nombre del dominio carpeta → ej. `Products`
- `[domain]` = camelCase → ej. `products`
- `[DOMAIN]` = SCREAMING_SNAKE_CASE → ej. `PRODUCTS`

---

## Template: `[Entity].entity.ts`

```typescript
import { I[Entity] } from '@server/domains/[Domain]';
import { TPagination } from '@app/Aplication';

export type T[Entity] = I[Entity];

export type T[Entity]Search = {
  // campos de búsqueda opcionales según los filtros del dominio
  search?: string;
} & TPagination;
```

---

## Template: `[Domain].service.ts`

```typescript
import { T[Domain]Router } from '@server/domains/[Domain]';
import { createTRPCReact } from '@trpc/react-query';

export const _[domain]Service = createTRPCReact<T[Domain]Router>();
export const [Domain]Service = _[domain]Service.[domain];
```

---

## Template: `[Domain].routes.tsx`

```typescript
export const [DOMAIN]_ROUTE = '/[domain]';
export const [DOMAIN]_NEW_ROUTE = `${[DOMAIN]_ROUTE}/new`;
export const [DOMAIN]_UPDATE_ROUTE = `${[DOMAIN]_ROUTE}/update/:id`;
```

---

## Template: `[Domain].router.tsx`

```tsx
import { Route } from 'react-router-dom';
import { [Entity]ListPage, [Entity]NewPage, [Entity]UpdatePage } from './Pages';
import { [DOMAIN]_ROUTE, [DOMAIN]_NEW_ROUTE, [DOMAIN]_UPDATE_ROUTE } from './[Domain].routes';

export const [Domain]Router = [
  <Route key="[domain]-list" path={[DOMAIN]_ROUTE} element={<[Entity]ListPage />} />,
  <Route key="[domain]-new" path={[DOMAIN]_NEW_ROUTE} element={<[Entity]NewPage />} />,
  <Route key="[domain]-update" path={[DOMAIN]_UPDATE_ROUTE} element={<[Entity]UpdatePage />} />,
];
```

---

## Template: `Hooks/useCache[Entities].ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { [Domain]Service } from '../[Domain].service';

export const useCache[Entities] = () => {
  const queryClient = useQueryClient();
  const key = getQueryKey([Domain]Service.getAll);
  return {
    getData: () => queryClient.getQueryData(key),
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
  };
};
```

---

## Template: `Hooks/useGet[Entities].ts`

```typescript
import { useURLParams } from '@app/Aplication/Hooks/useURLParams';
import { T[Entity]Search } from '../[Entity].entity';
import { [Domain]Service } from '../[Domain].service';

export const useGet[Entities] = () => {
  const { searchParams } = useURLParams<T[Entity]Search>();
  return [Domain]Service.getAll.useQuery(searchParams, {
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
};
```

---

## Template: `Hooks/useGet[Entity].ts`

```typescript
import { [Domain]Service } from '../[Domain].service';

export const useGet[Entity] = (id: number) => {
  return [Domain]Service.get.useQuery(id, {
    enabled: !!id,
    staleTime: 1000,
  });
};
```

---

## Template: `Hooks/useAdd[Entity].ts`

```typescript
import { toast } from 'sonner';
import { [Domain]Service } from '../[Domain].service';
import { useCache[Entities] } from './useCache[Entities]';

export const useAdd[Entity] = () => {
  const cache = useCache[Entities]();
  return [Domain]Service.create.useMutation({
    onSuccess: () => {
      toast.success('Registro agregado');
      cache.invalidate();
    },
    onError: () => {
      toast.error('Registro no agregado');
    },
  });
};
```

---

## Template: `Hooks/useUpdate[Entity].ts`

```typescript
import { toast } from 'sonner';
import { [Domain]Service } from '../[Domain].service';
import { useCache[Entities] } from './useCache[Entities]';

export const useUpdate[Entity] = () => {
  const cache = useCache[Entities]();
  return [Domain]Service.update.useMutation({
    onSuccess: () => {
      toast.success('Registro actualizado');
      cache.invalidate();
    },
    onError: () => {
      toast.error('Error al actualizar');
    },
  });
};
```

---

## Template: `Hooks/useDelete[Entity].ts`

```typescript
import { toast } from 'sonner';
import { [Domain]Service } from '../[Domain].service';
import { useCache[Entities] } from './useCache[Entities]';

export const useDelete[Entity] = () => {
  const cache = useCache[Entities]();
  return [Domain]Service.delete.useMutation({
    onSuccess: () => {
      toast.success('Registro eliminado');
      cache.invalidate();
    },
    onError: () => {
      toast.error('Error al eliminar');
    },
  });
};
```

---

## Template: `Hooks/index.ts`

```typescript
export * from './useCache[Entities]';
export * from './useGet[Entities]';
export * from './useGet[Entity]';
export * from './useAdd[Entity]';
export * from './useUpdate[Entity]';
export * from './useDelete[Entity]';
```

---

## Template: `Components/index.ts`

```typescript
// Componentes específicos del dominio [Domain]
// Agregar exports aquí a medida que se crean los componentes
```

---

## Template: `Pages/[Entity]List.page.tsx`

```tsx
export const [Entity]ListPage = () => {
  return (
    <div>
      <h1>[Entities]</h1>
      {/* TODO: Implementar lista con DataCollection */}
    </div>
  );
};
```

---

## Template: `Pages/[Entity]New.page.tsx`

```tsx
export const [Entity]NewPage = () => {
  return (
    <div>
      <h1>Nuevo [Entity]</h1>
      {/* TODO: Implementar formulario */}
    </div>
  );
};
```

---

## Template: `Pages/[Entity]Update.page.tsx`

```tsx
import { useParams } from 'react-router-dom';
import { useGet[Entity] } from '../Hooks';

export const [Entity]UpdatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGet[Entity](Number(id));

  return (
    <div>
      <h1>Editar [Entity]</h1>
      {/* TODO: Implementar formulario con data */}
    </div>
  );
};
```

---

## Template: `Pages/index.ts`

```typescript
export * from './[Entity]List.page';
export * from './[Entity]New.page';
export * from './[Entity]Update.page';
```

---

## Template: `index.ts` (barrel público)

```typescript
export * from './[Entity].entity';
export * from './[Domain].service';
export * from './[Domain].routes';
export * from './[Domain].router';
export * from './Components';
export * from './Hooks';
export * from './Pages';
```

---

## Archivos Globales a Actualizar

### 1. `packages/app/src/Infrastructure/Routes.tsx`

Agregar el import del router y sumarlo al array `AllRoutes`:

```typescript
import { [Domain]Router } from '@app/Domains/[Domain]';

export const AllRoutes = [
  // ... existentes ...
  ...[Domain]Router,
];
```

### 2. `packages/app/src/Domains/MenuAccess.tsx` (si el dominio necesita menú)

Agregar la entrada de menú siguiendo el patrón de las entradas existentes.

---

## Checklist Final

Tras crear todos los archivos, ejecuta `diagnostics/getErrors` y verifica:

- [ ] No hay errores de TypeScript
- [ ] `[Domain].service.ts` importa el tipo correcto del dominio server
- [ ] Todos los hooks usan `[Domain]Service` (no instancias directas de tRPC)
- [ ] `Routes.tsx` incluye el nuevo `[Domain]Router`
- [ ] Las páginas exportan componentes con nombre correcto
- [ ] `index.ts` raíz hace barrel export de todo
