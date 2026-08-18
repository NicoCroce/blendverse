## Quiero que me ayudes a entender en profundidad lo siguiente:

1. Los agentes definidos son suficientes, sin necesidad de sub agentes.
2. Qué subagentes creés que puede ser necesario?
3. Cómo puedo mejroar el proceso para que sea más completo?

## Quiero que tenga:

1. Análisis de la necesidad. Con sugerencias claves y con planes para mejorar la experiencia.
2. Un sistema de desarrollo claro, en donde pueda entender qué es lo que se está desarrollando siguiendo los estándares establecidos, la arquitectura y las carpetas.
3. Quiero que puedas determinar si lo desarrollado cumple con las necesidades y los requerimientos.
4. Quiero que si no cumple con lo establecido, puedas iterarlo e informarlo.

## Quiero que determines todos los agentes, subagentes y todo lo necesario sobre IA.

El objetivo es llegar a la autonomía y que exista un agente principal que lidere la ejecución de cada subagente. Cada uno de ellos debe tener todo lo necesario para poder trabajar según lo determinado por el agente anterior.

### Es necesario que:

1. Cada agente debe generar una salida detallada, según las **necesidades del siguiente subagente a ejecutar**
2. El subagente debe obtener la información/contenxto anterior.
3. Quiero que quede un historial de las desiciones y ejecuciones de cada agente y subagente.
4. Toda esa información será guardada en una carpeta llamada `memory` dentro de proyecto. Los archivos serán en formato `markdown`.

# Espacificaciones a seguir

## 1. Arquitectura de Agentes Propuesta

Para evitar la sobrecarga de un solo agente, dividiremos el sistema en un Agente Líder (Orquestador) y Cuatro Subagentes Especializados.

Rol de AgenteTipoResponsabilidad PrincipalEntrada / Salida ClaveDirector del Proyecto (PM & Architect)Agente PrincipalOrquesta el flujo, valida el paso de un subagente a otro y gestiona la carpeta memory/.In: Input del usuario.Out: Roadmap de ejecución para los subagentes.Analista Funcional y UXSubagenteAnaliza las necesidades del usuario, define los criterios de aceptación y propone mejoras de experiencia.In: Roadmap inicial.Out: 01_requirements.md (con User Stories claras).Ingeniero de Software (Coder)SubagenteEscribe el código siguiendo estrictamente la arquitectura, estándares establecidos y estructura de carpetas.In: 01_requirements.md.Out: Archivos de código + 02_dev_log.md.Especialista en QA y TestingSubagenteGenera los tests automáticos, ejecuta el código en un entorno controlado y analiza los fallos.In: Código generado + 01_requirements.md.Out: 03_qa_report.md (Pass/Fail).Crítico de Estándares (Linter/Reviewer)SubagenteRevisa que el código cumpla con los patrones de diseño, legibilidad y seguridad antes de dar el "visto bueno".In: Código + Estándares del proyecto.Out: 04_review_log.md (Aprobado/Rechazado).

## 2. Mejoras Clave para lograr Máxima Independencia

Para que este harness funcione de verdad sin que tengas que intervenir cada 5 minutos, te sugiero implementar las siguientes mejoras:

### A. Ejecución Real (Sandbox/Contenedor)
El subagente de QA no puede limitarse a "leer" el código y decir si le parece bien. Para una verdadera autonomía, el harness de IA debe tener acceso a una terminal virtual (o un contenedor Docker seguro) donde pueda:

1. Instalar dependencias.
2. Ejecutar linters (eslint, black, etc.).
3. Correr la suite de pruebas (jest, pytest, etc.).
4. Capturar el stdout/stderr e inyectarlo de vuelta al agente de desarrollo si algo falla.

### B. Taxonomía Estricta en la carpeta memory/

Si dejas que los agentes escriban Markdown de forma libre, la memoria se convertirá en un caos de texto. Te recomiendo exigir un formato con Frontmatter (YAML) al inicio de cada archivo Markdown para que el Agente Principal pueda parsear el estado del sistema programáticamente:

