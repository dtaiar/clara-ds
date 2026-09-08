# Clara DS — Project Foundation

**Status:** Exploration  
**Version:** 0.1  
**Owner:** Daniel  
**Last updated:** 2026-09-08

## Thesis

AI agents are becoming consumers of Design Systems alongside designers and developers.

Clara investigates what a Design System needs to become when it is designed for both humans and agents from the beginning — not merely when AI is added as another tool around an existing component library.

The working thesis is that a Design System for this environment may need to operate as **product knowledge infrastructure**: a shared, governed source of components, behavior, patterns, guidance, examples, constraints, and composition knowledge that can be discovered through interfaces appropriate to different consumers.

“Product knowledge infrastructure” is Clara's working framing, not a claim attributed to Astryx or an established industry definition.

## Problem

Traditional Design Systems commonly expose different parts of their knowledge through component libraries, design libraries, documentation, code, examples, and team conventions. Human practitioners can bridge gaps through experience, interpretation, and conversations with other people.

Agents introduce a different consumption model. They may need to discover capabilities programmatically, retrieve only relevant context, understand predictable contracts, distinguish supported behavior from inference, and know when system knowledge is insufficient.

This creates a Design Systems question rather than only an AI tooling question:

> If agents become first-class consumers, how should the system itself be structured?

## Primary research question

> How might a Design System become usable, discoverable, and measurable for both humans and AI agents without creating two separate sources of truth?

## Secondary research question

> What does a Design System need to know beyond its components?

## Initial hypotheses

These are hypotheses to test, not conclusions.

### H1 — Shared knowledge
A common structured knowledge layer can support both human-facing documentation and machine-facing interfaces more reliably than maintaining separate AI instructions.

### H2 — Predictable contracts
Consistent naming, APIs, schemas, and composition conventions will make Clara easier for agents to discover and use correctly.

### H3 — Composition knowledge
Components alone will be insufficient for many product tasks. Explicit patterns, templates, relationships, examples, and usage rules may improve the quality of system-informed composition.

### H4 — Behavior and brand can be separated
Keeping behavioral contracts and accessibility expectations in the core while moving visual expression into themes may allow one system to support different product identities without forking its components.

### H5 — Evaluation changes governance
Repeatable agent tasks and neutral evaluation criteria may provide useful evidence for Design System decisions, but evaluation should inform rather than replace human judgment.

### H6 — Agent independence matters
If Clara's knowledge architecture is effective, it should not depend on one specific model or coding agent. This can later be tested across agents under matched conditions.

## Scope — v0.1

The project will initially design and prove a **vertical slice**, not a comprehensive enterprise Design System.

Candidate system capabilities are:

1. a small executable core with foundations and representative components;
2. a theming model;
3. structured system knowledge for those components;
4. at least one composition layer above individual components, such as patterns or templates;
5. human-readable documentation generated from or backed by the shared knowledge;
6. a machine-readable interface, initially expected to include a CLI and structured output;
7. a repeatable evaluation harness for agent-generated product tasks;
8. recorded human review and system decisions.

The exact implementation and repository structure will be decided only when the vertical slice is defined.

## Non-goals

At this stage Clara is not trying to:

- reproduce Astryx feature-for-feature;
- build hundreds of components;
- prove enterprise adoption;
- prove productivity or cost savings before measuring them;
- claim production readiness;
- claim accessibility compliance from design intent alone;
- optimize for a single AI vendor;
- use AI-generated screens as the primary measure of success;
- treat Figma as the automatic source of truth;
- automate human Design System governance away.

## Reference model

The primary external reference for this phase is **Astryx by Meta**.

The project is particularly interested in Astryx's published ideas around:

- designing the system for humans and agents;
- one cohesive system rather than separate human and AI systems;
- programmatic discovery through CLI/API capabilities;
- structured output for agents;
- themes separated from core system behavior;
- patterns and templates as part of system knowledge;
- evaluation harnesses used to test Design System decisions.

Clara should preserve the distinction between:

**Reference observation** — what Astryx actually documents.  
**Clara interpretation** — what we think the idea means for this project.  
**Clara decision** — what Daniel chooses to implement.  
**Evidence** — what our implementation and experiments later demonstrate.

## Experiment model

A likely experiment structure is:

### Condition A — Baseline
An agent receives a product task without Clara system knowledge.

### Condition B — Core
The same class of agent receives access to Clara's executable components/foundations.

### Condition C — System
The agent receives Clara Core plus the structured Knowledge and machine interface.

The exact experiment must be designed before results are collected. Prompts, agent/model versions, system versions, context, outputs, timestamps, human interventions, and evaluation criteria should be recorded.

The purpose is not to make Clara win. A result that shows no meaningful improvement, or exposes a flaw in the architecture, is valid project evidence.

## Candidate evaluation dimensions

These are provisional and need operational definitions before use:

- functional correctness;
- accessibility quality;
- appropriate system reuse;
- maintainability;
- design/composition quality;
- unsupported invention;
- ability to recover from missing system knowledge;
- human correction required.

Evaluation criteria should be target-neutral where possible: they should assess the resulting product rather than reward an agent merely for using Clara.

## Evidence model

For each meaningful experiment, preserve:

- task/prompt;
- model and tool;
- Clara version/commit;
- context exposed to the agent;
- raw output;
- generated product artifact;
- evaluation result;
- human critique;
- failure classification;
- system change, if any;
- rerun result, if any.

Possible failure classes:

- missing system knowledge;
- ambiguous guidance;
- inconsistent API or naming;
- retrieval/discoverability failure;
- generation error despite sufficient context;
- composition/design judgment issue;
- evaluation weakness;
- unknown/unclassified.

A single nondeterministic failure should not automatically trigger a system rule change. Repeated evidence and human judgment should determine whether a finding belongs in the system.

## Success criteria for the project

Clara's portfolio case will be successful if it can demonstrate, with inspectable artifacts:

1. a coherent Design System architecture designed for human and agent consumers;
2. a shared knowledge model exposed through more than one consumer interface;
3. a working vertical slice rather than only conceptual diagrams;
4. at least one meaningful evaluation loop that changes or challenges a system decision;
5. explicit human governance and documented trade-offs;
6. clear separation between hypotheses, observations, and demonstrated outcomes;
7. a repository that another person can inspect to understand how the system works and why decisions were made.

## Portfolio framing

Working case title:

> **Clara — What happens when AI becomes a Design System consumer?**

Supporting description:

> **Designing a Design System for humans and AI agents.**

The case should position Daniel's role around system architecture, governance, product knowledge, evaluation, and decision-making — not around the volume of UI produced.

## Next decision

Define the smallest **vertical slice** capable of exercising Clara Core, Themes, Knowledge, machine discovery, human documentation, and Eval together.

Do not start a broad component library before this slice is defined.
