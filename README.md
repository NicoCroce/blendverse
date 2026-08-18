# Blendverse

<p align="center">
  <img src="https://github.com/user-attachments/assets/d6558622-7fa0-485e-9f75-2a0fe9c0aae8" width="512">
</p>

"Blendverse" captura la idea de un proyecto que integra diferentes tecnologías y frameworks de una manera armónica y fluida. El nombre es una combinación de "Blend," que significa mezclar o fusionar, y "Verse," derivado de "universe," que hace referencia a un espacio o entorno cohesivo.

En este caso, "Blendverse" es la base de **MacroGest Core**: un sistema de e-commerce B2B multi-tenant que une backend (Node.js, TypeScript, Express, tRPC, Sequelize, MySQL, Awilix) y frontend (React, TypeScript, React Router DOM, TanStack Query, shadcn) en un monorepo cohesivo y escalable.

# Tabla de contenido

1. [Contexto](#contexto)
2. [Arquitectura multi-tenant](#arquitectura-multi-tenant)
3. [Primeros pasos](#primeros-pasos)
4. [Paquetes del monorepo](#paquetes-del-monorepo)
   1. [Server](#server)
   2. [App](#app)
5. [Dominios implementados](#dominios-implementados)
6. [Tecnologías utilizadas](#tecnologías-utilizadas)
7. [Calidad de código](#calidad-de-código)
8. [Documentación detallada](#documentación-detallada)

# Contexto

Este proyecto se encuentra diseñado sobre un modelo `monorepo` gestionado con **pnpm workspaces**.

Un **monorepo** es un único repositorio que alberga el código fuente de múltiples proyectos o paquetes relacionados. En lugar de tener repositorios separados para cada componente o servicio de una aplicación, todo el código se organiza en un solo repositorio, facilitando la gestión y el desarrollo de proyectos interrelacionados.

### Ventajas de un Monorepo:

1. **Facilita el Reuso de Código**: Permite compartir y reutilizar código entre diferentes proyectos o paquetes sin necesidad de publicar o versionar cada cambio, lo que acelera el desarrollo.
2. **Coordinación de Dependencias**: Al tener todos los proyectos en un solo lugar, es más sencillo coordinar y mantener las dependencias alineadas, evitando problemas de incompatibilidad.
3. **Mejor Gestión de Cambios**: Cambios en la base de código pueden afectar múltiples proyectos. Con un monorepo, es más fácil realizar y probar esos cambios de manera integral, asegurando que todo funcione en conjunto.
4. **Automatización y Herramientas de Desarrollo**: Los monorepos suelen integrarse bien con herramientas que facilitan la automatización de tareas comunes, como pruebas, construcción, y despliegue, a través de scripts compartidos y pipelines centralizados.
5. **Simplificación del Control de Versiones**: Un solo historial de commits y un flujo de trabajo de control de versiones unificado simplifican la colaboración entre equipos, ya que todos trabajan en la misma rama base.
6. **Mejor Colaboración entre Equipos**: Los equipos pueden colaborar más fácilmente, ya que el código de los diferentes proyectos está accesible y visible en el mismo lugar, promoviendo una mayor coherencia y alineación.

En resumen, un monorepo puede mejorar la productividad, la coherencia del código y la coordinación entre equipos, especialmente en proyectos grandes y complejos que involucran múltiples servicios o módulos.

# Arquitectura multi-tenant

MacroGest Core es una plataforma **multi-tenant**: una misma instancia del sistema puede servir a múltiples organizaciones (propietarios / _owners_) de forma aislada. Cada entidad del negocio pertenece a un `id_propietario` que se resuelve automáticamente en cada petición mediante el `RequestContext`.

```
JWT → { id: userId, ownerId } → RequestContext → todas las queries filtran por ownerId
```

Toda query al repositorio incluye el filtro `id_propietario = requestContext.values.ownerId`, garantizando que ningún tenant acceda a datos de otro.

# Primeros pasos

**Requisitos previos**

- Node.js >= v22.6.0
- pnpm

**Instalación**

```bash
# Instalar dependencias de todos los paquetes
pnpm install

# Iniciar servidor de desarrollo (backend)
pnpm server:dev

# Iniciar aplicación frontend
pnpm app:dev
```

**Scripts disponibles en la raíz:**

| Script            | Descripción                                            |
| ----------------- | ------------------------------------------------------ |
| `pnpm app:dev`    | Inicia el frontend con Vite en modo desarrollo         |
| `pnpm server:dev` | Inicia el backend con tsx en modo watch                |
| `pnpm lint`       | Ejecuta ESLint sobre todos los archivos `.ts` / `.tsx` |
| `pnpm format`     | Formatea el código con Prettier                        |
| `pnpm build`      | Compila el server y el app para producción             |

# Paquetes del monorepo

## Server

El paquete `packages/server` contiene la API construida con **Node.js**, **Express**, **TypeScript** y **tRPC**, siguiendo los principios de **Arquitectura Hexagonal / DDD**. Implementa un sistema multi-tenant con autenticación JWT, autorización por roles/permisos, persistencia en MySQL vía Sequelize e inyección de dependencias con Awilix.

### Características principales

- **Node.js + Express**: Servidor backend robusto y ligero.
- **TypeScript estricto**: Sin uso de `any`; todos los tipos son explícitos.
- **tRPC v11**: Comunicación type-safe entre servidor y cliente, sin contratos API manuales.
- **Arquitectura Hexagonal / DDD**: Separación en capas Domain → Application → Infrastructure por cada dominio.
- **Sequelize v6 + MySQL**: ORM para acceso a base de datos relacional.
- **Awilix**: Contenedor de inyección de dependencias en modo CLASSIC.
- **Zod**: Validación de inputs en todos los controladores tRPC.
- **JWT + bcrypt**: Autenticación segura con tokens firmados y contraseñas hasheadas.
- **Pino**: Logging estructurado con trazabilidad por `requestId`.
- **Nodemailer**: Envío de correos electrónicos (restauración de contraseña, etc.).
- **Multer**: Soporte para carga de archivos.
- **RequestContext**: Contexto de solicitud que propaga `userId` y `ownerId` a todas las capas.

> Continuar leyendo la documentación en el [repositorio](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md)

## App

El paquete `packages/app` contiene la SPA frontend construida con **React 18**, **TypeScript**, **React Router DOM v6**, **TanStack Query v5**, **tRPC**, **Tailwind CSS** y **shadcn/ui**. Es una Progressive Web App (PWA) con soporte offline vía Workbox.

### Características principales

- **React 18 + TypeScript**: Interfaces de usuario dinámicas y tipadas.
- **React Router DOM v6**: Gestión declarativa de rutas con soporte para rutas anidadas y protegidas.
- **TanStack Query v5**: Estado asincrónico global; reemplaza Redux/Zustand para datos remotos y estado compartido.
- **tRPC v11**: Integración type-safe con el backend, compartiendo los tipos del servidor directamente.
- **Tailwind CSS + shadcn/ui**: Sistema de diseño utilitario con componentes Radix UI accesibles.
- **React Hook Form + Zod**: Formularios con validación esquemática en el cliente.
- **Framer Motion**: Animaciones y transiciones fluidas.
- **Recharts**: Gráficos y visualizaciones de datos.
- **PWA (vite-plugin-pwa + Workbox)**: Instalable como app nativa, con caché offline.
- **FontAwesome**: Iconografía vectorial escalable.
- **idb-keyval**: Persistencia de estado en IndexedDB para datos offline.

> Continuar leyendo la documentación en el [repositorio](https://github.com/NicoCroce/blendverse/blob/main/packages/app/README.md)

# Dominios implementados

El sistema está organizado en **dominios funcionales** independientes. Cada dominio encapsula su lógica tanto en el backend como en el frontend.

| Dominio          | Backend | Frontend        | Descripción                                            |
| ---------------- | ------- | --------------- | ------------------------------------------------------ |
| **Auth**         | ✅      | ✅              | Login, logout, restauración y renovación de contraseña |
| **Users**        | ✅      | ✅              | CRUD completo de usuarios, cambio de contraseña        |
| **Permissions**  | ✅      | ✅ (vía Auth)   | Roles, permisos y asociación usuario–rol               |
| **Themes**       | ✅      | ✅ (vía Config) | Gestión de temas visuales                              |
| **Ownersyss**    | ✅      | ✅ (vía Config) | Datos del propietario/tenant, cambio de tema           |
| **Userprofiles** | ✅      | —               | Asociación usuario–perfil                              |
| **Companies**    | Modelo  | —               | Modelo de empresa (en desarrollo)                      |
| **Profiles**     | Modelo  | —               | Modelo de perfil (en desarrollo)                       |
| **Config**       | —       | ✅              | Configuración de la app (temas, preferencias)          |
| **Main**         | —       | ✅              | Dashboard principal con estadísticas                   |

# Tecnologías utilizadas

## Arquitectura del proyecto

**PNPM Workspaces**

Gestor de paquetes con workspaces que comparte dependencias entre `packages/server` y `packages/app` de forma eficiente mediante enlaces simbólicos, reduciendo el espacio en disco y los tiempos de instalación.

[Fast, disk space efficient package manager | pnpm](https://pnpm.io/es/)

## Tecnologías en el server

| Tecnología             | Versión       | Rol                                       |
| ---------------------- | ------------- | ----------------------------------------- |
| **Node.js**            | >= 22.6.0     | Runtime JavaScript del servidor           |
| **Express**            | ^4.19.2       | Framework HTTP y middleware               |
| **TypeScript**         | ^5.5.2        | Tipado estático, compilación a JavaScript |
| **tRPC**               | 11.0.0-rc.390 | API type-safe sin contratos manuales      |
| **Sequelize**          | ^6.37.3       | ORM para MySQL                            |
| **MySQL2**             | ^3.11.3       | Driver de base de datos                   |
| **Awilix**             | ^11.0.0       | Contenedor de inyección de dependencias   |
| **Zod**                | ^3.23.8       | Validación de esquemas e inputs           |
| **JWT (jsonwebtoken)** | ^9.0.2        | Autenticación basada en tokens            |
| **bcryptjs**           | ^2.4.3        | Hashing seguro de contraseñas             |
| **Pino**               | ^9.4.0        | Logging estructurado de alto rendimiento  |
| **Nodemailer**         | ^8.0.1        | Envío de emails SMTP                      |
| **Multer**             | ^2.0.2        | Carga de archivos multipart               |
| **Moment.js**          | ^2.30.1       | Manejo y formateo de fechas               |

## Tecnologías en el frontend

| Tecnología               | Versión       | Rol                                        |
| ------------------------ | ------------- | ------------------------------------------ |
| **React**                | ^18.3.1       | Biblioteca UI de componentes               |
| **React Router DOM**     | ^6.24.1       | Enrutamiento SPA declarativo               |
| **TanStack Query**       | ^5.51.1       | Estado asincrónico, caché y sincronización |
| **tRPC client**          | 11.0.0-rc.417 | Consumo type-safe de la API                |
| **Tailwind CSS**         | ^3.4.6        | Framework CSS utilitario                   |
| **shadcn/ui (Radix UI)** | varios        | Componentes accesibles y estilizados       |
| **React Hook Form**      | ^7.52.1       | Gestión de formularios                     |
| **Zod**                  | ^3.23.8       | Validación de esquemas en formularios      |
| **Framer Motion**        | ^11.3.21      | Animaciones y transiciones                 |
| **Recharts**             | ^2.14.1       | Gráficos y visualizaciones                 |
| **vite-plugin-pwa**      | ^0.20.5       | Generación de Service Worker para PWA      |
| **FontAwesome**          | ^6.6.0        | Íconos vectoriales                         |
| **date-fns**             | ^4.1.0        | Utilidades de fecha                        |
| **idb-keyval**           | ^6.2.1        | Persistencia en IndexedDB                  |

# Calidad de código

El proyecto aplica un conjunto de herramientas para garantizar consistencia y calidad en cada commit:

| Herramienta     | Rol                                                           |
| --------------- | ------------------------------------------------------------- |
| **ESLint 9**    | Análisis estático con reglas TypeScript y Prettier integradas |
| **Prettier**    | Formateo automático de código                                 |
| **Husky**       | Git hooks para ejecutar validaciones antes de cada commit     |
| **lint-staged** | Ejecuta ESLint y Prettier solo sobre los archivos en stage    |
| **Commitlint**  | Valida que los mensajes de commit sigan Conventional Commits  |

**Formato de commits (Conventional Commits):**

```
feat(users): add password change use case
fix(auth): handle expired token correctly
refactor(permissions): extract role association logic
```

# Documentación detallada

- [Arquitectura del servidor (Hexagonal/DDD)](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md)
- [Arquitectura del frontend (por dominios)](https://github.com/NicoCroce/blendverse/blob/main/packages/app/README.md)

**React Router DOM**

Es una biblioteca para gestionar la navegación en aplicaciones React. Proporciona componentes y hooks para definir rutas, gestionar la historia del navegador, y realizar transiciones entre vistas de forma declarativa. Es fundamental para construir aplicaciones de una sola página (SPA) con React, facilitando la creación de rutas dinámicas y anidadas.

[Home v6.26.0](https://reactrouter.com/en/main)

**TanStack Query**: Es una herramienta para la gestión de estado asincrónico en aplicaciones React. Permite realizar fetching, caching, sincronización y actualización de datos de manera eficiente y con mínima configuración. Es ideal para manejar datos remotos, como los que provienen de APIs, optimizando la experiencia de usuario al reducir tiempos de carga y evitar solicitudes redundantes.

[TanStack Query](https://tanstack.com/query/latest)

**Tailwind CSS**: Es un framework CSS utilitario que permite construir interfaces de usuario personalizadas rápidamente. En lugar de ofrecer componentes predefinidos, Tailwind proporciona una amplia gama de clases utilitarias que se pueden combinar para crear diseños únicos directamente en el HTML, fomentando un flujo de trabajo altamente productivo y mantenible.

[Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.](https://tailwindcss.com/)

**shadcn**: Es una colección de componentes UI basados en Tailwind CSS que están preconfigurados y estilizados, listos para usar en proyectos. shadcn permite a los desarrolladores utilizar componentes accesibles y consistentes en diseño, integrados perfectamente con Tailwind, acelerando el desarrollo de interfaces de usuario sin perder flexibilidad en la personalización.

[shadcn/ui](https://ui.shadcn.com/)

### Tecnologías y librerías en el server y en el front

**TypeScript**: Es un superset de JavaScript desarrollado por Microsoft que añade tipos estáticos al lenguaje. Esto permite detectar errores en tiempo de desarrollo, mejorar la autocompletación, y facilita el mantenimiento y escalabilidad de aplicaciones grandes. TypeScript se compila a JavaScript puro, lo que lo hace compatible con cualquier entorno donde JavaScript se ejecute, como navegadores y Node.js.

[JavaScript With Syntax For Types.](https://www.typescriptlang.org/)

**tRPC**: Es una biblioteca para crear APIs basadas en TypeScript sin necesidad de definir contratos API manualmente. Permite que el cliente y el servidor compartan tipos, asegurando que los contratos estén sincronizados y sean seguros, lo que reduce errores y mejora la productividad.

[tRPC - Move Fast and Break Nothing. End-to-end typesafe APIs made easy. | tRPC](https://trpc.io/)

# Primeros pasos

1. Tener instalado [nodejs](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) `>=v22.6.0`
2. Instalar [PNPM](https://pnpm.io/es/installation)
3. Instalar las dependencias de `server` y `app`

   ```bash
   > pnpm install
   ```

4. En el root del proyecto ejecutar

   ```bash
   > pnpm server:dev
   > pnpm app:dev
   ```

> estos comandos se deben ejecutar en terminales aisladas

![run](https://github.com/user-attachments/assets/c0a4541e-6a64-43f2-a0c7-d4e0e05dd50f)
