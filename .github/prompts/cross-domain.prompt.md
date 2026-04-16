---
agent: agent
description: Conecta dos dominios del servidor mediante inyección de casos de uso. Sigue el patrón de cross-domain-relations para evitar acoplamiento directo entre repositorios.
tools: [read/readFile, edit/createFile, edit/editFiles]
---

Actúa como el agente `@back`. Carga y sigue estrictamente la skill `cross-domain-relations`.

El usuario quiere relacionar datos entre dos dominios del servidor. El dominio **consumidor** necesita datos del dominio **proveedor**, pero sin importar su repositorio directamente.

**Antes de escribir código:**

1. Lee los archivos del dominio proveedor:

   - `packages/server/src/domains/{{providerDomain}}/Domain/{{providerEntity}}.interfaces.ts`
   - `packages/server/src/domains/{{providerDomain}}/Domain/{{providerEntity}}.repository.ts`
   - `packages/server/src/domains/{{providerDomain}}/Application/UseCases/index.ts`
   - `packages/server/src/domains/{{providerDomain}}/{{providerDomainLower}}.app.ts`

2. Lee los archivos del dominio consumidor:

   - `packages/server/src/domains/{{consumerDomain}}/Application/UseCases/{{consumerUseCase}}.usecase.ts`
   - `packages/server/src/domains/{{consumerDomain}}/{{consumerDomainLower}}.app.ts`

3. Aplica el patrón de la skill:

   - **Si no existe** el caso de uso en el proveedor: crearlo en `{{providerDomain}}/Application/UseCases/`, registrarlo en `index.ts` y en `{{providerDomainLower}}.app.ts`.
   - **Inyectar** el caso de uso del proveedor en el constructor del caso de uso consumidor.
   - **Registrar** el caso de uso del proveedor en el `{{consumerDomainLower}}.app.ts` (importándolo desde `@server/domains/{{providerDomain}}`).
   - **Usar** `executeUseCase` para invocarlo dentro del `execute()` del consumidor.

4. Verifica que no haya errores de TypeScript en los archivos modificados.

**Datos de la relación:**

- Dominio proveedor: `{{providerDomain}}`
- Entidad proveedora: `{{providerEntity}}`
- Caso de uso a pedir: `{{providerUseCase}}` (ej. `GetEmailsByUsersId`)
- Dominio consumidor: `{{consumerDomain}}`
- Caso de uso consumidor que lo necesita: `{{consumerUseCase}}`
- Descripción del dato necesario: {{dataDescription}}
