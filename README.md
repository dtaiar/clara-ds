# Clara DS

**What happens when AI becomes a Design System consumer?**

Clara is an experimental Design System exploring how shared product knowledge can become infrastructure for both humans and AI agents.

The project starts from a simple premise: Design Systems were largely structured around human workflows, while AI agents need knowledge to be discoverable, predictable, structured, and machine-readable. Clara investigates what changes when agents are treated as first-class consumers of the system from the beginning.

## Project status

**Status:** Exploration  
**Version:** 0.1

Clara is not a production-ready Design System. It is a portfolio and research project used to test architecture, documentation, system behavior, agent discoverability, and evaluation methods with real artifacts and recorded evidence.

## Core research question

> How might a Design System become usable, discoverable, and measurable for both humans and AI agents without creating two separate sources of truth?

A second question will guide the system design:

> What does a Design System need to know beyond its components?

## Current direction

Clara will explore five connected layers:

- **Core** — foundations, tokens, components, behavior, accessibility, and APIs.
- **Themes** — visual and brand expression separated from core behavior.
- **Knowledge** — usage guidance, patterns, templates, examples, accessibility guidance, relationships, and known limitations.
- **Interfaces** — human-readable documentation and machine-readable access to the same system knowledge.
- **Evaluation** — repeatable tasks and rubrics used to observe how well humans and agents can build with Clara.

The architecture is intentionally provisional. The project will change when experiments reveal that an assumption is wrong.

## Reference model

Astryx by Meta is the primary external reference for this phase of the project. Its documented approach is relevant because it treats humans and agents as consumers of one cohesive system, makes design-system knowledge available through a CLI and typed JSON API, separates core system behavior from themes, and uses an evaluation harness to test system decisions.

Clara will use those ideas as a reference model, not as a specification to copy. The goal is to build a smaller, independently reasoned vertical slice and document what is learned from it.

## Evidence standard

This repository will distinguish between:

- **External reference** — claims supported by published sources.
- **Project hypothesis** — what Clara proposes to test.
- **Observed evidence** — what an experiment, artifact, or implementation actually demonstrates.
- **Decision** — a human-owned choice made from the available evidence.

No business impact, efficiency gain, accessibility compliance, or agent-performance improvement will be claimed without evidence produced by this project.

## Documents

- [`docs/project/foundation.md`](docs/project/foundation.md) — thesis, scope, hypotheses, experiment model, and evidence rules.
- [`docs/architecture/overview.md`](docs/architecture/overview.md) — initial system architecture.
- [`docs/principles/principles.md`](docs/principles/principles.md) — working principles to be tested rather than treated as fixed truths.

## Primary reference

- Astryx by Meta — https://astryx.atmeta.com/
