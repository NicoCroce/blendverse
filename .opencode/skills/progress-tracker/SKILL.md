---
name: progress-tracker
description: >-
  Visual progress tracking protocol for multi-phase pipelines and multi-agent chains.
  Defines unified formats for pipeline banners, phase todo lists, agent activity banners,
  percentage calculation, and implementation chain tracking. Invoke at every phase transition,
  agent handoff, and status change in blendverse-start-feature and blendverse-implement.
---

# Skill: progress-tracker

## Purpose

Provide maximum visibility into pipeline and agent chain execution. Every phase, every agent,
every status change must be visually tracked with:

- Pipeline-level progress banner (shown at phase transitions)
- Phase-level todo list (using `todowrite` tool)
- Agent activity banner (shown before launching each agent)
- Percentage calculation (based on completed steps vs total)
- "Currently doing" / "Up next" sections

This skill is invoked by:

- `blendverse-start-feature` command (Fases 0–6)
- `blendverse-implement` agent (Paso 2.5 and each sub-agent handoff)
- Any sub-agent that wants to show its internal progress

## Pipeline Banner Format

Show this banner at every phase transition (start of a phase, end of a phase, mode switch):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FEATURE: {{feature}}
  BRANCH:  {{branch}}
  MODE:    {{modo}} (plan | auto)
  PHASE:   {{current_phase}} / 6
  STATUS:  {{status}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Status values:

- `IN_PROGRESS` — phase is running
- `AWAITING_APPROVAL` — phase completed, waiting for user confirmation (modo plan)
- `COMPLETED` — phase approved
- `SKIPPED` — phase not applicable (e.g., Fase 2 when all categories are Clear)
- `HANDOFF` — control passed to next agent/pipeline

## Percentage Calculation

### Pipeline (blendverse-start-feature)

Total phases: 6 (Fase 0 is pre-evaluation, not counted in percentage)

| Phase completed | Percentage |
| --------------- | ---------- |
| Fase 1          | 16%        |
| Fase 2          | 33%        |
| Fase 3          | 50%        |
| Fase 4          | 66%        |
| Fase 5          | 83%        |
| Fase 6          | 100%       |

Formula: `(completed_phases / 6) * 100`, rounded to nearest integer.

### Implementation Chain (blendverse-implement)

Total steps depend on scope:

| Scope      | Steps                                             | Percentage per step |
| ---------- | ------------------------------------------------- | ------------------- |
| back-only  | 5 (back → tester → qa → reviewer → close)         | 20%                 |
| front-only | 5 (front → tester → qa → reviewer → close)        | 20%                 |
| full-stack | 6 (back → front → tester → qa → reviewer → close) | 16%                 |

Formula: `(completed_steps / total_steps) * 100`, rounded to nearest integer.

## Phase Todo List (blendverse-start-feature)

At the start of the pipeline (Pre-flight), create a todo list with `todowrite` containing all phases:

```
todowrite([
  { content: "Fase 0 — Evaluación de complejidad", status: "in_progress", priority: "high" },
  { content: "Fase 1 — Especificación (@speckit-specify)", status: "pending", priority: "high" },
  { content: "Fase 2 — Aclaración (@speckit-clarify) [condicional]", status: "pending", priority: "medium" },
  { content: "Fase 3.1 — Dirección de diseño frontend [condicional]", status: "pending", priority: "medium" },
  { content: "Fase 3.2 — Plan técnico (@speckit-plan)", status: "pending", priority: "high" },
  { content: "Fase 4 — Desglose de tareas (@speckit-tasks)", status: "pending", priority: "high" },
  { content: "Fase 5 — Análisis de consistencia (@speckit-analyze)", status: "pending", priority: "medium" },
  { content: "Fase 6 — Handoff a @blendverse-implement", status: "pending", priority: "high" }
])
```

Rules:

- Mark each phase `in_progress` immediately before invoking the agent
- Mark each phase `completed` only after user approval (modo plan) or auto-advance (modo auto)
- If a phase is skipped (e.g., Fase 2 when all categories are Clear), mark it `completed` with a note
- Update the todo list at every status change, don't wait until the end

## Agent Activity Banner

Show this banner immediately before launching any agent (subagent or skill):

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @{{agent_name}}                              │
│  ACTION:       {{what_it_does}}                             │
│  EXPECTED:     {{expected_output}}                          │
│  EST. TIME:    {{estimated_duration}}                       │
│  PROGRESS:     {{current_percentage}}%                      │
└─────────────────────────────────────────────────────────────┘
```

Example:

```
┌─────────────────────────────────────────────────────────────┐
│  AGENT:        @speckit-specify                             │
│  ACTION:       Generating feature specification             │
│  EXPECTED:     specs/{{feature}}/spec.md                    │
│  EST. TIME:    2-3 min                                      │
│  PROGRESS:     16%                                          │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Chain Todo List (blendverse-implement)

At Paso 2.5, create a todo list with `todowrite` containing all chain steps according to scope:

### back-only

```
todowrite([
  { content: "Resolver task_id y contexto", status: "completed", priority: "high" },
  { content: "Implementar backend (@blendverse-back)", status: "in_progress", priority: "high" },
  { content: "Generar tests (@blendverse-tester)", status: "pending", priority: "high" },
  { content: "Validación estática (@blendverse-qa)", status: "pending", priority: "high" },
  { content: "Revisión de estándares (@blendverse-reviewer)", status: "pending", priority: "high" },
  { content: "Cerrar tarea y abrir PR a main", status: "pending", priority: "high" }
])
```

### front-only

```
todowrite([
  { content: "Resolver task_id y contexto", status: "completed", priority: "high" },
  { content: "Implementar frontend (@blendverse-front)", status: "in_progress", priority: "high" },
  { content: "Generar tests (@blendverse-tester)", status: "pending", priority: "high" },
  { content: "Validación estática (@blendverse-qa)", status: "pending", priority: "high" },
  { content: "Revisión de estándares (@blendverse-reviewer)", status: "pending", priority: "high" },
  { content: "Cerrar tarea y abrir PR a main", status: "pending", priority: "high" }
])
```

### full-stack

```
todowrite([
  { content: "Resolver task_id y contexto", status: "completed", priority: "high" },
  { content: "Implementar backend (@blendverse-back)", status: "in_progress", priority: "high" },
  { content: "Implementar frontend (@blendverse-front)", status: "pending", priority: "high" },
  { content: "Generar tests (@blendverse-tester)", status: "pending", priority: "high" },
  { content: "Validación estática (@blendverse-qa)", status: "pending", priority: "high" },
  { content: "Revisión de estándares (@blendverse-reviewer)", status: "pending", priority: "high" },
  { content: "Cerrar tarea y abrir PR a main", status: "pending", priority: "high" }
])
```

Rules:

- Mark each step `in_progress` immediately before launching the subagent
- Mark each step `completed` only when the subagent returns a positive result (IMPLEMENTED, PASS, APPROVED)
- If a step fails (QA FAIL, reviewer REJECTED), keep it `in_progress` until the retry resolves it
- When resuming (`resume_point` != `start`), mark already-completed steps as `completed` and start the list from the resume point

## Sub-Agent Internal Progress (optional)

Each sub-agent (back, front, tester, qa, reviewer) can show its internal progress using the same format:

```
┌─────────────────────────────────────────────────────────────┐
│  SUB-AGENT:    @{{agent_name}}                              │
│  TASK:         {{task_id}}                                  │
│  STEP:         {{current_step}} / {{total_steps}}           │
│  PROGRESS:     {{current_percentage}}%                      │
│  CURRENTLY:    {{what_im_doing_now}}                        │
│  UP NEXT:      {{what_comes_next}}                          │
└─────────────────────────────────────────────────────────────┘
```

Example (back agent):

```
┌─────────────────────────────────────────────────────────────┐
│  SUB-AGENT:    @blendverse-back                             │
│  TASK:         TASK-feat-users-20260808-1                   │
│  STEP:         3 / 7                                        │
│  PROGRESS:     43%                                          │
│  CURRENTLY:    Creating UseCases/CreateUser.usecase.ts      │
│  UP NEXT:      Creating Application/Users.service.ts        │
└─────────────────────────────────────────────────────────────┘
```

## "Currently Doing" / "Up Next" Sections

After every agent activity banner or phase transition, show:

```
🔄 CURRENTLY: {{what_is_happening_now}}
⏭️  UP NEXT:   {{what_comes_next}}
```

Example:

```
🔄 CURRENTLY: Invoking @speckit-specify to generate feature specification
⏭️  UP NEXT:   Fase 2 — Aclaración (conditional, may be skipped)
```

## Progress Update Rules

1. **Update at every status change** — don't wait until the end of a phase or agent
2. **Use `todowrite` tool** — this is the primary mechanism for visual tracking
3. **Show percentage** — calculate and display at every banner
4. **Be explicit** — name the agent, the action, the expected output
5. **Don't duplicate** — if the todo list already shows the status, don't repeat it in text
6. **Use banners for transitions** — phase changes, agent handoffs, mode switches
7. **Use banners for visibility** — before launching an agent, show what it will do

## When to Invoke This Skill

| Context                    | When to invoke                                                 |
| -------------------------- | -------------------------------------------------------------- |
| `blendverse-start-feature` | Pre-flight, start of each phase, end of each phase, handoff    |
| `blendverse-implement`     | Paso 2.5 (create todo list), before each sub-agent, after each |
| Sub-agents (optional)      | Start of work, major milestones, end of work                   |

## Anti-Patterns

- ❌ Showing progress only at the end of a phase — show it continuously
- ❌ Hiding percentage — always calculate and display
- ❌ Vague agent descriptions — name the agent, the action, the expected output
- ❌ Skipping the todo list — always use `todowrite` for multi-step work
- ❌ Not updating the todo list — update at every status change
