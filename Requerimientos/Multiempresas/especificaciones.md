# Especificaciones para administrar más de una empresa con el mismo usuario

Quiero que analices los posibles escenarios para creaer un sistema multi empresas.

## Caso de uso

1. El usuario inicia sesión
2. El sistema obtiene todas las empresas a la que pertenece de la tabla `Empresas_usuarios`.
3. El sistema muestra una pantalla con todas las empresas, su imagen, nombre, algún otro dato reelevante en formato botón.
4. Si solo tiene una empresa, no se mostrará la pantalla de selección.

Quiero que armes un plan y que listes las posibilidades.

** RECUERDA PREGUNTAR TODO LO QUE NECESITES, NO QUIERO QUE SUPONGAS NADA **

## Agregar la relación entre las empresas y los usuarios

Quiero que crees todas las relaciones en el server `Empresas_usuarios`, los modelos, los las claves, etc.

Esta tabla tiene todas los usuarios con las empresas asociadas `n a n`.

La estructura es:

```
CREATE TABLE `Empresas_usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_empresa` bigint NOT NULL,
  `id_usuario` bigint NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`id_empresa`,`id_usuario`),
  KEY `id_empresa` (`id_empresa`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `Empresas_usuarios_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `Empresas` (`id`),
  CONSTRAINT `Empresas_usuarios_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
```

** Puedes consultar al MCP de mysql **

Quiero que recuperes todas las empresas para el usuario que se registró. Puedes obtenerlas de esta tabla.

## Restricciones

1. No utilices la tabla `Empresas` todo lo que consideres como datos de una empresa, usa `Sis_propietarios`.
