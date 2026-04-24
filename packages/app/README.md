# App — MacroGest Core

Este paquete contiene la SPA frontend de **MacroGest Core**, una aplicación B2B multi-tenant construida con **React 18**, **TypeScript**, **React Router DOM v6**, **TanStack Query v5**, **tRPC**, **Tailwind CSS** y **shadcn/ui**. Es una Progressive Web App (PWA) instalable, con soporte offline y un sistema de diseño accesible basado en Radix UI.

# Tabla de contenido

1. [Responsabilidades de cada capa](#responsabilidades-de-cada-capa)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Dominios implementados](#dominios-implementados)
4. [Flujo de render por dominio](#flujo-de-render-por-dominio)
5. [Ejemplo aplicado a Users](#ejemplo-aplicado-a-users)
   1. [Rutas](#1-definición-de-rutas)
   2. [Páginas](#2-definición-de-páginas)
   3. [Componentes](#3-definición-de-componentes)
   4. [Hooks](#4-definición-de-hooks)
   5. [Servicio](#5-definición-del-servicio)
6. [Segmentación de componentes](#segmentación-de-componentes)
7. [Hooks globales](#hooks-globales)
8. [Helpers](#helpers)
9. [Estado global](#estado-global)
10. [PWA y persistencia offline](#pwa-y-persistencia-offline)
11. [Tecnologías y libs](#tecnologías-y-libs)

---

# Responsabilidades de cada capa

## Domains (Dominios)

Es la carpeta principal del negocio. Cada subdirectorio es un **dominio funcional** independiente (Auth, Users, Config, Main). Dentro de cada dominio se encuentran:

- `[Dominio].service.ts` — cliente tRPC del dominio
- `[Dominio].router.tsx` — definición de rutas React Router
- `[Dominio].routes.ts` — constantes de paths
- `Hooks/` — lógica de datos (queries, mutations, caché)
- `Pages/` — páginas que renderiza el router
- `Components/` — componentes específicos del dominio

## Application (Aplicación)

Contiene todo lo que **no pertenece a un dominio concreto**: componentes reutilizables, hooks transversales, helpers y la capa de servicios compartidos.

- `Components/Layout/` — estructura visual de la app (Header, NavBar, Page, Layout)
- `Components/Molecules/` — componentes compuestos reutilizables (FormFields, Selects, DatePicker, Modal, etc.)
- `Components/Organisms/` — componentes complejos con lógica propia (DataCollection, Combobox, FiltersSheet, PieChart)
- `Components/ui/` — componentes atómicos de shadcn/ui (Radix UI)
- `Hooks/` — hooks transversales (useDevice, useGlobalStore, useHasPermission, usePagination, etc.)
- `Helpers/` — utilidades puras (formatter, device, isLogged, permissions, roles, etc.)

## Infrastructure (Infraestructura)

Configuración de la capa de transporte y enrutamiento global:

- `Services/clientApi.ts` — instancia `TrpcApi` configurada con `httpLink` y `credentials: 'include'`
- `Services/Services.ts` — constante `URL_SERVER`
- `Routes.tsx` — composición de todos los routers de cada dominio en un solo árbol React Router

---

# Estructura del proyecto

```
packages/app/src/
├── main.tsx                         # Bootstrap: QueryClient, TrpcApi.Provider, Router
├── App.tsx                          # Componente raíz
├── queryClient.ts                   # Instancia compartida de QueryClient
├── Aplication/
│   ├── Components/
│   │   ├── Layout/
│   │   │   ├── Page.tsx             # Contenedor estándar de cada página
│   │   │   ├── Header.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── HalfPage.tsx
│   │   │   ├── AnimatedLayout.tsx
│   │   │   ├── AppLayout/Layout.tsx # Layout principal con sidebar
│   │   │   ├── MobileMenu/          # Menú hamburguesa para mobile
│   │   │   └── NavBar/              # Barra de navegación lateral
│   │   ├── Molecules/
│   │   │   ├── FormFields/          # InputField, SelectField (RHF integrado)
│   │   │   ├── Selects/
│   │   │   │   ├── SelectRoles.tsx  # Select cross-domain de roles
│   │   │   │   └── SelectUser.tsx   # Select cross-domain de usuarios
│   │   │   ├── AlertDialog.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DateRange.tsx
│   │   │   ├── ConfirmWithPassword/ # Confirmación con contraseña
│   │   │   ├── OutletSheet.tsx
│   │   │   ├── FilterButton.tsx
│   │   │   └── List.tsx
│   │   ├── Organisms/
│   │   │   ├── DataCollection/      # Lista/tabla adaptativa (mobile/desktop)
│   │   │   ├── Combobox/            # Selector con búsqueda
│   │   │   ├── ComboboxBigSearch/   # Combobox para grandes volúmenes
│   │   │   ├── FiltersSheet/        # Panel lateral de filtros
│   │   │   ├── EditDelete/          # Botones de acción reutilizables
│   │   │   ├── Menu/AccountMenu.tsx # Menú de cuenta de usuario
│   │   │   └── PieChart/            # Gráfico de torta (Recharts)
│   │   └── ui/                      # Componentes shadcn/ui (Radix UI)
│   ├── Hooks/
│   │   ├── useGlobalStore.ts        # Estado global vía TanStack Query
│   │   ├── useDevice.ts             # Detecta mobile/desktop
│   │   ├── useHasPermission.ts      # Verificación de permisos
│   │   ├── usePagination.ts         # Paginación con URL params
│   │   ├── usePaginationIntersection.ts  # Infinite scroll
│   │   ├── useAccumulatedData.ts    # Acumulación de datos paginados
│   │   ├── useGetFiltersSetted.ts   # Filtros activos desde URL
│   │   ├── useURLParams.ts          # Lectura/escritura de query params
│   │   ├── usePublicPages.ts        # Detecta si la ruta es pública
│   │   ├── useIsEditable.ts         # Control de modo edición
│   │   ├── useChangeTheme.ts        # Cambio de tema visual
│   │   ├── useGetTheme.ts           # Obtiene el tema activo
│   │   ├── useImageUpload.ts        # Carga de imágenes
│   │   └── useDebounce.ts           # Debounce para búsquedas
│   ├── Helpers/
│   │   ├── formatter.ts             # Formato moneda y porcentaje
│   │   ├── device.ts                # Listener de viewport (768px breakpoint)
│   │   ├── isLogged.ts              # Verifica sesión activa
│   │   ├── permissions.ts           # Helper de permisos
│   │   ├── roles.ts                 # Helper de roles
│   │   ├── persister.ts             # Persistencia en IndexedDB
│   │   ├── Indexdb.ts               # Configuración de idb-keyval
│   │   ├── IPagination.ts           # Tipos de paginación
│   │   └── uuid.ts                  # Generación de UUIDs
│   └── lib/
│       └── utils.ts                 # cn() helper para clsx + tailwind-merge
├── Infrastructure/
│   ├── Routes.tsx                   # Router principal (composición de dominios)
│   └── Services/
│       ├── clientApi.ts             # TrpcApi + trpcClientApi (httpLink + cookies)
│       └── Services.ts              # URL_SERVER
└── Domains/
    ├── MenuAccess.tsx               # Control de acceso al menú por permisos
    ├── Auth/                        # Login, restaurar contraseña, roles
    ├── Users/                       # CRUD de usuarios
    ├── Config/                      # Configuración de temas
    └── Main/                        # Dashboard principal
```

---

# Dominios implementados

| Dominio    | Rutas                                                       | Páginas                                                                | Hooks                                                                                                                                | Descripción                  |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Auth**   | `/`, `/restore-password`, `/renew-password`                 | Login, RestorePassword, RenewPassword                                  | useLoginUser, useLogout, useRegisterUser, useRestorePassword, useRenewPasswordAuth, useGetRoles, useGetRoleByUser, useGetPermissions | Autenticación completa       |
| **Users**  | `/users`, `/users/new`, `/users/:id`, `/users/:id/password` | UsersList, UsersNew, UserUpdate, ChangePassword, UsersListPageInfinite | useGetUsers, useAddUser, useGetUser, useDeleteUser, useChangePassword, useCacheUsers                                                 | CRUD de usuarios             |
| **Config** | `/config`                                                   | Configuration                                                          | useGetThemes, useGetOwnerTheme, useUpdateTheme                                                                                       | Selector de temas del tenant |
| **Main**   | `/main`                                                     | Main (dashboard)                                                       | —                                                                                                                                    | Estadísticas y acceso rápido |

---

# Flujo de render por dominio

La solicitud de render sigue esta cadena unidireccional:

```
Ruta (React Router) → Página → Componente → Hook → Servicio (tRPC)
```

**Regla fundamental**: un componente o página **no puede llamar directamente a un servicio**. Siempre debe hacerlo a través de un hook. Esto desacopla el componente del protocolo de transporte (tRPC, fetch, etc.) y facilita los cambios futuros.

![image](https://github.com/user-attachments/assets/d8927492-fe80-4f77-bc16-d9eab1d808d1)

---

# Ejemplo aplicado a Users

## 1. Definición de Rutas

Las rutas del dominio se definen en `Users.router.tsx` usando React Router v6:

```tsx
// Users.router.tsx
export const UsersRouter = () => (
  <Route path="users" element={<AppLayout />}>
    <Route index element={<UsersListPage />} />
    <Route path="new" element={<UsersNewPage />} />
    <Route path=":id" element={<UserUpdatePage />} />
    <Route path=":id/password" element={<ChangePasswordPage />} />
  </Route>
);
```

Las constantes de rutas se centralizan en `Users.routes.ts` para evitar strings hardcodeados.

## 2. Definición de Páginas

Cada página usa el componente `<Page>` como contenedor principal, garantizando UX consistente:

```tsx
// UsersList.page.tsx
export const UsersListPage = () => (
  <Page title="Usuarios">
    <UsersList />
  </Page>
);
```

> Desde una página puede llamarse un hook si la lógica es simple. En casos complejos, la lógica va en el componente hijo.

## 3. Definición de Componentes

Los componentes consumen datos solo a través de hooks:

```tsx
// UsersList.tsx
export const UsersList = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <DataCollection
      data={data}
      isLoading={isLoading}
      columns={ColumnsUsersTable}
      card={UserCard}
    />
  );
};
```

## 4. Definición de Hooks

Los hooks encapsulan la comunicación con tRPC. El componente no necesita saber si usa tRPC, fetch u otra tecnología:

```typescript
// useGetUsers.ts — caso simple
export const useGetUsers = () => UsersService.getAll.useQuery();

// useAddUser.ts — caso con actualización optimista
export const useAddUser = () => {
  const queryClient = useQueryClient();
  return UsersService.create.useMutation({
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users.getAll'] });
      const previous = queryClient.getQueryData(['users.getAll']);
      queryClient.setQueryData(['users.getAll'], (old) => [...old, newUser]);
      return { previous };
    },
    onError: (_err, _newUser, context) => {
      queryClient.setQueryData(['users.getAll'], context?.previous);
    },
  });
};
```

## 5. Definición del Servicio

El servicio expone todas las operaciones tRPC disponibles para el dominio:

```typescript
// Users.service.ts
export const UsersService = TrpcApi.users;
```

`TrpcApi` infiere automáticamente todos los tipos del servidor a través de `TMainRouter`, sin contratos adicionales.

---

# Segmentación de componentes

Dentro de `Application/Components` se sigue una jerarquía similar a Atomic Design:

### `ui/` — Átomos (shadcn/ui)

Componentes primitivos de Radix UI estilizados con Tailwind. Se instalan con la CLI de shadcn y **no se modifican directamente**. Incluye: Button, Input, Dialog, Select, Tabs, Sheet, Toast, Drawer, Calendar, Combobox (Command), Chart, etc.

### `Molecules/` — Moléculas

Componentes construidos sobre los átomos, con lógica específica del proyecto:

- `FormFields/InputField` y `FormFields/SelectField` — campos integrados con React Hook Form
- `Selects/SelectRoles` y `Selects/SelectUser` — selects cross-domain que consumen sus propios hooks
- `ConfirmWithPassword` — diálogo de confirmación con verificación de contraseña
- `AlertDialog`, `Modal`, `DatePicker`, `DateRange`, `OutletSheet`, `FilterButton`

### `Organisms/` — Organismos

Componentes con lógica compleja que integran moléculas y átomos:

- **`DataCollection`**: componente principal de listado. Recibe `data`, `columns` (para tabla) y `card` (para lista mobile). Detecta automáticamente el dispositivo y renderiza la vista apropiada.
- **`Combobox`** y **`ComboboxBigSearch`**: selectores con búsqueda, para listas pequeñas y grandes respectivamente.
- **`FiltersSheet`**: panel lateral (Sheet) para aplicar filtros avanzados.
- **`PieChart`**: gráfico de torta basado en Recharts.
- **`EditDelete`**: par de botones de edición/eliminación reutilizable.

### `Layout/` — Estructura

- **`Page`**: contenedor estándar de cada página (título, padding, scroll).
- **`Layout`**: estructura principal de la app con sidebar y área de contenido.
- **`NavBar`**: navegación lateral con íconos FontAwesome.
- **`MobileMenu`**: menú hamburguesa para dispositivos móviles.
- **`AnimatedLayout`**: transiciones animadas entre rutas (Framer Motion).

---

# Hooks globales

| Hook                           | Descripción                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `useGlobalStore(key)`          | Lee/escribe en el store de TanStack Query como estado global |
| `useDevice()`                  | Retorna `{ isMobile, isDesktop }` del store                  |
| `useHasPermission(permission)` | Verifica si el usuario tiene un permiso específico           |
| `usePagination()`              | Paginación basada en query params de la URL                  |
| `usePaginationIntersection()`  | Infinite scroll con Intersection Observer                    |
| `useAccumulatedData()`         | Acumula páginas de datos para infinite scroll                |
| `useGetFiltersSetted()`        | Obtiene los filtros activos desde la URL                     |
| `useURLParams()`               | Lectura y escritura de query parameters                      |
| `usePublicPages()`             | Detecta si la ruta actual es pública (sin auth)              |
| `useIsEditable()`              | Estado de edición para formularios inline                    |
| `useChangeTheme()`             | Aplica el tema visual del tenant                             |
| `useGetTheme()`                | Retorna el tema activo desde el store                        |
| `useImageUpload()`             | Maneja la subida de imágenes al servidor                     |
| `useDebounce(value, delay)`    | Retarda actualizaciones para búsquedas                       |

---

# Helpers

Se encuentran en `Aplication/Helpers/`:

| Helper           | Descripción                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| `device.ts`      | Listener de `resize` que detecta si el viewport es < 768px. Setea `isMobile` en el QueryClient store. |
| `formatter.ts`   | Formatea números como moneda (ARS/USD) o porcentaje.                                                  |
| `isLogged.ts`    | Verifica si hay sesión activa leyendo el store.                                                       |
| `permissions.ts` | Funciones para chequear permisos del usuario actual.                                                  |
| `roles.ts`       | Funciones para chequear roles del usuario actual.                                                     |
| `persister.ts`   | Persiste el QueryClient en IndexedDB usando `idb-keyval`.                                             |
| `Indexdb.ts`     | Configura el adaptador de `idb-keyval` para la persistencia.                                          |
| `uuid.ts`        | Genera identificadores únicos para operaciones optimistas.                                            |

---

# Estado global

La aplicación **no usa Redux, Zustand, Context API ni ninguna otra librería de estado global**. El estado se gestiona exclusivamente con **TanStack Query** a través de dos mecanismos:

### `useGlobalStore(key)`

Hook que usa `useQuery` con `queryFn: () => null` y `setQueryData` para leer/escribir valores arbitrarios en el QueryClient:

```typescript
// Escribir
const { setData } = useGlobalStore('isMobile');
setData(true);

// Leer
const { data: isMobile } = useGlobalStore('isMobile');
```

### Acceso directo al QueryClient

Para contextos fuera de React (helpers, listeners), se importa la instancia directamente:

```typescript
// device.ts
import { queryClient } from '@app/queryClient';
queryClient.setQueryData(['isMobile'], window.innerWidth < 768);
```

### Persistencia con IndexedDB

El `QueryClient` está configurado con un persister de `idb-keyval`, lo que permite que los datos de las queries se mantengan entre sesiones del navegador, habilitando la funcionalidad offline de la PWA.

---

# PWA y persistencia offline

La aplicación está configurada como Progressive Web App:

- **`vite-plugin-pwa`**: genera el Service Worker y el manifest automáticamente durante el build.
- **Workbox**: estrategia de caché para assets estáticos y requests de API.
- **`idb-keyval`**: persiste el estado del QueryClient en IndexedDB para acceso offline.
- **`@tanstack/react-query-persist-client`**: integra la persistencia con TanStack Query.

---

# Tecnologías y libs

| Tecnología               | Versión       | Descripción                                               |
| ------------------------ | ------------- | --------------------------------------------------------- |
| **React**                | ^18.3.1       | Biblioteca UI de componentes                              |
| **React Router DOM**     | ^6.24.1       | Enrutamiento SPA declarativo con rutas anidadas           |
| **TanStack Query**       | ^5.51.1       | Estado asincrónico, caché, sincronización y estado global |
| **tRPC client**          | 11.0.0-rc.417 | Consumo type-safe de la API del servidor                  |
| **Tailwind CSS**         | ^3.4.6        | Framework CSS utilitario                                  |
| **shadcn/ui (Radix UI)** | varios        | Componentes accesibles y estilizados                      |
| **React Hook Form**      | ^7.52.1       | Gestión de formularios de alto rendimiento                |
| **Zod**                  | ^3.23.8       | Validación de esquemas en formularios                     |
| **Framer Motion**        | ^11.3.21      | Animaciones y transiciones                                |
| **Recharts**             | ^2.14.1       | Gráficos y visualizaciones de datos                       |
| **vite-plugin-pwa**      | ^0.20.5       | Generación de Service Worker para PWA                     |
| **FontAwesome**          | ^6.6.0        | Íconos vectoriales (solid, regular, brands)               |
| **date-fns**             | ^4.1.0        | Utilidades de fecha                                       |
| **react-day-picker**     | 8.10.1        | Componente de calendario                                  |
| **idb-keyval**           | ^6.2.1        | Persistencia en IndexedDB                                 |
| **next-themes**          | ^0.3.0        | Gestión de tema claro/oscuro                              |
| **sonner**               | ^1.5.0        | Toast notifications                                       |
| **vaul**                 | ^1.0.0        | Drawer (panel deslizante) accesible                       |
| **TypeScript**           | ^5.5.2        | Tipado estático                                           |