```md
task_id: "TASK-001"
agent: "QA_Agent"
status: "FAILED"
attempts: 2
next_agent_required: "Coder_Agent"

---

# Reporte de QA

El test unitario `user.service.spec.ts` falló en la línea 42...
```

### C. Mecanismo de "Break Loop" (Anti-bucles)

Cuando un agente de IA no logra resolver un bug, suele intentar la misma solución una y otra vez de formas ligeramente distintas.
**Mejora**: Define un límite estricto de iteraciones (ej. máximo 3 intentos de corrección).

- Si se alcanza el límite, el Agente Principal debe pausar la ejecución, guardar un reporte de bloqueo en memory/ y alertar al humano.

## 3. El Flujo de Iteración Autónomo (Self-Correction Loop)

Para cumplir con tus puntos de determinar si cumple e iterarlo si no cumple, el flujo lógico del harness debe operar como un bucle de retroalimentación (Feedback Loop):

```
[Analista] -> Crea Requerimientos
↓
┌────────> [Coder] -> Escribe Código e Implementación
│ ↓
│ [QA Agent] -> Crea y Ejecuta Tests reales en la terminal
│ ↓
└─ NO ── ¿Pasó los Tests y Criterios?
↓ SÍ
[Crítico/Reviewer] -> ¿Cumple arquitectura y carpetas? ── NO ─┐
↓ SÍ │
[Líder] -> Guarda memoria final y cierra Tarea │
▲ │
└──────────────────────────────────────────────────────┘
```

Nota sobre los Tests: El agente de QA debe escribir los tests antes o en paralelo a que el Coder escriba la solución (estilo TDD AI). Así evitamos que el Coder escriba código defectuoso y que el QA asuma que está bien solo porque "no rompe nada".

## Responsabilidades de Agentes

### 👤 Agente Principal: Director del Proyecto (PM & Architect)

- **Responsabilidad:** Orquestar el flujo completo. Analiza el input inicial del usuario, decide qué subagente debe actuar, valida que las salidas de un agente sirvan como entrada del siguiente y gestiona el estado global en la carpeta `memory/`.
- **Entrada:** Requerimiento o prompt inicial del usuario humano.
- **Salida:** Roadmap de ejecución detallado para los subagentes y asignación de tareas.

### 👤 Subagente 1: Analista Funcional y UX

- **Responsabilidad:** Desmenuzar la necesidad del usuario. Define el alcance, los criterios de aceptación y propone mejoras proactivas en la experiencia de usuario (UX).
- **Entrada:** Roadmap conceptual del Director del Proyecto.
- **Salida:** `memory/01_requirements.md` (Historias de usuario y criterios de aceptación técnicos).

### 👤 Subagente 2: Ingeniero de Software (Coder)

- **Responsabilidad:** Escribir el código de la solución. Debe ceñirse estrictamente a los estándares del proyecto, arquitectura definida (Clean Architecture, Hexagonal, etc.) y la estructura de carpetas preestablecida.
- **Entrada:** `memory/01_requirements.md` + Código base existente.
- **Salida:** Archivos de código fuente modificados/creados y `memory/02_dev_log.md` (Explicación de los cambios).

### 👤 Subagente 3: Especialista en QA y Testing

- **Responsabilidad:** Validar el comportamiento funcional. Diseña la suite de pruebas (unitarias/integración) idealmente bajo un enfoque AI-TDD (diseña pruebas según requerimientos antes de que el coder finalice) y **ejecuta** el código en un entorno controlado (Sandbox/Docker).
- **Entrada:** Código generado + `memory/01_requirements.md`.
- **Salida:** `memory/03_qa_report.md` (Estado de los tests: PASS o FAIL, con logs de la terminal).

### 👤 Subagente 4: Crítico de Estándares (Reviewer/Linter)

- **Responsabilidad:** Garantizar la mantenibilidad. Revisa que el código no solo funcione (aprobado por QA), sino que cumpla con buenas prácticas, patrones de diseño, legibilidad, seguridad y tipado.
- **Entrada:** Código final + `memory/02_dev_log.md`.
- **Salida:** `memory/04_review_log.md` (Estado de la revisión: APPROVED o REJECTED con feedback).

---

## 2. Flujo de Iteración y Autocorrección (Self-Correction Loop)

