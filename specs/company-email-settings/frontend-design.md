# Dirección de diseño frontend — Company Email Settings

## Brief aterrizado

- **Sujeto**: el sistema de comunicaciones automáticas de una empresa.
- **Audiencia**: administradores que necesitan controlar envíos sensibles sin leer documentación técnica.
- **Único trabajo de la pantalla**: responder con confianza **qué se envía, a quién y con qué contenido**.

La pantalla no se plantea como un formulario de preferencias. Se plantea como una **torre de control de comunicaciones**: primero hace visible el tráfico activo, después permite ajustar destinatarios y contenido.

## Dirección visual

### Sistema de tokens

| Token        | Valor     | Uso                                                                 |
| ------------ | --------- | ------------------------------------------------------------------- |
| `ink-950`    | `#0B0A16` | Fondo principal y zonas de máxima densidad                          |
| `indigo-900` | `#171538` | Superficies elevadas y paneles de edición                           |
| `violet-500` | `#8875FF` | Acciones, foco, enlaces y rutas activas                             |
| `ice-100`    | `#EEF0FF` | Texto principal y contraste sobre fondo oscuro                      |
| `slate-400`  | `#9B9BB8` | Texto secundario, metadatos y estados inactivos                     |
| `amber-400`  | `#F6B84B` | Riesgo: sin destinatarios, términos pendientes, cambios sin guardar |

El ámbar es deliberadamente escaso: no significa “advertencia genérica”, sino una decisión que puede impedir o alterar una comunicación.

### Tipografía

- **Display / títulos**: `Sora`, con peso 600, para dar a la pantalla una voz técnica pero humana. Usar solo en el título principal y cifras de estado.
- **Body / controles**: `Manrope`, pesos 400–700, para labels, descripciones y contenido editable.
- **Utility / estados**: `IBM Plex Mono`, peso 500, para audiencias, conteos, timestamps y etiquetas de ruta.

Fallbacks: `Sora, Manrope, ui-sans-serif, system-ui, sans-serif` y `IBM Plex Mono, ui-monospace, monospace`.

## Composición

