# Frontend Design — Documents Filters (Estado de Conformidad)

**Feature**: `documents-filters` · **Artefacto**: dirección visual (no mockup)

---

## 1. Grounding del brief

- **Subject**: el selector de estado de conformidad de documentos dentro del formulario de filtros de la pantalla de Documentos.
- **Audiencia**: empleados y admins. El empleado quiere saber "qué me queda por firmar" y "cómo firmé lo que firmé"; el admin quiere revisar el estado de firma de los documentos de su empresa.
- **Job único del componente**: comunicar de un vistazo en qué punto del ciclo de firma está un documento, y dejar elegir un único bucket con una sola acción.

La dirección visual no crea una pantalla nueva: es la extensión de un control existente (`FiltersDocumentsForm`) dentro del sistema de diseño actual. Por eso la dirección se apoya en los tokens ya definidos y gasta su audacia en **un solo elemento: la semántica de color de los estados de firma**.

## 2. Token system

### Paleta (derivada del sistema existente, `index.css`)

El sistema define un primario naranja (`24 92% 49%`), ring rosa y neutros slate. La dirección agrega **solo** los tokens de estado, reutilizando el resto sin introducir color nuevo arbitrario:

| Token                                          | Hex                   | Rol                                                                     |
| ---------------------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `--background`                                 | `#FFFFFF`             | fondo del sheet/panel de filtros                                        |
| `--primary`                                    | `hsl(24 92% 49%)`     | opción activa del selector (patrón `ToggleGroup` actual)                |
| `--foreground`                                 | `hsl(240 10% 3.9%)`   | etiqueta y opciones no activas                                          |
| `--muted-foreground`                           | `hsl(240 3.8% 46.1%)` | helper de descripción del selector                                      |
| `--success` (nuevo, reuso de `chart-1` family) | `hsl(347 77% 50%)`    | NO se usa en el selector — el rosa/verde no debe teñir la opción activa |
| `--border`                                     | `hsl(240 5.9% 90%)`   | contorno del `ToggleGroup` outline                                      |

**Decisión de color clave**: el color **no** se usa para teñir cada bucket (verde=conformidad, rojo=sin conformidad). El bucket activo se marca con el `primary` naranja existente y el `buttonGroupActiveClass` ya en uso. Teñir de verde/rojo por estado anticipa juicios de valor (bueno/malo) que el negocio no hace: "sin conformidad" no es un error, es un resultado con motivo. La semántica de color se reserva para **el badge de estado en la fila del documento** (fuera de esta feature, ya existente), no para el filtro.

### Tipografía (roles)

| Rol                       | Fuente                                               | Uso                                             |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Label (display del field) | `font-medium text-sm` (estándar `Label` del sistema) | "Estado de conformidad"                         |
| Body del selector         | `text-sm` (estándar `ToggleGroupItem`)               | Pendientes / Bajo conformidad / Sin conformidad |
| Utility / helper          | `text-xs text-muted-foreground`                      | descripción opcional debajo del selector        |

Sin fuentes nuevas: el control vive dentro de un form existente y hereda la escala del sistema. La tipografía no es el elemento de memoria aquí.

### Layout

- El field es un bloque vertical: `Label` arriba, `ToggleGroup` `type="single"` debajo, envolviendo en `Container space="small"` (idéntico a los fields actuales del form).
- Las 3 opciones en una fila, `justify-start gap-4`, con `flex-wrap` para no romper en móvil.
- Reemplaza al `ToggleGroup` actual de Pendientes/Validados sin cambiar el contenedor ni el SheetFooter.

### Elemento firma único

**El `ToggleGroup` de tres estados con `state=sin_conformidad` como opción de primera clase.**

Es el elemento que el usuario va a recordar: hoy el filtro solo dice "pendiente vs validado" (binario), y el control nuevo dice tres cosas que el negocio realmente distingue, sin color de juicio. La firma es la **rejilla de tres estados** donde el estado medio ("Bajo conformidad") es el matiz que antes no existía. Todo lo demás se mantiene deliberadamente quieto para que esa distinción sea lo único que cambia.

## 3. Wireframe de referencia

```
┌────────────────────────────────────────┐
│ Nombre del documento                   │  ← field existente, sin cambios
│ [ _______________________________ ]    │
├────────────────────────────────────────┤
│ Estado de conformidad                  │  ← field NUEVO (componente DocumentsStateFilterField)
│ ┌──────────┐ ┌────────────────┐ ┌─────┐ │
│ │Pendientes│ │Bajo conformidad│ │Sin  │ │  ← ToggleGroup, activo = primary naranja
│ └──────────┘ └────────────────┘ └─────┘ │
│                                         │
│ Segmentos (solo admin)                  │  ← field existente
│ [ Filtrar por segmentos      ▾ ]        │
├────────────────────────────────────────┤
│                [Limpiar filtros][Aplicar]│
└────────────────────────────────────────┘
```

## 4. Self-critique (segunda pasada)

- **Descartado: teñir cada bucket de un color** (verde/rojo/ámbar). Lee como "bueno/malo/pendiente" y es el default genérico de cualquier filtro de estado. Además introduce tokens que no existen en el sistema. El negocio trata los tres estados como neutros; el color se reserva al badge de la fila.
- **Descartado: crear una pantalla de estado nueva o mockup hero**. El brief es un control de un form existente; una dirección visual "de página" no aplica. La disciplina es no gastar tokens ni layout nuevos donde el form ya resuelve.
- **Mantenido a propósito: nomenclatura exacta** "Bajo conformidad" / "Sin conformidad" en los labels. Es el vocabulario del dominio (firma bajo acuerdo, motivo de firma sin conformidad); el control lo usa literal para que el usuario aprenda la terminología del producto, no una versión dulcificada.
- **Riesgo asumido**: la opción activa usa `--primary` naranja igual que el ToggleGroup actual; es deliberado para no diferenciar un campo de filtro del resto del form (el elemento firma es la existencia de las 3 opciones, no su color).

## 5. Decisiones que el plan técnico debe respetar

- Componente nuevo en `Domains/Documents/Components/` (patrón wrapper `SegmentsFilterField`: etiqueta + selector), visible para **todos** los roles (sin `DASHBOARD_ACCESS`).
- El campo usa el `ToggleGroup` existente con `buttonGroupActiveClass`; sin tokens de color nuevos.
- Labels literales del dominio: "Pendientes", "Firmados bajo conformidad", "Firmados sin conformidad" (display) con valores de URL `pendientes` / `bajo_conformidad` / `sin_conformidad`.
