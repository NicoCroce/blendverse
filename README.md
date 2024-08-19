# Blendverse

<p align="center">
  <img src="https://github.com/user-attachments/assets/d6558622-7fa0-485e-9f75-2a0fe9c0aae8" width="512">
</p>


"Blendverse" captura la idea de un proyecto que integra diferentes tecnologías y frameworks de una manera armónica y fluida. El nombre es una combinación de "Blend," que significa mezclar o fusionar, y "Verse," derivado de "universe," que hace referencia a un espacio o entorno cohesivo.

En este caso, "Blendverse" sugiere un entorno en el que se unen tanto el backend (con tRPC, Node.js, Typescript, Express) como el frontend (con React, Typescript, React Router DOM, TanstackQuery y shadcn). Esta fusión de tecnologías crea un universo propio donde todo se conecta de manera eficiente, enfatizando la integración y la interoperabilidad entre todas las partes del proyecto. 

# Tabla de contenidos

1. [Contexto](https://github.com/NicoCroce/blendverse?tab=readme-ov-file#contexto)
2. [Tecnologías utilizadas](https://github.com/NicoCroce/blendverse?tab=readme-ov-file#tecnolog%C3%ADas-utilizadas)
3. [Primeros pasos](https://github.com/NicoCroce/blendverse?tab=readme-ov-file#primeros-pasos)
4. [Aplicación](https://github.com/NicoCroce/blendverse/tree/main/packages/app#readme)
5. [Servidor](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md)

# Contexto

Este proyecto se encuentra diseñado sobre un modelo `monorepo` .

Un **monorepo** es un único repositorio que alberga el código fuente de múltiples proyectos o paquetes relacionados. En lugar de tener repositorios separados para cada componente o servicio de una aplicación, todo el código se organiza en un solo repositorio, facilitando la gestión y el desarrollo de proyectos interrelacionados.

### Ventajas de un Monorepo:

1. **Facilita el Reuso de Código**: Permite compartir y reutilizar código entre diferentes proyectos o paquetes sin necesidad de publicar o versionar cada cambio, lo que acelera el desarrollo.
2. **Coordinación de Dependencias**: Al tener todos los proyectos en un solo lugar, es más sencillo coordinar y mantener las dependencias alineadas, evitando problemas de incompatibilidad.
3. **Mejor Gestión de Cambios**: Cambios en la base de código pueden afectar múltiples proyectos. Con un monorepo, es más fácil realizar y probar esos cambios de manera integral, asegurando que todo funcione en conjunto.
4. **Automatización y Herramientas de Desarrollo**: Los monorepos suelen integrarse bien con herramientas que facilitan la automatización de tareas comunes, como pruebas, construcción, y despliegue, a través de scripts compartidos y pipelines centralizados.
5. **Simplificación del Control de Versiones**: Un solo historial de commits y un flujo de trabajo de control de versiones unificado simplifican la colaboración entre equipos, ya que todos trabajan en la misma rama base.
6. **Mejor Colaboración entre Equipos**: Los equipos pueden colaborar más fácilmente, ya que el código de los diferentes proyectos está accesible y visible en el mismo lugar, promoviendo una mayor coherencia y alineación.

En resumen, un monorepo puede mejorar la productividad, la coherencia del código y la coordinación entre equipos, especialmente en proyectos grandes y complejos que involucran múltiples servicios o módulos.

## Tecnologías utilizadas

## Arquitectura del proyecto

**PNPM** 

Es un gestor de paquetes para JavaScript que es más rápido y eficiente en el uso del espacio que otros gestores como npm o Yarn. PNPM utiliza un enfoque basado en enlaces simbólicos para compartir dependencias entre proyectos, lo que reduce significativamente el espacio en disco y mejora los tiempos de instalación.

[Fast, disk space efficient package manager | pnpm](https://pnpm.io/es/)

## Tecnologías y librerías en el server

**Node.js** 

Es un entorno de ejecución de JavaScript en el servidor. Permite ejecutar código JavaScript fuera del navegador, utilizando un modelo de E/S no bloqueante y orientado a eventos, ideal para aplicaciones escalables y de alto rendimiento.

[Node.js — Run JavaScript Everywhere](https://nodejs.org/en)

**Express**

Es un framework web minimalista y flexible para Node.js, que simplifica el manejo de rutas, peticiones HTTP y middleware. Es ampliamente utilizado para construir APIs y aplicaciones web en el ecosistema de Node.js.

[Express - Infraestructura de aplicaciones web Node.js](https://expressjs.com/es/)

## Tecnologías y librerías en el front

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

## Tecnologías y librerías en el server y en el front

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
