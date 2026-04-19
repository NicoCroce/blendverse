---
description: Convenciones de arquitectura por dominios para el paquete `packages/app`. Se aplica automáticamente en cualquier tarea dentro de esa carpeta.
applyTo: 'packages/app/**'
---

# Frontend — Arquitectura por Dominios Funcionales

## Estructura de un Dominio

```
packages/app/src/Domains/[Domain]/
├── [Entity].entity.ts          # Tipos TypeScript del dominio (re-exporta de @server)
├── [Domain].service.ts         # Instancia tRPC React para este dominio
├── [Domain].routes.tsx         # Constantes de URLs
├── [Domain].router.tsx         # JSX con <Route> de React Router
├── Components/                 # Componentes específicos del dominio
│   └── index.ts
├── Hooks/                      # Custom hooks (query + mutation)
│   ├── use[Action][Entity].ts
│   └── index.ts
├── Pages/
│   ├── [Entity]List.page.tsx
│   ├── [Entity]New.page.tsx
│   ├── [Entity]Update.page.tsx
│   └── index.ts
└── index.ts                    # Barrel export del dominio
```

## Patrones Obligatorios

## Reglas de oro

1. Las páginas y los componentes solo pueden llamar a los servicios desde los hooks, de su propio dominio o de los demás.
2. TRPc solo puede ser llamado desde la carpeta `Service`.
3. Si vas a utilizar un `Input`, `Button`, etc. Debes verificar primero en `Layout`, `Molecules`, `Organisms`.
4. Si vas a utilizar un componente de `packages/app/src/Aplication/Components/ui` debes informarlo antes de utilizarlo.
5. El componente `Container` es estrucutral, por lo que si lo utilizas por defecto ya es flex column. Esto facilita el layout. **SI VAS A UTILIZARLO ANALIZA BIEN SU COMPORTAMIENTO PARA NO AGREGAR BLOCK INNECESARIAMENTE** También ten en cuenta `space` los valores correctos.

### Entity (tipos)

```typescript
import { IEntity } from '@server/domains/[Domain]';
import { TPagination } from '@app/Aplication';

export type TEntity = IEntity;
export type TEntitySearch = { search?: string } & TPagination;
```

### Service (tRPC)

```typescript
import { T[Domain]Router } from '@server/domains/[Domain]';
import { createTRPCReact } from '@trpc/react-query';

export const _entityService = createTRPCReact<T[Domain]Router>();
export const EntityService = _entityService.[domainName];
```

### Hook de Query (lista paginada)

```typescript
import { useURLParams } from '@app/Aplication/Hooks/useURLParams';
import { TEntitySearch } from '../Entity.entity';
import { EntityService } from '../Entity.service';

export const useGetEntities = () => {
  const { searchParams } = useURLParams<TEntitySearch>();
  return EntityService.getAll.useQuery(searchParams, {
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
};
```

### Hook de Mutation (crear)

```typescript
import { toast } from 'sonner';
import { EntityService } from '../Entity.service';
import { useCacheEntities } from './useCacheEntities';

export const useAddEntity = () => {
  const cache = useCacheEntities();
  return EntityService.create.useMutation({
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

### Hook de Cache

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { EntityService } from '../Entity.service';

export const useCacheEntities = () => {
  const queryClient = useQueryClient();
  const key = getQueryKey(EntityService.getAll);
  return {
    getData: () => queryClient.getQueryData(key),
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
  };
};
```

## Rutas

### `[Domain].routes.tsx` (constantes)

```typescript
export const ENTITY_ROUTE = '/entities';
export const ENTITY_NEW_ROUTE = `${ENTITY_ROUTE}/new`;
export const ENTITY_UPDATE_ROUTE = `${ENTITY_ROUTE}/update/:id`;
```

### `[Domain].router.tsx` (JSX)

```tsx
import { Route } from 'react-router-dom';
import { EntityListPage, EntityNewPage, EntityUpdatePage } from './Pages';
import {
  ENTITY_ROUTE,
  ENTITY_NEW_ROUTE,
  ENTITY_UPDATE_ROUTE,
} from './Entity.routes';

export const EntityRouter = [
  <Route key="entity-list" path={ENTITY_ROUTE} element={<EntityListPage />} />,
  <Route
    key="entity-new"
    path={ENTITY_NEW_ROUTE}
    element={<EntityNewPage />}
  />,
  <Route
    key="entity-update"
    path={ENTITY_UPDATE_ROUTE}
    element={<EntityUpdatePage />}
  />,
];
```

## Formularios

Siempre usar React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  field1: z.string().min(1, 'Requerido'),
  field2: z.coerce.number().min(0),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { field1: '', field2: 0 },
});
```

## Componentes Compartidos

Antes de crear cualquier componente nuevo, verificar en `packages/app/src/Aplication/Components/`:

| Carpeta      | Contenido                                                   |
| ------------ | ----------------------------------------------------------- |
| `ui/`        | Primitivos shadcn/ui (Button, Input, Dialog, Select, Form…) |
| `Molecules/` | InputField, Combobox, ComboboxBigSearch, DataCollection     |
| `Organisms/` | FiltersSheet, EditDelete, Menu, PieChart                    |
| `Layout/`    | Sidebar, Header, Layout wrapper                             |

**Nunca dupliques un componente que ya exista. Si falta, crealo en la capa correcta.**

## Archivos Globales a Actualizar al Crear un Dominio

1. `packages/app/src/Infrastructure/Routes.tsx` → agregar `[Domain]Router` al array `AllRoutes`
2. `packages/app/src/Domains/MenuAccess.tsx` → agregar entrada de menú si corresponde

## Convenciones

| Artefacto      | Patrón                                                     | Ejemplo                 |
| -------------- | ---------------------------------------------------------- | ----------------------- |
| Tipos entidad  | `T[Entity]`                                                | `TArticle`              |
| Tipo búsqueda  | `T[Entity]Search`                                          | `TArticleSearch`        |
| Hooks query    | `useGet[Entities]`                                         | `useGetArticles`        |
| Hooks mutation | `useAdd[Entity]`, `useUpdate[Entity]`, `useDelete[Entity]` | `useAddArticle`         |
| Hook cache     | `useCache[Entities]`                                       | `useCacheArticles`      |
| Páginas        | `[Entity][Action].page.tsx`                                | `ArticlesList.page.tsx` |
| Routes const   | `[ENTITY]_[ACTION]_ROUTE`                                  | `ARTICLES_NEW_ROUTE`    |
| Router export  | `[Domain]Router`                                           | `ArticlesRouter`        |

## Restricciones

1. No debes llamar un servicio (TRPC, o de la carpeta Service) desde un componente tsx.
2. No debes escribir grandes bloqeues de código directamente en \*.page. Debes colocarlo en la carpeta `Components` del dominio.
3. Evita utilizar `magics strings`.
