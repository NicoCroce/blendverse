# Arquitectura Limpia en Node.js con TypeScript y tRPC

Este proyecto implementa una **Arquitectura Limpia** (Clean Architecture) en una aplicación Node.js utilizando TypeScript y tRPC para los servicios. La arquitectura se divide en tres capas principales: **Dominio**, **Aplicación** e **Infraestructura**. A continuación, se detalla la función y responsabilidad de cada capa.

## 1. Dominio

### Descripción

La capa de **Dominio** es el corazón de la aplicación. Contiene toda la **lógica de negocio**, incluyendo **entidades**, **objetos de valor**, **casos de uso** e **interfaces de repositorio**. Esta capa es **independiente de detalles técnicos** como frameworks, bases de datos o cualquier otra tecnología externa.

### Componentes

- **Entidades:** Representan los objetos de negocio con sus propiedades y comportamientos. Por ejemplo, un `Usuario`, `Grupo`, etc.

- **Objetos de Valor (Value Objects):** Objetos que se definen por sus atributos y no por una identidad única. Por ejemplo, una `Dirección` o un `Email`.

- **Casos de Uso (Use Cases):** Encapsulan las operaciones y reglas de negocio que la aplicación debe cumplir. Por ejemplo, `CrearUsuario`, `EliminarGrupo`, etc.

- **Interfaces de Repositorio:** Definen contratos para operaciones de persistencia sin especificar detalles de implementación. Por ejemplo, `IUsuarioRepositorio` con métodos como `obtenerPorId`, `guardar`, etc.

### Objetivos

- **Independencia Tecnológica:** Permite cambiar detalles de implementación sin afectar la lógica de negocio.

- **Testabilidad:** Facilita la escritura de pruebas unitarias aisladas de detalles técnicos.

## 2. Aplicación

### Descripción

La capa de **Aplicación** actúa como un **mediador** entre el Dominio y la Infraestructura. Se encarga de **orquestar** las operaciones, **implementar las interfaces de repositorio** definidas en el Dominio y manejar aspectos técnicos que no pertenecen al Dominio.

### Componentes

- **Implementaciones de Repositorios:** Realizan las operaciones concretas de persistencia basándose en las interfaces definidas en el Dominio.

- **Servicios de Aplicación:** Pueden incluir lógica adicional para procesar datos, manejar transacciones, o integrar servicios externos.

### Objetivos

- **Aislamiento de la Lógica de Negocio:** Separa las preocupaciones técnicas de la lógica de negocio pura.

- **Flexibilidad:** Facilita cambios en tecnologías o servicios externos sin impactar al Dominio.

## 3. Infraestructura

### Descripción

La capa de **Infraestructura** contiene todos los detalles técnicos y de implementación, incluyendo **controladores**, **rutas**, **conexiones a bases de datos**, y cualquier otra integración externa.

### Componentes

- **Controladores (Controllers):** Manejan las solicitudes entrantes, interactúan con los casos de uso de la capa de Aplicación y retornan respuestas adecuadas.

- **Rutas:** Definen los endpoints de la API y asignan controladores a cada ruta.

- **Implementaciones de Base de Datos:** Configuran y manejan las conexiones a la base de datos, ORM, migraciones, etc.

- **Integraciones Externas:** Servicios externos, colas de mensajes, servicios de correo, etc.

### Objetivos

- **Encapsulación de Detalles Técnicos:** Mantiene los detalles de implementación separados de las capas superiores.

- **Configurabilidad:** Permite modificar o reemplazar tecnologías sin afectar la lógica de negocio o la orquestación de la aplicación.

## Beneficios de la Arquitectura Limpia

- **Mantenibilidad:** La separación clara de responsabilidades facilita el mantenimiento y evolución del software.

- **Escalabilidad:** Cada capa puede escalarse de manera independiente según las necesidades.

- **Testabilidad:** La independencia de la lógica de negocio respecto a detalles técnicos permite pruebas más efectivas y aisladas.

- **Flexibilidad:** Cambios en tecnologías, frameworks o servicios externos pueden realizarse con un impacto mínimo en la aplicación.

---

Este proyecto sigue estos principios para asegurar un desarrollo sostenible, flexible y de alta calidad. Para más detalles sobre la implementación específica en este repositorio, por favor, revisa la documentación en cada uno de los módulos correspondientes.

