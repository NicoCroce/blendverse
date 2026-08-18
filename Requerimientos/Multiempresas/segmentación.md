# Especificaciones para administrar más de una empresa con el mismo usuario

Quiero que analices los posibles escenarios para segmentar a los usuarios por n popiedades. Puede ser "Centro de costos, Convenio, categoría, Sección, departamento, etc".

## Caso de uso

1. El usuario visualiza el listado de documentos y licencias.
2. Dentro de los filtros puede ver todos los segmentos.
3. Al filtrar solo muestra los segmentos correspondientes.

Quiero que armes un plan y que listes las posibilidades.

** RECUERDA PREGUNTAR TODO LO QUE NECESITES, NO QUIERO QUE SUPONGAS NADA **

## Agregar la relación entre tipos_segmentos, segmentos_usuarios

Quiero que crees todas las relaciones en la bd `dev_macrogest`, los modelos, los las claves, etc.

Esta tabla tiene todas los usuarios con los segmentos asociadas `n a n`.

**Puedes consultar al MCP de mysql y listar las tablas que vas a utilizar porque existen**

Quiero que crees un archivo mysql con todas las queries necesarias para ejecutar de forma manual. El archivo estará en la carpeta sql en el root y se llamará "queries_segmentos"

## Restricciones

1. No quiero que analices nada de Admin.
2. Solo trabajar con los filtros y los segmentos.
3. No supongas nada, quiero que me preguntes lo que necesites.