Una vista vertical única, con una columna de contenido de lectura cómoda y un rail lateral de contexto en desktop. No usar una grilla de tarjetas iguales: cada zona debe comunicar una decisión distinta.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ COMUNICACIONES DE LA EMPRESA                         [Guardar cambios]│
│ Qué sale, quién lo recibe y qué versión está vigente                 │
├───────────────────────────────┬──────────────────────────────────────┤
│ ESTADO DE LA RED               │ CONTEXTO                             │
│ 07 / 09 rutas activas           │ Última actualización                 │
│ ────────────────────────────── │ Versión 12 · hace 4 min              │
│ ● Empleados                    │                                      │
│   empleado ───────► empresa    │ ⚠ 1 decisión pendiente                │
│   Cambio de licencia     ON    │ Sin destinatarios para reporte       │
│                               │                                      │
│ ● Administradores              │                                      │
│   sistema ───────────► admin  │                                      │
│   Reporte matutino        ON   │                                      │
├───────────────────────────────┴──────────────────────────────────────┤
│ 01  RUTAS DE ENTREGA                                                 │
│     Cada línea representa una comunicación real                        │
│     [audiencia]  origen ───────── destino             [ON/OFF]         │
├──────────────────────────────────────────────────────────────────────┤
│ 02  DESTINATARIOS ADMINISTRATIVOS                                    │
│     [ana@empresa.com] [lucas@empresa.com]             [+ Agregar]     │
├──────────────────────────────────────────────────────────────────────┤
│ 03  REPORTE DE LA MAÑANA                                             │
│     [✓] Resumen  [✓] Pendientes  [ ] Vacaciones ...                   │
├──────────────────────────────────────────────────────────────────────┤
│ 04  CONTENIDO                                                         │
│     [Mensaje de inicio] [Términos y condiciones]      [Vista previa]  │
└──────────────────────────────────────────────────────────────────────┘
```

### Jerarquía de zonas

1. **Resumen operativo**: abre con una cifra grande (`07 / 09`) y una lectura textual (`rutas activas`). Nunca depende solo del color.
2. **Rutas de entrega**: ocupa el primer lugar de edición. Agrupa por audiencia y usa filas de ruta, no tarjetas independientes.
3. **Destinatarios administrativos**: lista de chips con email completo, estado válido y acción de quitar; el estado vacío contiene una acción directa para agregar el primero.
4. **Reporte de la mañana**: selector de secciones con una frase de resultado (“se incluirá en el próximo reporte”), sin permitir elegir horario en esta versión.
5. **Contenido**: tabs o segmentos para “Mensaje de inicio” y “Términos y condiciones”. Cada editor tiene contador de caracteres, preview y aviso de publicación de nueva versión para términos.

## Elemento firma

### Rail de rutas de entrega

Cada tipo de email se representa como una ruta visual: un punto de origen, una línea y un punto de destino, acompañados por audiencia, disparador y estado. La línea se ilumina en violeta cuando está activa y queda interrumpida en gris cuando está apagada.

Esto convierte una preferencia abstracta (“recordatorio diario: activo”) en un recorrido comprensible (“sistema → empleados”). Es el único gesto visual arriesgado de la pantalla; el resto permanece sobrio para que la red sea memorable y útil.

## Estados y feedback

- **Loading**: skeleton de la cabecera y de las rutas; no mostrar switches editables antes de recibir datos.
- **Empty**: bloque contextual dentro de destinatarios: “Todavía no hay destinatarios administrativos” + `Agregar destinatario`.
- **Query error**: `EmptyScreenError` con `Reintentar`; no mostrar valores parciales.
- **Unsaved**: banda ámbar persistente junto al botón de guardar: “Hay cambios sin guardar”.
- **Saving**: botón `Guardar cambios` con spinner y bloqueo; no montar acciones duplicadas.
- **Success**: confirmación visible con versión guardada y hora, sin toast como único feedback.
- **Terms versioning**: antes de publicar, mostrar una confirmación inline: “Esto creará una nueva versión y solicitará aceptación a quienes aún no la tengan”.

## Responsive y accesibilidad

- **Desktop**: rail contextual de ancho fijo y contenido principal amplio.
- **Mobile**: el rail se convierte en una cabecera compacta; las rutas se apilan conservando origen → destino → estado. No usar dos árboles React ocultos con CSS.
- Mantener foco de teclado visible con `violet-500`, labels explícitos para cada switch y texto de estado (`Activo` / `Inactivo`) además del color.
- Los editores deben anunciar cambios de versión y errores de validación mediante la semántica del formulario.
- Respetar `prefers-reduced-motion`: la iluminación de la ruta puede degradarse a un cambio de color instantáneo.
- El contraste de texto debe cumplir WCAG AA; el ámbar nunca será el único indicador de riesgo.

## Movimiento

Una única animación orquestada: al cargar la configuración, las rutas activas se dibujan de origen a destino una sola vez, en 350 ms. Las modificaciones de switches usan una transición breve de la línea, sin rebotes ni efectos decorativos.

## Copy de interfaz

Usar verbos concretos y consistentes:

- `Guardar cambios`
- `Agregar destinatario`
- `Quitar destinatario`
- `Publicar nueva versión`
- `Ver vista previa`
- `Reintentar`

Evitar términos de implementación como “webhook”, “config”, “payload” o “template”.

## Auto-crítica y descarte de defaults

- **Descartado**: dashboard de cuatro tarjetas estadísticas. Aunque sería rápido de construir, no explica el recorrido de cada envío y trata todas las decisiones como equivalentes.
- **Descartado**: formulario largo con todos los switches en una lista plana. Oculta la diferencia entre empleados y administradores, que es el riesgo central del brief.
- **Descartado**: dark mode genérico con gradiente brillante como decoración. El color violeta ahora codifica rutas activas y foco; el ámbar codifica riesgo real.
- **Elegido**: rail de rutas de entrega. Es específico del problema de comunicaciones y permite que el administrador comprenda el efecto de un cambio antes de guardarlo.
