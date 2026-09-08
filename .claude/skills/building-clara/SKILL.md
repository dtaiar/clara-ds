---
name: building-clara
description: Build, modify, or extend Clara DS while preserving its architecture, evidence standards, vertical-slice scope, and human-governed Design Systems decisions. Use whenever implementing Clara foundations, themes, components, patterns, knowledge, interfaces, CLI, or evaluation.
---

# Building Clara

Use this skill when making implementation changes to Clara DS.

Its purpose is not to replace Clara documentation. It tells the agent how to find and use the project context before building.

## Start with project context

Always read:

- `README.md`
- `docs/project/foundation.md`
- `docs/architecture/overview.md`
- `docs/principles/principles.md`

Then read only the documents relevant to the task.

For Vertical Slice 01:

- `docs/slices/01-intent-first-discovery.md`

For foundations:

- `docs/foundations/token-model.md`

For architectural decisions:

- read the relevant files under `decisions/`

Do not rely on conversation memory when the repository contains the decision.

## Working model

Clara is not a component-library project.

It explores how a Design System changes when humans and AI agents are both first-class consumers.

The Git repository is the source of truth for code, structured system knowledge, decisions, experiments, and implementation evidence.

Clara owns:

- product semantics
- system knowledge
- component contracts
- patterns
- accessibility intent and requirements
- discoverability
- evaluation
- governance

Implementation tools such as Panda CSS do not define Clara's product language.

## Before implementing

For every task:

1. Identify the vertical slice or hypothesis being exercised.
2. Identify existing decisions that constrain the implementation.
3. Separate:
   - documented decisions;
   - hypotheses;
   - implementation recommendations;
   - observed evidence.
4. Check whether the requested implementation introduces a new architectural or system decision.
5. If it does, surface the decision before silently committing to an approach.

## Implementation rules

Prefer the smallest implementation that can test the current hypothesis.

Do not:

- create a broad component library;
- add foundations without demonstrated need;
- introduce abstractions for hypothetical future requirements;
- expose Panda-specific implementation concepts as Clara's public vocabulary;
- encode brand-specific values into component contracts;
- optimize Clara specifically for one AI agent;
- invent evidence, metrics, accessibility claims, performance claims, or evaluation results.

Components should consume semantic roles rather than arbitrary primitives whenever those values express product meaning.

Generated artifacts are derived outputs and should not be manually maintained unless a documented decision says otherwise.

## Evidence loop

After implementing a meaningful system change:

1. Build or generate the relevant artifacts.
2. Verify the intended behavior.
3. Inspect failures rather than assuming a successful build means the system works.
4. Record meaningful observed evidence in the appropriate decision or experiment document.
5. Distinguish one-off implementation bugs from recurring system problems.

A passing build is not sufficient evidence when the hypothesis concerns runtime or system behavior.

## Governance

AI may:

- retrieve context;
- implement;
- inspect;
- evaluate;
- propose changes.

Humans approve:

- system principles;
- architectural boundaries;
- semantic model changes;
- public contracts;
- governance changes.

If a task crosses one of these boundaries, stop and surface the decision.

### Decision threshold

Not every implementation choice requires an ADR.

Create or propose an architectural decision only when the choice:

- changes Clara's public system contract;
- changes a system boundary or responsibility;
- affects governance or source-of-truth ownership;
- creates a meaningful long-term constraint;
- or would be costly or consequential to reverse.

Implementation mechanisms that preserve the existing Clara contract can be decided and documented within the relevant implementation or foundation documentation.

Do not create ADRs merely because a framework offers multiple implementation options.

## Definition of done

A task is not complete only because code exists.

Report:

- what changed;
- what was verified;
- what evidence was observed;
- deviations from documented assumptions;
- unresolved questions;
- whether anything should become a system decision.

## Boundary of this skill

This skill is an operational guide for builders. It is not Clara Knowledge itself.

Do not copy component usage guidance, product patterns, or system-domain knowledge into this skill just to make agents more capable. Those belong in Clara's shared system knowledge so humans and agents can consume the same source.
