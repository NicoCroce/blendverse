---
agent: agent
description: Agrega un caso de uso nuevo a un dominio del servidor ya existente. Crea el archivo usecase, lo registra en el índice de UseCases, lo inyecta en el Service y lo registra en el contenedor Awilix.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@back`. Vas a agregar un nuevo caso de uso a un dominio existente en `packages/server`.

**Pasos obligatorios:**

1. Lee los siguientes archivos del dominio `{{domain}}`:

   - `Domain/{{entity}}.interfaces.ts` → para ver las interfaces existentes
   - `Domain/{{entity}}.repository.ts` → para ver los métodos de repositorio disponibles
   - `Application/UseCases/index.ts` → para ver los use cases existentes
   - `Application/{{domain}}.service.ts` → para ver cómo inyectar el nuevo use case
   - `{{domainLower}}.app.ts` → para ver el registro Awilix actual

2. Crea el nuevo use case:

   - Archivo: `Application/UseCases/{{useCaseName}}.usecase.ts`
   - Implementa `IUseCase<TOutput>`
   - Usa `AppError` si necesita lanzar errores de dominio

3. Si el use case necesita un nuevo método de repositorio:

   - Agregar la interfaz en `Domain/{{entity}}.interfaces.ts`
   - Agregar el método abstracto en `Domain/{{entity}}.repository.ts`
   - Implementar el método en `Infrastructure/Database/{{entity}}Repository.implementation.ts`

4. Actualiza `Application/UseCases/index.ts` → agrega `export * from './{{useCaseName}}.usecase'`

5. Actualiza `Application/{{domain}}.service.ts`:

   - Agrega el use case como parámetro del constructor
   - Agrega el método público que llama a `executeUseCase`

6. Actualiza `{{domainLower}}.app.ts`:

   - Agrega `_{{useCaseCamel}}: asClass({{UseCaseName}})` al objeto del dominio

7. Si el use case debe ser accesible vía API, agrega el procedure en el Controller y en las Routes.

8. Verifica que no haya errores de TypeScript en los archivos modificados.

**Datos del use case:**

- Dominio: `{{domain}}` (carpeta: `packages/server/src/domains/{{domain}}/`)
- Nombre del use case: `{{useCaseName}}`
- Descripción: {{description}}
