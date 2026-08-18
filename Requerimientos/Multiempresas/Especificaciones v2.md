# PRD (Product Requirements Document)

> **Nota para Spec-kit / Blendverse:**
> Este documento sirve como punto de partida para que la fase de diseño (agentes `speckit.specify`) comprenda funcionalmente qué se debe construir y puedan generar un `spec.md` sin ambigüedades.

## 1. Contexto y Visión General

- **Problema a resolver**: No puedo identificar en qué empresas se encuentra un mismo usuario.
- **Objetivo principal**: Quiero determinar en qué empresas se encuentra un mismo usuario.

## 2. Usuarios y Multi-tenant

- **Roles involucrados**: por defecto.
- **Consideraciones Múltiples Empresas**: el owner id se comporta de forma normal.

## 3. Alcance (In Scope)

- [ ] Si el usuario que inició sesión se encuentra en `msportalV2.Empresas_usuarios` pertenece a más de una empresa y el sistema irá por el caso de mostrar la pantalla para seleccionar la empresa, de lo contrario, tomará el valor de ` msportalV2.Usuarios` la columna `id_propietario` .

## 4. Fuera de Alcance (Out of Scope)

- NO Agregar tablas nuevas. Resolver con las tablas existentes.

## 5. Historias de Usuario y Criterios de Aceptación

_(Base para los tests de `@blendverse.tester` y validación de `@blendverse.qa`)_

**HU1: Como usuario, quiero visualizar todas las empresas a las que pertenezco para seleccionar la que quiero administrar.**

- **Criterios de Aceptación**:
  - El usuario inicia sesión y se encuentra en la tabla `msportalV2.Empresas_usuarios`. Por lo que visualiza todas las empresas a la que pertenece.
  - Dado que el cliente pertenece a más de una empresa, cuando selecciona una, entonces ingresa al sistema con esa empresa en el JWT.

**HU1: Como usuario, quiero visualizar la empresa a la que pertenezco para administrar.**

- **Criterios de Aceptación**:
  - El usuario inicia sesión y NO se encuentra en la tabla `msportalV2.Empresas_usuarios`. Por lo que ingresa directamente al sistema.

**QUIERO QUE SUGIERAS OTRAS HISTORIAS DE USUARIOS QUE PUEDAS IDENTIFICAR**

## 6. Reglas de Negocio

- Listar cálculos, estados, validaciones de Zod obligatorias o flujos condicionales de la lógica de negocio.

## 7. Experiencia de Usuario UI/UX

- Quiero que se. visualice en una pantalla al 100% de ancho.
- quiero que se muestren todas las empresas a la que pertenece el usuario.
- El resto de la experiencia, utiliza lo que ya existe.
