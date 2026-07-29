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

## Estructura de Specs

Todos los archivos de test (`.spec.tsx`, `.spec.ts`, `.test.tsx`, `.test.ts`) deben organizarse en una carpeta `specs/` manteniendo la misma estructura del directorio padre.

✅ **CORRECTO:**

```
packages/app/src/Domains/Auth/
├── Components/
│   ├── LoginForm.tsx
│   └── specs/
│       └── LoginForm.spec.tsx
├── Hooks/
│   ├── useLogin.ts
│   └── specs/
│       └── useLogin.spec.ts
└── Pages/
    ├── LoginPage.page.tsx
    └── specs/
        └── LoginPage.page.spec.tsx
```

❌ **PROHIBIDO** — Mezclar specs con archivos fuente:

```
Components/
├── LoginForm.tsx
├── LoginForm.spec.tsx          # ← INCORRECTO
```

## Patrones Obligatorios

## Reglas de oro

1. Las páginas y los componentes solo pueden llamar a los servicios desde los hooks, de su propio dominio o de los demás.
2. TRPc solo puede ser llamado desde la carpeta `Service`.
3. **Usa los wrappers con patrones del proyecto SIEMPRE que existan.** Los componentes en `Molecules/`, `Organisms/` y `Layout/` tienen comportamientos del proyecto (como `Button` con `appearance`, `isLoading`, o `Input` con `forceEnabled`/`isEditable`). Impórtalos desde el barrel `@app/Application/Components`:
   - ✅ `import { Button } from '@app/Application/Components'` — usa el wrapper de `Molecules/Button`
   - ❌ `import { Button } from '@app/Application/Components/ui/button'` — es el raw shadcn, sin patrones del proyecto

4. Solo importa de `ui/` cuando NO exista un wrapper en `Layout/`, `Molecules/` u `Organisms/`, o cuando necesites composición de bajo nivel que el wrapper no exponga (ej: `SelectContent`/`SelectItem` directos de `ui/select` porque el wrapper `Molecules/Select` usa una API simplificada distinta). Siempre verifica primero el barrel.
5. El componente `Container` es estrucutral, por lo que si lo utilizas por defecto ya es flex column. Esto facilita el layout. **SI VAS A UTILIZARLO ANALIZA BIEN SU COMPORTAMIENTO PARA NO AGREGAR BLOCK INNECESARIAMENTE** También ten en cuenta `space` los valores correctos.

### Entity (tipos)

**Nunca definas los tipos manualmente.** Derivalos del router del servidor con `inferRouterOutputs` para que el frontend se sincronice automáticamente cuando el backend cambia.

```typescript
import { inferRouterOutputs } from '@trpc/server';
import { T[Domain]Router } from '@server/domains/[Domain]';
import { TPagination } from '@app/Application';

type RouterOutput = inferRouterOutputs<T[Domain]Router>;

// Tipo de la entidad: inferido del output de la procedure getById (o getAll)
export type TEntity = RouterOutput['[domainName]']['getById'];

// Tipo de búsqueda: solo los parámetros de filtro, no viene del server
export type TEntitySearch = { search?: string } & TPagination;
```

> **Regla:** `TEntity` y variantes (`TEntityList`, `TEntitySelect`, etc.) siempre se derivan de `inferRouterOutputs`. Solo `TEntitySearch` se define manualmente porque describe parámetros de URL, no datos del servidor.

### Service (tRPC)

```typescript
import { T[Domain]Router } from '@server/domains/[Domain]';
import { createTRPCReact } from '@trpc/react-query';

export const _entityService = createTRPCReact<T[Domain]Router>();
export const EntityService = _entityService.[domainName];
```

### Hook de Query (lista paginada)

```typescript
import { useURLParams } from '@app/Application/Hooks/useURLParams';
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

### Filtros auto-contenidos con URL Params — SIEMPRE usar esta forma

**Regla:** cualquier componente de filtro debe ser **self-contained** usando `useURLParams` internamente. No recibe props `value`/`onChange`. El estado del filtro vive en la URL, no en el componente padre.

```tsx
// ✅ Correcto — el filtro lee y escribe directo en la URL
<SegmentsFilter />

// ❌ Nunca — props externas con useState en la página
<SegmentsFilter value={segmentIds} onChange={setSegmentIds} />
```

**Arrays en URL params:** se serializan como string comma-separated (`?segmentos=1,2,3`):

```typescript
const segmentIds = useMemo(() => {
  const raw = searchParams?.segmentos;
  if (!raw) return [];
  return raw
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n));
}, [searchParams?.segmentos]);
```

**Contrapartida en hooks de query:** todo hook que consuma params desde `useURLParams` debe parsear los arrays de string a `number[]` antes de enviarlos al server. Ejemplo:

```typescript
export const useGetEntities = () => {
  const { searchParams } = useURLParams<TEntitySearch>();
  const { id, segmentos: rawSegmentos, ...rest } = searchParams || {};

  const segmentos = rawSegmentos
    ? rawSegmentos
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  return EntityService.getAll.useQuery({
    ...rest,
    ...(segmentos && segmentos.length > 0 ? { segmentos } : {}),
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

### Invalidación de Cache en Mutations — SIEMPRE

**Regla:** toda mutation debe invalidar la cache de las queries relacionadas en su `onSuccess`. Esto se hace a nivel del hook en `queries.ts` para que todos los consumidores se beneficien automáticamente, sin depender de que cada componente lo recuerde.

```typescript
// ✅ Correcto — invalidación en el hook, todos los consumidores la heredan
export const useUpdateEntity = () => {
  const utils = entityTRPC.useUtils();
  return EntityService.update.useMutation({
    onSuccess: () => {
      utils.[domain].[procedure].invalidate();
    },
  });
};

// ❌ Incorrecto — sin invalidación, el listado muestra datos stale
export const useUpdateEntity = () =>
  EntityService.update.useMutation();
```

**Ejemplo real** usando `useUtils()` de tRPC:

```typescript
export const useUpdateSegmentType = () => {
  const utils = segmentsTRPC.useUtils();
  return segmentsService.updateType.useMutation({
    onSuccess: () => {
      utils.segments.getTypes.invalidate();
    },
  });
};
```

**Alternativa** con custom cache hook (equivalente):

```typescript
export const useUpdateEntity = () => {
  const cache = useCacheEntities();
  return EntityService.update.useMutation({
    onSuccess: () => {
      cache.invalidate();
    },
  });
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

## Button

- Por defecto NO pasar el atributo `size`. El tamaño default del tema es el correcto.
- NO agregar un componente `<Icon>` dentro del `<Button>`. Usar los atributos `icon` y `showIcon`:

```tsx
<Button onClick={() => null} icon={faEdit} showIcon />
```

## Componentes Compartidos

Antes de crear cualquier componente nuevo, verificar en `packages/app/src/Application/Components/`:

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
4. No debes crear componentes genéricos que no sean específicos de tu dominio. Si necesitas un componente compartido, colócalo en `packages/app/src/Application/Components/` y avisa al equipo.
5. No debes escribir lógica de negocio en los componentes. Toda la lógica debe ir en los hooks o servicios.
6. No debes utilizar `<div>` con class `flex` en su lugar usa <Container> con las props que tiene el componente.
7. Los nombres de los métodos, variables, etc. deben ser camelcase. Ej: `Rename class "Empresas_usuariosService" to match the regular expression ^\$?[A-Z][a-zA-Z0-9]*$.`.
8. Prefer using nullish coalescing operator (`??`) instead of a ternary expression, as it is simpler to read.
