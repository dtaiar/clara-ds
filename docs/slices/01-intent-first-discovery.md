# Vertical Slice 01 — Intent-first Discovery

**Status:** In progress — two fixed Explorer demonstrations; machine consumption and evaluation pending
**Version:** 0.1  
**Owner:** Daniel  
**Date:** 2026-09-08

## Why this slice

Clara's first end-to-end slice will test a central hypothesis of the system:

> Consumers should be able to discover a Design System solution from product intent without already knowing the system's vocabulary or inventory.

The search interface is only the entry point. The real system problem is whether Clara can translate an expressed product need into useful system knowledge: patterns, components, guidance, examples, constraints, and related capabilities.

## Example

A consumer might ask:

> I need users to confirm before deleting something.

Clara should be able to connect that intent to relevant system knowledge without requiring the consumer to search for a known component name first.

Conceptually:

```text
Product intent
    ↓
Clara discovery
    ↓
Relevant pattern / guidance
    ↓
Components + relationships
    ↓
Usage + accessibility + examples + constraints
```

## First product surface

The initial Clara Explorer surface is expected to require a deliberately small UI foundation:

- typography for heading, supporting text, labels, and body content;
- a text input or textarea for natural-language intent;
- a primary action button;
- suggestion chips/pills that demonstrate example intents;
- basic layout, spacing, surface, border, focus, and responsive behavior.

These elements are not a commitment to a broad component library. They exist to support this slice and should expand only when a product need or experiment justifies it.

## Suggestion model

Suggestions should represent **product intent**, not Clara inventory.

Prefer:

- Confirm a risky action
- Help users recover from an error
- Collect payment information
- Show that there is no content yet

Avoid using the first interaction merely as a component catalogue such as:

- Dialog
- Button
- Alert
- Card

The distinction is important: the Explorer should demonstrate discovery from intent rather than memorization of system terminology.

## Theme hypothesis — brand-neutral core

Clara Core should not prescribe a fixed brand primary color.

The current hypothesis is that Clara should provide semantic roles and behavioral expectations while allowing a consuming theme/product to supply its visual expression.

Conceptually:

```text
Clara Core
  action.primary
  action.primary.hover
  action.primary.text
  focus.ring

        ↓ resolved by

Product / Theme
  primary = yellow
  primary = orange
  primary = blue
  ...
```

The exact token model is intentionally unresolved. This slice should help determine what belongs to Core and what belongs to Theme.

This does **not** mean every arbitrary primary color will automatically produce an accessible or coherent theme. Clara will need constraints and/or validation around contrast, interaction states, and semantic meaning. Those rules must be designed and tested rather than assumed.

## Visual direction

No Clara brand primary is approved yet.

The Explorer may later have a demonstration theme, but that theme must not be confused with the Clara Core contract. Yellow/black and orange/black are current visual exploration ideas only.

The interaction pattern itself — prominent search/input plus suggested queries — is treated as a common discovery pattern, not as a reference-specific visual direction.

## System path exercised by this slice

```text
Foundations / tokens
        ↓
Semantic roles
        ↓
Theme
        ↓
Typography + Input/Textarea + Button + Suggestion
        ↓
Intent knowledge
        ↓
Human discovery interface
        ↓
Machine discovery interface
        ↓
Evaluation
```

The slice is complete only when it exercises the system path end-to-end. A polished search screen alone is not sufficient evidence.

## What we need to learn

1. What minimum token model is needed to support a brand-neutral Core and customizable Theme?
2. What component contracts are required for the Explorer entry surface?
3. How should product intents be represented in Clara Knowledge?
4. How does an intent resolve to patterns, components, and guidance?
5. Can human and machine consumers query the same underlying knowledge?
6. What does Clara do when it does not have enough knowledge to answer confidently?
7. How can we evaluate discoverability without rewarding knowledge of Clara terminology?

## Evidence to preserve

As this slice develops, record:

- token/theme decisions and rejected alternatives;
- component contracts;
- structured knowledge examples;
- human Explorer behavior;
- machine/CLI query behavior;
- prompts and generated outputs;
- discovery failures;
- human review decisions;
- system changes caused by repeatable evidence.

## Definition of success for Slice 01

This slice should eventually demonstrate that the same Clara knowledge can support at least two consumers:

**Human** — discovers a relevant solution through the Clara Explorer from product intent.  
**Agent** — discovers equivalent system knowledge through a machine-readable interface from the same or equivalent intent.

The experiment does not need to prove that Clara always finds the correct answer. Failures are useful if they reveal where the system's knowledge, structure, or discovery interface is insufficient.

## Initial next decision (historical)

Define Clara's **minimum foundation model** for this slice: which tokens are primitive, which roles are semantic, and which values belong to a Theme rather than Core.

## Current checkpoint — 2026-09-10

The Explorer reads Destructive Confirmation and Empty State / First Use directly from their experimental Knowledge records. Matching supports one normalized phrase per record; general intent discovery is not implemented. The Empty State example explicitly discloses its assumed context.

Foundations and the first component contracts have been implemented incrementally. See `docs/project/learning-log.md` for the observations and validation limits. The next unresolved end-to-end step is machine consumption of the same knowledge followed by a scoped evaluation; two records in the Explorer still represent one consumer.
