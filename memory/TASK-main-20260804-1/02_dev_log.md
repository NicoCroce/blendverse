---
task_id: 'TASK-main-20260804-1'
agent: 'Front_Agent'
status: 'IMPLEMENTED'
attempts: 1
date: '2026-08-04'
affected_files:
  - 'packages/app/src/Domains/Admin/Empleados/EmployeeCards.tsx'
---

# Log de Desarrollo — Rediseño mobile admin/empleados (iteración 2: filas label:valor en cards)

## Archivos Creados

Sin archivos creados en esta sesión.

## Archivos Modificados

| Archivo                                                      | Cambio aplicado                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/app/src/Domains/Admin/Empleados/EmployeeCards.tsx` | En la vista mobile, se reemplazaron los dos badges apilados (Renovar clave / estado de firma) por dos filas `Label: Valor` (`Debe renovar contraseña` → Sí/No según `renovar_clave`; `Debe firmar términos` → Sí/No según `estado_firma !== 'Firmado'`). Se eliminaron los imports de `Badge` y de los helpers de variantes. `items-center` → `items-start` en la card para anclar el checkbox a la línea de persona. |

## Decisiones Técnicas

- **[Filas label:valor en vez de badges]:** El usuario pidió reemplazar los badges por filas discretas `Label: Valor` para mejorar el escaneo del estado en mobile. Se usó un `<dl>` semántico con dos filas `dt`/`dd`.
- **[Alineación justify-between]:** Labels a la izquierda en `text-muted-foreground`, valores a la derecha en `text-foreground font-medium` con `shrink-0`; ambos valores quedan alineados en el borde derecho de la card, consistente entre las dos filas. Alternativa descartada: label y valor inline (`Debe renovar contraseña: Sí`), menos scaneable con labels largos.
- **[items-start en la card]:** Al crecer el contenido (2 filas nuevas), `items-center` centraría el checkbox respecto al alto total de la card; `items-start` lo ancla a la línea de persona, coherente con la alineación de fila de la tabla de escritorio.
- **[Semántica Corrupto → "Sí" en "Debe firmar términos"]:** `estado_firma !== 'Firmado'` cubre `Pendiente` y `Corrupto`. Un estado de firma corrupto implica que los términos no están firmados de forma válida, por lo que el empleado debe firmar de nuevo; el valor refleja la necesidad de acción, no el estado crudo.
- **[Imports eliminados]:** `Badge`, `getRenovarClaveVariant` y `getEstadoFirmaVariant` quedaron sin uso en `EmployeeCards.tsx` y se removieron del import. Los helpers de `columns.tsx` NO se tocaron (la tabla de escritorio los sigue usando). `IEmployeeRecord` se mantiene (tipa las props).

## Deuda Técnica Conocida

- `CardsSkeleton` en `EmpleadosPage.tsx` aún renderiza placeholders de pills (formas de badges) que ya no coinciden con la anatomía de la card; fuera de alcance de esta sesión (cambio restringido a `EmployeeCards.tsx`). Pendiente de decidir si se ajusta en una iteración posterior.
