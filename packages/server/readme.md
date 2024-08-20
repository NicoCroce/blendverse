# Server

Este repositorio contiene una aplicación construida con **Node.js**, **Express**, **TypeScript**, y **tRPC**, siguiendo los principios de **Arquitectura Limpia**. El objetivo de este proyecto es crear una base escalable y mantenible para desarrollar servicios backend que interactúan de manera eficiente y segura con clientes frontend.

# Tabla de contenidos

1. [¿Qué es Clean Architecture y cuáles son sus ventajas?](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#clean-architecture)
2. [Responsabilidades de cada Capa](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#responsabilidades-de-cada-capa)
3. [Ejemplo aplicado a un Dominio](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#ejemplo-aplicado-a-users)
   1. [Domain](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#1-dominio-domain)
   2. [Application](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#2-aplicaci%C3%B3n-application)
   3. [Infrastructure](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#3-infraestructura-infrastructure)
4. [Tecnologías y libs](https://github.com/NicoCroce/blendverse/blob/main/packages/server/readme.md#tecnolog%C3%ADas-y-libs)

# Clean Architecture

Este enfoque te permitirá mantener un núcleo de lógica de negocio independiente de la infraestructura y de las bibliotecas específicas que estás utilizando.

La **Clean Architecture** es un estilo de arquitectura de software que organiza el código en capas, separando los aspectos de negocio y lógica de aplicación de los detalles de implementación, como la base de datos, frameworks o interfaces de usuario. Su objetivo principal es mantener la independencia de cada capa, permitiendo que cambios en una no afecten a las demás, facilitando la escalabilidad, mantenibilidad y testabilidad del software.

En Clean Architecture, las capas se organizan típicamente de la siguiente manera:

1. **Dominio**: Contiene la lógica de negocio pura, como entidades, value objects y casos de uso. No depende de detalles externos.
2. **Aplicación**: Maneja la lógica de aplicación y coordina las interacciones entre las capas externas y el dominio.
3. **Infraestructura**: Contiene detalles específicos de implementación, como bases de datos, frameworks, y controladores.

El principio central es la "dependencia hacia adentro", donde las capas externas pueden depender de las internas, pero nunca al revés.

<img width="952" alt="image" src="https://github.com/user-attachments/assets/c321e2bd-5171-4067-a5f9-da0a825ebb24">

## ¿Cómo quedan vinculadas las capas pero continuan desacopladas?

Esto se logra por medio de **Inyección de dependencias**

> La **inyección de dependencias** es un patrón de diseño que consiste en proporcionar las dependencias de un objeto desde fuera, en lugar de que el objeto las cree por sí mismo. Esto facilita la gestión de dependencias, mejora la testabilidad y promueve un código más modular y flexible.

![proceso](https://github.com/user-attachments/assets/de5f790d-894a-4312-865d-dd0326260077)

### Responsabilidades de cada Capa

1. **Domain (Dominio)**
   - **Responsabilidad:** Contiene las entidades de negocio y las interfaces de los repositorios, así como los casos de uso.
   - **Ejemplo:** Definición de un modelo de usuario y las operaciones que se pueden realizar con ese usuario.
2. **Application (Aplicación)**
   - **Responsabilidad:** Contiene los adaptadores y comunica a otros dominios. Esta capa interactúa con el dominio y la infraestructura.
   - **Ejemplo:** Implementación de adaptadores para bases de datos y otros servicios externos.
3. **Infrastructure (Infraestructura)**
   - **Responsabilidad:** Contiene la implementación concreta de los adaptadores y cualquier infraestructura necesaria (como controladores, configuraciones de bases de datos, etc.).
   - **Ejemplo:** Controladores que manejan las solicitudes HTTP y las conexiones a la base de datos.
4. **Config (Configuración)**

- **Responsabilidad:** Contiene la configuración global de la aplicación.
- **Ejemplo:** Configuración de conexión a bases de datos, variables de entorno, etc.

## Aclaraciones antes de comenzar

El proyecto se encuentra segmentado por las capas mencionadas y al mismo tiempo posee una carpeta que contiene la misma estructura de Clean Architecture definida para cada dominio.

`domains` es una carpeta que contiene cada **dominio / feature / entidad / vertical / sección** o como pueda identificarse. Es decir puede ser cada parte de la aplicación como ser _Users, Products, Orders, Payments, Auth, etc._

`Application` define Adaptadores, Interfaces, Entidades que sean globales a la aplicación y no correspondan a un dominio en particular.

`Insfrastructure` define la conexión global a BD, Auth, Routes, tRPC, middlewares, etc.

`utils` librerías y helpers que no pertenecen a un dominio en particular y pueden ser utilizado entre todos.

`data` es la carpeta que contiene los mocks de ejemplo.

<img width="293" alt="root" src="https://github.com/user-attachments/assets/fe5b0294-881e-4409-919c-1b9b49c07614">

Para entenderlo con más claridad, veamos un ejemplo dentro de `domains`

## Ejemplo aplicado a Users

### 1. Dominio (Domain)

**1.1 Entidades (Entities):**

- **Definición:** Las entidades son objetos de negocio que tienen atributos y comportamientos. Representan los datos centrales del sistema y su lógica asociada.
- **Uso:** Definir modelos de datos que son fundamentales para la lógica de negocio. Ejemplo: `User.ts`.

[https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.entity.ts#L1-L31](https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.entity.ts#L1-L31)

Dentro de dominio se definen las **entidades**, pero son las entidades de los objetos que necesita el área de producto. Es decir, lo que se va a estar representando en la aplicación y/o los datos requeridos por la gente de producto.

> _Ej: Un usuario tiene **name, email, id, etc** pero no necesita el token, los roles, etc. Eso es otra entidad que los puede relacionar._

**1.2 Value Object**

- **Definición:** Lanzan excepciones cuando los valores no cumplen con las reglas de negocio. Los ValueObject no tienen identidad propia, son inmutables y no se les asigna un identificador.
- **Uso:** Los **Value Objects** encapsulan reglas de negocio y validaciones. Si un Value Object no cumple con las reglas definidas, lanzará una excepción. La responsabilidad de manejar estas excepciones depende del contexto en el que se usan.

Como se puede observar en el código anterior `private readonly _mail: UserEmail;` es de tipo `UserEmail`y eso es un ValueObject.

Mapea los datos que van a ser representación de la Entidad. La entidad en sí es una interfaz, que hace referencia a lo que vamos a guardar, mientras que ValueObject es un middleware que hace un mapeo y valida.

Esta clase/función recibe los datos que envían los casos de uso. Es decir que desde acá defino la estructura de lo que tiene que hacer. En los `ValuObjects` voy a definir las reglas de negocio, como por ejemplo en el mail, la regex que valide el formato.

[https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/ValueObjects/UserEmail.value.ts#L1-L21](https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/ValueObjects/UserEmail.value.ts#L1-L21)

**1.3 Repositorios (Repositories):**

- **Definición:** Las interfaces de repositorios definen los métodos para interactuar con la capa de persistencia de datos (base de datos). No contienen implementación concreta.
- **Uso:** Proveer abstracciones para operaciones CRUD y otras interacciones con los datos. Ejemplo: `User.repository.ts`.

[https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.repository.ts#L1-L7](https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.repository.ts#L1-L7)

**1.4 Casos de Uso (Use Cases):**

- **Definición:** Los casos de uso (o interacciones) contienen la lógica de aplicación que no pertenece a una entidad en particular. Representan acciones que pueden ser realizadas en el sistema.
- **Uso:** Implementar la lógica que orquesta las entidades y repositorios para cumplir con un requisito de negocio específico. Ejemplo: `GetAllUsers.usecase.ts`.

[https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/UseCases/GetAllUsers.usecase.ts#L1-L11](https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/UseCases/GetAllUsers.usecase.ts#L1-L11)

Como se puede observar en este caso `userRepository` es recibido por inyección de dependencia y utilizado dentro del caso de uso.

Cada caso de uso tiene solo un método `execute` que contiene la lógica a ejecutar.

> Si bien en esta instancia se está almacenando el nuevo usuario en la base de datos, por el momento `se desconoce su implementación, solo se conoce su definición`, es decir que posee un método save pero no se conoce qué tipo de base de datos será ni su lenguaje.

### 2. Aplicación (Application)

**2.1 Servicios (Services):**

- **Definición:** Los servicios en la capa de aplicación encapsulan la lógica de casos de uso y coordinan entre la capa de dominio y la infraestructura.
- **Uso:** Implementar lógica adicional que no pertenece a la capa de dominio pero que es necesaria para los casos de uso. Ejemplo: `User.service.ts`.

[https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/domains/Users/Application/User.service.ts#L1-L36](https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/domains/Users/Application/User.service.ts#L1-L36)

> En este caso esta clase contiene un método llamado createUser y recibe los datos que enviará al caso de uso. En este ejemplo no agrega una lógica adicional, solo ejecuta el caso de uso y nada más. En ejemplos más complejos esta capa resolverá validaciones o mapeos entre la capa de Infraestructura y la capa de Dominio.

Continuando con el ejemplo, executeUseCase es un adaptador dentro de la misma capa, que permite ejecutar el caso de uso y así mismo validar su ejecución por medio de try catch.

[https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/Application/Adapters/ExecuteUseCase.ts#L9-L14](https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/Application/Adapters/ExecuteUseCase.ts#L9-L14)

### 3. Infraestructura (Infrastructure)

**3.1 Controladores (Controllers):**

- **Definición:** Los controladores manejan las solicitudes y respuestas HTTP. Actúan como una capa intermedia entre la presentación y la lógica de la aplicación.
- **Uso:** Definir los puntos finales de la API y delegar la lógica de negocio a los servicios y casos de uso. Ejemplo: `Users.controller.ts`.

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Controllers/Users.controller.ts#L1-L29](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Controllers/Users.controller.ts#L1-L29)

> Como se puede observar en el ejempo, se utiliza tRPC. En esta capa se puede utilizar por ejemplo express.

**3.2 Base de Datos (DB):**

- **Definición:** Contiene la configuración y conexión a la base de datos, así como implementaciones concretas de repositorios.
- **Uso:** Establecer conexiones a bases de datos y definir la lógica de persistencia. Ejemplo: `Local.database.ts`.

En este código vemos un ejemplo de cómo simular y configurar una BD local. En este archivo se deberá configurar toda la lógica para conectar y comunicarse con la base de datos. Por ejemplo si utilizamos mongoose se deberá configurar todo en este archivo.

[https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/domains/Users/Infrastructure/Database/Local.database.ts#L1-L37](https://github.com/NicoCroce/blendverse/blob/043df19bb3d3e3a12ae14de9807e060eb70c9646/packages/server/src/domains/Users/Infrastructure/Database/Local.database.ts#L1-L37)

En el siguiente código, podemos ver la implementación de la Interface previamente definida en el dominio y la ejecución de los métodos del esquema de la BD definido en el código de arriba.

**Implementación de Repositorio:**

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Database/UserRepository.implementation.localDB.ts#L1-L28](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Database/UserRepository.implementation.localDB.ts#L1-L28)

> Si utilizamos moongose por ejemplo para insertar un elemento en una colección, en este archivo deberemos ejecutar los métodos `create` o `save` propios del modelo definido en el paso anterior.

**3.3 Rutas:**

- **Definición:** Las rutas generalmente se definen en la capa de infraestructura, ya que están estrechamente relacionadas con la configuración del servidor web y la forma en que las solicitudes HTTP se manejan y se enrutan a los controladores correspondientes.
- **Uso:** Las rutas son definiciones que asocian URL específicas con controladores específicos. No deben contener lógica de negocio; en su lugar, simplemente delegan a los controladores.

**Definir Rutas**

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Routes/UserRoutes.ts#L1-L7](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Routes/UserRoutes.ts#L1-L7)

> En este código se encuentra la definición de un objeto, donde la `key` es la `ruta` y el `value` es el `controller`.

**Exportar rutas**

Otro archivo importante es Router, ya que establece las rutas en tRPC y genera un `type` para luego utilizar en el front.

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Routes/Router.ts#L1-L5](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/Infrastructure/Routes/Router.ts#L1-L5)

**Implementar Rutas**

Por último para tener todas las rutas funcionales, es necesario agregar en el archivo Router principal, las nuevas rutas creadas.

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/Infrastructure/Routes/Router.ts#L6](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/Infrastructure/Routes/Router.ts#L6)

**Explicación**

- **UserRoutes.ts:** En este archivo, defines las rutas específicas para las operaciones de usuario. Creas una instancia del controlador correspondiente y defines las rutas y métodos HTTP asociados.

**Conclusión**

Definir las rutas en la capa de infraestructura mantiene la lógica de enrutamiento separada de la lógica de negocio y de aplicación, lo que facilita el mantenimiento y la escalabilidad. Esta organización sigue el principio de separación de responsabilidades, promoviendo una estructura modular y clara.

**3.4 User.app (archivo init del dominio)**

Una vez definido todo, se debe:

1. Instanciar la implementación del repositorio.
2. Instanciar el service, inyectado la instancia del repositorio.
3. Instanciar el controlador, inyectando la instancia del service.

> De esta forma se vinculan todas las capas por medio de la inyección de dependencias.

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/user.app.ts#L5-L7](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/domains/Users/user.app.ts#L5-L7)

_Como_ _puede observarse, el archivo `_.app`se encuentra en el`root`de cada`dominio`.\*

### Archivo Principal (index.ts)

- **Responsabilidad:** Punto de entrada de la aplicación, inicia el servidor.
- **Uso:** Configurar y arrancar el servidor de Express, vinculación de middlewares y tRPC.

[https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/index.ts#L2-L18](https://github.com/NicoCroce/blendverse/blob/0f0f08f1a5830291a025ee665fd5ed5295a3f47b/packages/server/src/index.ts#L2-L18)

### Conclusión

Cada subcarpeta y archivo en esta estructura de Arquitectura Limpia tiene una responsabilidad bien definida, lo que facilita la comprensión, mantenimiento y escalabilidad del código. Esta separación clara permite que cada capa se enfoque en una parte específica de la lógica de la aplicación, promoviendo un diseño modular y flexible.

# Consideraciones

Dentro de `domain` se puede comunicar cualquier capa igual por más que se encuentren en diferentes dominios. Es decir, por ejemplo, es posible comunicar la capa `Application` de productos y de usuarios.

> También es posible comunicar cada capa con la que se encuentra dentro de root.

<img width="1139" alt="domain-link" src="https://github.com/user-attachments/assets/f9f81048-05bf-4131-b439-758ba4f407d2">

# Tecnologías y libs

**Node.js**

Es un entorno de ejecución de JavaScript en el servidor. Permite ejecutar código JavaScript fuera del navegador, utilizando un modelo de E/S no bloqueante y orientado a eventos, ideal para aplicaciones escalables y de alto rendimiento.

[Node.js — Run JavaScript Everywhere](https://nodejs.org/en)

**Express**

Es un framework web minimalista y flexible para Node.js, que simplifica el manejo de rutas, peticiones HTTP y middleware. Es ampliamente utilizado para construir APIs y aplicaciones web en el ecosistema de Node.js.

[Express - Infraestructura de aplicaciones web Node.js](https://expressjs.com/es/)

**TypeScript**: Es un superset de JavaScript desarrollado por Microsoft que añade tipos estáticos al lenguaje. Esto permite detectar errores en tiempo de desarrollo, mejorar la autocompletación, y facilita el mantenimiento y escalabilidad de aplicaciones grandes. TypeScript se compila a JavaScript puro, lo que lo hace compatible con cualquier entorno donde JavaScript se ejecute, como navegadores y Node.js.

[JavaScript With Syntax For Types.](https://www.typescriptlang.org/)

**tRPC**: Es una biblioteca para crear APIs basadas en TypeScript sin necesidad de definir contratos API manualmente. Permite que el cliente y el servidor compartan tipos, asegurando que los contratos estén sincronizados y sean seguros, lo que reduce errores y mejora la productividad.

[tRPC - Move Fast and Break Nothing. End-to-end typesafe APIs made easy. | tRPC](https://trpc.io/)
