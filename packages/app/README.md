# APP

Este repositorio contiene una aplicación frontend moderna construida con **React**, **TypeScript**, **React Router DOM**, **TanStack Query**, **tRPC**, **Tailwind CSS**, y **shadcn**. Este stack tecnológico ofrece una solución robusta y escalable para desarrollar interfaces de usuario ricas, con una experiencia de desarrollo optimizada y un estilo moderno y adaptable.

# Tabla de contenidos

1. [Responsabilidades de cada Capa](https://github.com/NicoCroce/blendverse/tree/main/packages/app#responsabilidades-de-cada-capa)
2. [Estructura dentro del dominio](https://github.com/NicoCroce/blendverse/tree/main/packages/app#estructura-dentro-del-dominio)
3. [Ejemplo aplicado a un dominio](https://github.com/NicoCroce/blendverse/tree/main/packages/app#estructura-dentro-del-dominio)
   1. [Definición de Rutas](https://github.com/NicoCroce/blendverse/tree/main/packages/app#1-definici%C3%B3n-de-rutas)
   2. [Definición de Páginas](https://github.com/NicoCroce/blendverse/tree/main/packages/app#2-definici%C3%B3n-de-p%C3%A1ginas)
   3. [Definición de Componentes](https://github.com/NicoCroce/blendverse/tree/main/packages/app#3-definici%C3%B3n-de-componentes)
   4. [Definición de Hooks](https://github.com/NicoCroce/blendverse/tree/main/packages/app#4-definici%C3%B3n-de-hooks)
   5. [Definición del Servicio](https://github.com/NicoCroce/blendverse/tree/main/packages/app#5-definici%C3%B3n-del-servicio)
4. [Estado global](https://github.com/NicoCroce/blendverse/tree/main/packages/app#estado-global)
5. [Helpers](https://github.com/NicoCroce/blendverse/tree/main/packages/app#helpers)
6. [Tecnologías y libs](https://github.com/NicoCroce/blendverse/tree/main/packages/app#tecnolog%C3%ADas-y-libs)

# Responsabilidades de cada Capa

1. **Domain (Dominio)**
   - **Responsabilidad:** es una carpeta que contiene cada **dominio / feature / entidad / vertical / sección** o como pueda identificarse.
   - **Ejemplo:** Componentes, Hooks, Rutas y todo lo que esté relacionado al dominio de Users, es decir puede ser cada parte de la aplicación como ser _Users, Products, Orders, Payments, Auth, etc._
2. **Application (Aplicación)**
   - **Responsabilidad:** Contiene los componentes, helpers, Hooks, libs que no pertenecen a un dominio determinado. Esta capa interactúa con el dominio y la infraestructura.
   - **Ejemplo:** Componente Page, Layout, componentes atómicos, helpers como formatters, isMobile, etc.
3. **Infrastructure (Infraestructura)**
   - **Responsabilidad:** Contiene la configuración y definición con los servicios externos como ser el server, rutas principales, etc.
   - **Ejemplo:** Configuración de tRPC, conjunción de rutas de react-router-dom.
4. **Config (Configuración)**

- **Responsabilidad:** Contiene la configuración global de la aplicación.
- **Ejemplo:** Configuración de conexión a bases de datos, variables de entorno, etc.

## Segmentación de componentes

Al igual que todos los proyectos de front, este se encuentra generado por componentes, los cuales tienen la siguiente estructura organizacional similar a Atom Design.

Dentro de `Application` se encuentra la carpeta `Components` y dentro está segmentada por:

- `Layout` todos los **componentes estructurales** y relacionados con las estructuras como ser, Layout responsive de la aplicación, componente Page, Header, NavBar, el menú mobile, etc. Son componentes más estructurales y contenedores para brindar la misma experiencia en toda la APP. Suelen utilizarse solo una vez en niveles superiores.
- `ui` todos los componentes **atómicos** descargados de [Shadcn](https://ui.shadcn.com/).
- `Molecules` son componentes compuestos por componentes atómicos. Generalmente son componentes que se crean por medio de los componentes de [Shadcn](https://ui.shadcn.com/). Por ejemplo se encuentran Title, AlertDialog, [etc](https://ui.shadcn.com/examples/mail).
- `Organisms` son **componentes con lógica muy compleja** que integran moléculas y átomos, que tienen lógica con tipado muy específico. Ejemplo: **DataCollection,** es un componente que recibe data y la estructura de una tabla, generando una lista o una tabla según el dispositivo donde se encuentra la app.

# Estructura dentro del dominio

_Se toma como ejemplo el dominio `Users`_

## Concepto

Cada capa tiene una responsabilidad específica, manteniendo la independencia de funcionalidades y responsabilidades.

Siguiendo los conceptos de Clean Architecture, en este caso estamos centrados en la capa de Dominio.

> _No sigue el standard global de Domain, Application, Infrastructure, así mismo mantiene la independencia de responsabilidades enfocadas 100% en front._

La `solicitud de render` comienza por una **ruta** específica, esta renderiza una **página**, la página renderiza un **componente**, el componente renderiza la información obtenida por medio de un **hook** donde el hook se comunica con el **servicio**.

> Una página o un componente no puede llamar a un service directamente, siempre debe hacerlo por medio de un Hook, para mantener la independencia.

![image](https://github.com/user-attachments/assets/d8927492-fe80-4f77-bc16-d9eab1d808d1)

# Ejemplo aplicado a un dominio

### 1. Definición de Rutas

Lo primo es definir la ruta en `react-router-dom`, en este caso se utiliza. `/users` donde `Route` recibe a `UsersListPage` como parámetro de `element` .

[https://github.com/NicoCroce/blendverse/blob/5c18c8f06ddabcf3367d973333e74012539bc31c/packages/app/src/Domains/Users/UsersRoutes.tsx#L5-L16](https://github.com/NicoCroce/blendverse/blob/5c18c8f06ddabcf3367d973333e74012539bc31c/packages/app/src/Domains/Users/UsersRoutes.tsx#L5-L16)

### 2. Definición de Páginas

La página que recibe Route es `UsersListPage`

Una página debe contener como componente principal a [`Page`](https://github.com/NicoCroce/blendverse/blob/main/packages/app/src/Aplication/Components/Layout/Page.tsx) para mantener la UX, dentro Page se encuentran los componentes para la página en cuestión, o la `data` que debe mostrarse.

> Desde una página puede llamarse un hook para obtener información, no es recomendable, pero puede hacerse si la lógica es simple.

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Pages/UsersList.page.tsx#L4-L14](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Pages/UsersList.page.tsx#L4-L14)

### 3. Definición de Componentes

Como puede observarse en el código anterior, se encuentra el componente `<UsersList />` que renderizará la lista de usuarios.

> Se recomienda que en los componentes se realicen los llamados a los servicios por medio de un hook, en este caso se utiliza `useGetUsers` . Se obtiene la `data` y se renderiza por medio de una tabla.

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Components/ListUsers/UsersList.tsx#L5-L19](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Components/ListUsers/UsersList.tsx#L5-L19)

### 4. Definición de Hooks

Dentro de los hooks se ejecutan los llamados a tRPC.

Continuando con el ejemplo de Users:

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Hooks/useGetUsers.ts#L3](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Hooks/useGetUsers.ts#L3)

> Como puede observarse, este hook tiene solo una línea, la cual puede ser escrita directamente dentro del componente, pero esto vincularía directamente el componente a tRPC. De esta forma se trabaja con una interfaz abstracta, no interesa que dentro del hook se utilice fetch, tRPC, TansktackQuery, etc. Solo importa que retorna `data` y `isLoading` .

**Se puede observar un caso más complejo de hooks en el momento de crear un Usuario.**

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Hooks/useAddUser.ts#L3-L30](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/Hooks/useAddUser.ts#L3-L30)

En este ejemplo se utiliza una actualización optimista, por este motivo el código es más complejo, pero el componente no tiene la responsabilidad de saberlo. Solo espera la ejecución del servicio.

### 5. Definición del Servicio

Por último el hook ejecuta un servicio de tRPC, por lo que debe estar definido en el archivo `UserService.ts`

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/UserService.ts#L4](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Users/UserService.ts#L4)

> `UsersService` posee todo el tipado del servicio definido en el server

# Estado global

La aplicación no cuenta con context, Redux, Zustand, etc.

Al estar ejecutando tRPC con [TankstackQuery](https://tanstack.com/query/v5/docs/framework/react/overview), se decidió utilizarlo como estado global. Para esto se creó un hook que recibe la `key` que se desea escribir o leer llamado `useGlobalStore`.

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Hooks/useGlobalStore.ts#L8-L25](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Hooks/useGlobalStore.ts#L8-L25)

**Uso**

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Components/Organisms/DataCollection/DataCollection.tsx#L16](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Components/Organisms/DataCollection/DataCollection.tsx#L16)

Utiliza la misma estructura que `useQueryClient` y `setQueryData`

> Esto es muy útil, porque importando `queryClient` de `main.tsx` puedo acceder a cualquier parte de **store** sin necesidad de utilizar este hook.

Ejemplo sin hook:

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Helpers/device.ts#L12-L13](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Aplication/Helpers/device.ts#L12-L13)

# Helpers

Se encuentran dentro de `Application`

https://github.com/NicoCroce/blendverse/blob/main/packages/app/src/Aplication/Helpers/device.ts#L3

Es un listener que determina mediante el ancho del viewport si el dispositivo es mobile o desktop. `768px` es el punto de quiebre. Setea en el store de TanStack el estado del dispositivo.

![image 1](https://github.com/user-attachments/assets/788f96e1-b2be-471c-85d2-f88c5edfe40e)

https://github.com/NicoCroce/blendverse/blob/main/packages/app/src/Aplication/Helpers/formatter.ts

Permite dar formato de moneda y porcentual a números y strings.

[https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Products/Components/Collection/ProductComponentList.tsx#L32](https://github.com/NicoCroce/blendverse/blob/8fe5b20428d2e73c1b85e588cf7f5e7cef76d7c5/packages/app/src/Domains/Products/Components/Collection/ProductComponentList.tsx#L32)

# Tecnologías y libs

**React**

Es una biblioteca de JavaScript desarrollada por Facebook para construir interfaces de usuario interactivas. Se basa en componentes reutilizables y es especialmente conocida por su enfoque en la creación de aplicaciones de una sola página (SPA).

[React](https://react.dev/)

**React Router DOM**

Es una biblioteca para gestionar la navegación en aplicaciones React. Proporciona componentes y hooks para definir rutas, gestionar la historia del navegador, y realizar transiciones entre vistas de forma declarativa. Es fundamental para construir aplicaciones de una sola página (SPA) con React, facilitando la creación de rutas dinámicas y anidadas.

[Home v6.26.0](https://reactrouter.com/en/main)

**TanStack Query**: Es una herramienta para la gestión de estado asincrónico en aplicaciones React. Permite realizar fetching, caching, sincronización y actualización de datos de manera eficiente y con mínima configuración. Es ideal para manejar datos remotos, como los que provienen de APIs, optimizando la experiencia de usuario al reducir tiempos de carga y evitar solicitudes redundantes.

[TanStack Query](https://tanstack.com/query/latest)

**Tailwind CSS**: Es un framework CSS utilitario que permite construir interfaces de usuario personalizadas rápidamente. En lugar de ofrecer componentes predefinidos, Tailwind proporciona una amplia gama de clases utilitarias que se pueden combinar para crear diseños únicos directamente en el HTML, fomentando un flujo de trabajo altamente productivo y mantenible.

[Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.](https://tailwindcss.com/)

**shadcn**: Es una colección de componentes UI basados en Tailwind CSS que están preconfigurados y estilizados, listos para usar en proyectos. shadcn permite a los desarrolladores utilizar componentes accesibles y consistentes en diseño, integrados perfectamente con Tailwind, acelerando el desarrollo de interfaces de usuario sin perder flexibilidad en la personalización.

[shadcn/ui](https://ui.shadcn.com/)

**TypeScript**: Es un superset de JavaScript desarrollado por Microsoft que añade tipos estáticos al lenguaje. Esto permite detectar errores en tiempo de desarrollo, mejorar la autocompletación, y facilita el mantenimiento y escalabilidad de aplicaciones grandes. TypeScript se compila a JavaScript puro, lo que lo hace compatible con cualquier entorno donde JavaScript se ejecute, como navegadores y Node.js.

[JavaScript With Syntax For Types.](https://www.typescriptlang.org/)

**tRPC**: Es una biblioteca para crear APIs basadas en TypeScript sin necesidad de definir contratos API manualmente. Permite que el cliente y el servidor compartan tipos, asegurando que los contratos estén sincronizados y sean seguros, lo que reduce errores y mejora la productividad.

[tRPC - Move Fast and Break Nothing. End-to-end typesafe APIs made easy. | tRPC](https://trpc.io/)