Para garantizar la autonomía y evitar que el sistema dependa de la intervención humana ante fallos, se aplica el siguiente ciclo cerrado:

1.  El agente de **QA** ejecuta las pruebas en una terminal virtual.
2.  **Si los tests fallan (`FAIL`):** QA vuelca el error exacto del `stderr` en `memory/03_qa_report.md`. El Agente Principal degrada el flujo y reactiva al **Coder**, pasándole el reporte de error como contexto prioritario.
3.  **Si el Crítico rechaza el código (`REJECTED`):** Añade las correcciones de arquitectura necesarias en `memory/04_review_log.md` y el **Coder** debe refactorizar el código sin romper los tests de QA.

### 🛑 Salvaguarda Anti-Bucles (Break Loop)

Para evitar alucinaciones repetitivas o bucles infinitos de corrección:

- Cada subagente tiene un contador de intentos (`attempts`) en su metadata.
- Si el **Coder** y **QA** ciclan más de **3 veces** en el mismo error, el Agente Principal abortará la ejecución automática, escribirá un archivo `memory/BLOCKED.md` describiendo el callejón sin salida y notificará al desarrollador humano.

---

## 3. Estructura y Estándar de la Carpeta de Memoria (`memory/`)

Todos los agentes leen y escriben en una carpeta raíz llamada `memory/`. Para que la IA pueda parsear el estado del proyecto de forma programática, cada archivo Markdown **debe** iniciar con bloques de configuración YAML (Frontmatter).

### Estructura de Archivos

```text
mi-proyecto/
├── memory/
│   ├── 01_requirements.md
│   ├── 02_dev_log.md
│   ├── 03_qa_report.md
│   ├── 04_review_log.md
│   └── history_log.json      <-- Historial cronológico indexado
├── src/
└── ...

```

## Análisis de QA

El Coder olvidó implementar la expresión regular de validación en la línea 14 del servicio. Se requiere re-iteración.

```md
#### 📄 `memory/04_review_log.md`

---

task_id: "TASK-001"
agent: "Reviewer_Agent"
status: "APPROVED" # Puede ser APPROVED o REJECTED

---

# Revisión de Estándares y Código

## Evaluación de Arquitectura

- **Estructura de Carpetas:** CORRECTA. Cumple con la distribución definida.
- **Estilos y Legibilidad:** CORRECTA. Pasa las reglas del linter.

## Feedback Adicional

El código está limpio y listo para producción. No se detectan deudas técnicas flagrantes.
```

# Plantillas Estrictas de Memoria

📄 memory/01_requirements.md

```md
---
task_id: 'TASK-001'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
---

# Requerimientos Funcionales y UX

## Descripción de la Necesidad

[Breve resumen de lo que el usuario quiere lograr]

## Criterios de Aceptación (Definición de Hecho)

- [ ] Criterio 1 (Ej: El endpoint debe responder en < 200ms)
- [ ] Criterio 2 (Ej: Validar que el email tenga formato correcto)

## Propuestas de Mejora UX

- [Sugerencia clave para mejorar la experiencia de uso]
```

📄 memory/02_dev_log.md

```
---
task_id: "TASK-001"
agent: "Coder_Agent"
status: "IMPLEMENTED"
affected_files:
  - "src/services/user.service.ts"
  - "src/controllers/user.controller.ts"
---
# Log de Desarrollo

## Cambios Realizados
* Se implementó la lógica de validación usando la arquitectura limpia en la capa de aplicación.
* Se crearon las carpetas correspondientes siguiendo el estándar del proyecto.

## Decisiones Técnicas
* Se optó por usar X patrón de diseño para desacoplar la base de datos de la lógica de negocio.
```

📄 memory/03_qa_report.md

````md
---
task_id: 'TASK-001'
agent: 'QA_Agent'
status: 'FAIL' # Puede ser PASS o FAIL
attempts: 2
---

# Reporte de Ejecución de Pruebas

## Resultado de la Terminal

```bash
$ npm run test
FAIL src/services/user.service.spec.ts
● UserService › should validate incorrect email formats

  expect(received).toBe(expected) // Object.is equality

  Expected: false
  Received: true
```
````