# Clean Architecture - Ejemplos

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

   ### 1. Dominio (Domain)

   - **1.1 Entidades (Entities):**

     - **Definición:** Las entidades son objetos de negocio que tienen atributos y comportamientos. Representan los datos centrales del sistema y su lógica asociada.
     - **Uso:** Definir modelos de datos que son fundamentales para la lógica de negocio. Ejemplo: `User.ts`.

     https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.entity.ts#L1-L31

     Dentro de dominio se definen las **entidades**, pero son las entidades de los objetos que necesita el área de producto. Es decir, lo que se va a estar representando en la aplicación y/o los datos requeridos por la gente de producto.
     Ej: _Un usuario tiene **name, email, id, etc** pero no necesita el token, los roles, etc. Eso es otra entidad que los puede relacionar._

   - **1.2 Value Object**
     Como se puede observar en el código anterior `private readonly _mail: UserEmail;` es de tipo `UserEmail`y eso es un ValueObject.
     Mapea los datos que van a ser representación de la Entidad. La entidad en sí es una interfaz, que hace referencia a lo que vamos a guardar, mientras que ValueObject es un middleware que hace un mapeo y valida.
     Esta clase/función recibe los datos que envían los casos de uso. Es decir que desde acá defino la estructura de lo que tiene que hacer. En los value objects voy a definir las reglas de negocio, como por ejemplo en el mail, la regex que valide el formato.

     https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/ValueObjects/UserEmail.value.ts#L1-L21

   - **1.3 Repositorios (Repositories):**

     - **Definición:** Las interfaces de repositorios definen los métodos para interactuar con la capa de persistencia de datos (base de datos). No contienen implementación concreta.
     - **Uso:** Proveer abstracciones para operaciones CRUD y otras interacciones con los datos. Ejemplo: `User.repository.ts`.

     https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/User.repository.ts#L1-L7

   - **1.4 Casos de Uso (Use Cases):**

     - **Definición:** Los casos de uso (o interacciones) contienen la lógica de aplicación que no pertenece a una entidad en particular. Representan acciones que pueden ser realizadas en el sistema.
     - **Uso:** Implementar la lógica que orquesta las entidades y repositorios para cumplir con un requisito de negocio específico. Ejemplo: `GetAllUsers.usecase.ts`.

     https://github.com/NicoCroce/blendverse/blob/34d3e42d74c321e9cb6c71103a20adaec242c4b1/packages/server/src/domains/Users/Domain/UseCases/GetAllUsers.usecase.ts#L1-L11

   ### 2. Aplicación (Application)

   - **2.1 Interfaces (Interfaces):**

     - **Definición:** Las interfaces en esta capa son adaptadores que definen cómo interactuar con servicios externos o infraestructuras concretas.
     - **Uso:** Proveer contratos para la implementación de adaptadores concretos en la infraestructura. Ejemplo: `UserRepository.ts`.

     ```tsx
     // src/application/interfaces/UserRepository.ts
     import { User } from '../../domain/entities/User';

     export interface UserRepository {
       save(user: User): Promise<void>;
       findById(id: string): Promise<User | null>;
     }
     ```

   - **2.2 Servicios (Services):**

     - **Definición:** Los servicios en la capa de aplicación encapsulan la lógica de casos de uso y coordinan entre la capa de dominio y la infraestructura.
     - **Uso:** Implementar lógica adicional que no pertenece a la capa de dominio pero que es necesaria para los casos de uso. Ejemplo: `CreateUserService.ts`.

     ```tsx
     // src/application/services/CreateUserService.ts
     import { UserRepository } from '../../domain/repositories/UserRepository';
     import { CreateUser } from '../../domain/use-cases/CreateUser';

     export class CreateUserService {
       constructor(private userRepository: UserRepository) {}

       async createUser(name: string, email: string) {
         const createUser = new CreateUser(this.userRepository);
         return await createUser.execute(name, email);
       }
     }
     ```

   ### 3. Infraestructura (Infrastructure)

   - **3.1 Controladores (Controllers):**

     - **Definición:** Los controladores manejan las solicitudes y respuestas HTTP. Actúan como una capa intermedia entre la presentación y la lógica de la aplicación.
     - **Uso:** Definir los puntos finales de la API y delegar la lógica de negocio a los servicios y casos de uso. Ejemplo: `UserController.ts`.

     ```tsx
     // src/infrastructure/controllers/UserController.ts
     import { Request, Response } from 'express';
     import { CreateUserService } from '../../application/services/CreateUserService';

     export class UserController {
       constructor(private createUserService: CreateUserService) {}

       async create(req: Request, res: Response): Promise<void> {
         const { name, email } = req.body;
         const user = await this.createUserService.createUser(name, email);
         res.status(201).json(user);
       }
     }
     ```

   - **3.2 Base de Datos (DB):**

     - **Definición:** Contiene la configuración y conexión a la base de datos, así como implementaciones concretas de repositorios.
     - **Uso:** Establecer conexiones a bases de datos y definir la lógica de persistencia. Ejemplo: `MongoDBConnection.ts`.

     ```tsx
     // src/infrastructure/db/MongoDBConnection.ts
     import { MongoClient, Db } from 'mongodb';

     export class MongoDBConnection {
       private static instance: MongoDBConnection;
       private db: Db;

       private constructor() {
         const client = new MongoClient('mongodb://localhost:27017');
         this.db = client.db('mydatabase');
       }

       public static getInstance(): MongoDBConnection {
         if (!MongoDBConnection.instance) {
           MongoDBConnection.instance = new MongoDBConnection();
         }
         return MongoDBConnection.instance;
       }

       public getDb(): Db {
         return this.db;
       }
     }
     ```

     **Implementación de Repositorio:**

     ```tsx
     // src/infrastructure/db/UserRepositoryImpl.ts
     import { UserRepository } from '../../domain/repositories/UserRepository';
     import { User } from '../../domain/entities/User';
     import { MongoDBConnection } from './MongoDBConnection';

     export class UserRepositoryImpl implements UserRepository {
       private db = MongoDBConnection.getInstance().getDb();

       async save(user: User): Promise<void> {
         await this.db.collection('users').insertOne(user);
       }

       async findById(id: string): Promise<User | null> {
         const user = await this.db.collection('users').findOne({ id });
         return user ? new User(user.id, user.name, user.email) : null;
       }
     }
     ```

   - **3.3 Rutas:**
     - **Definición:** Las rutas generalmente se definen en la capa de infraestructura, ya que están estrechamente relacionadas con la configuración del servidor web y la forma en que las solicitudes HTTP se manejan y se enrutan a los controladores correspondientes.

   ### Ejemplo de Definición de Rutas

   ***

   **1. Definir Rutas (userRoutes.ts)**

   ```tsx
   // src/infrastructure/routes/userRoutes.ts
   import { Router } from 'express';
   import { UserController } from '../controllers/UserController';
   import { UserRepositoryImpl } from '../db/UserRepositoryImpl';
   import { CreateUserService } from '../../application/services/CreateUserService';

   const userRoutes = Router();
   const userRepository = new UserRepositoryImpl();
   const createUserService = new CreateUserService(userRepository);
   const userController = new UserController(createUserService);

   userRoutes.post('/users', (req, res) => userController.create(req, res));

   export default userRoutes;
   ```

   **2. Configurar Rutas en la Aplicación (app.ts)**

   ```tsx
   // src/app.ts
   import express from 'express';
   import userRoutes from './infrastructure/routes/userRoutes';

   const app = express();

   app.use(express.json());
   app.use('/api', userRoutes);

   export default app;
   ```

   ### Explicación

   - **userRoutes.ts:** En este archivo, defines las rutas específicas para las operaciones de usuario. Creas una instancia del controlador correspondiente y defines las rutas y métodos HTTP asociados. En este ejemplo, se define una ruta POST para crear usuarios.
   - **app.ts:** En el archivo `app.ts`, importas y usas las rutas definidas en `userRoutes.ts`. Esto asegura que todas las solicitudes a `/api/users` sean manejadas por las rutas definidas en `userRoutes.ts`.

   ### Conclusión

   Definir las rutas en la capa de infraestructura mantiene la lógica de enrutamiento separada de la lógica de negocio y de aplicación, lo que facilita el mantenimiento y la escalabilidad. Esta organización sigue el principio de separación de responsabilidades, promoviendo una estructura modular y clara.

   ### Configuración (Config)

   **Definición:** La configuración global de la aplicación, que puede incluir variables de entorno, configuraciones de conexión, etc.
   **Uso:** Centralizar la configuración y hacerla accesible en toda la aplicación. Ejemplo: `default.ts`.

   ```tsx
   // src/config/default.ts
   export default {
     db: {
       url: 'mongodb://localhost:27017',
       name: 'mydatabase',
     },
   };
   ```

   ### Archivos Principales (server.ts y app.ts)

   **Server.ts:**

   - **Responsabilidad:** Punto de entrada de la aplicación, inicia el servidor.
   - **Uso:** Configurar y arrancar el servidor de Express.

   ```tsx
   // src/server.ts
   import app from './app';

   const port = 3000;

   app.listen(port, () => {
     console.log(`Server running at <http://localhost>:${port}`);
   });
   ```

   **App.ts:**

   - **Responsabilidad:** Configurar middlewares y rutas principales.
   - **Uso:** Inicializar la configuración de la aplicación y los controladores.

   ```tsx
   // src/app.ts
   import express from 'express';
   import { UserController } from './infrastructure/controllers/UserController';
   import { UserRepositoryImpl } from './infrastructure/db/UserRepositoryImpl';
   import { CreateUserService } from './application/services/CreateUserService';

   const app = express();
   const userRepository = new UserRepositoryImpl();
   const createUserService = new CreateUserService(userRepository);
   const userController = new UserController(createUserService);

   app.use(express.json());
   app.post('/users', (req, res) => userController.create(req, res));

   export default app;
   ```

   ### Conclusión

   Cada subcarpeta y archivo en esta estructura de Arquitectura Limpia tiene una responsabilidad bien definida, lo que facilita la comprensión, mantenimiento y escalabilidad del código. Esta separación clara permite que cada capa se enfoque en una parte específica de la lógica de la aplicación, promoviendo un diseño modular y flexible.
