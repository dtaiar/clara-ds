# Clara DS — Working Principles

**Status:** Exploration  
**Version:** 0.1  
**Owner:** Daniel  
**Last updated:** 2026-09-08

These principles are working hypotheses. They express how we currently believe Clara should behave, but they are expected to be challenged by implementation and evaluation evidence.

## 1. One source, multiple consumers

Humans and agents should access the same underlying system knowledge rather than requiring separate canonical documentation.

Different interfaces are expected. Different truths are not.

**We will challenge this principle by asking:** Can human Docs and machine-readable interfaces remain useful without duplicating or contradicting system rules?

## 2. Knowledge is part of the system

A Design System is more than foundations and components.

Usage guidance, relationships, patterns, templates, accessibility expectations, examples, constraints, and known limitations should be treated as system assets rather than secondary prose.

**We will challenge this principle by asking:** Which knowledge types measurably help consumers make better product decisions, and which only add context noise?

## 3. Predictability enables autonomy

Consistent naming, APIs, schemas, states, and composition conventions should make the system easier to discover and use without relying on tribal knowledge.

This matters to both humans and machines.

**We will challenge this principle by asking:** Where do agents still invent behavior despite having predictable system contracts?

## 4. Behavior before brand

Core interaction behavior, semantics, and accessibility expectations should remain stable when visual expression changes.

Themes should express product identity without requiring teams to fork foundational behavior.

**We will challenge this principle by asking:** Can one core support meaningfully different visual identities without the theme layer becoming an escape hatch for uncontrolled component variation?

## 5. Discoverability over memorization

Consumers should not need prior knowledge of Clara's inventory to use it effectively.

The system should help them search, inspect relationships, understand available capabilities, and identify gaps.

**We will challenge this principle by asking:** Can an unfamiliar consumer find an appropriate system capability from product intent alone?

## 6. Measure outcomes, not obedience

Clara should not be considered successful because an agent uses many Clara components.

Evaluation should focus on the resulting product: correctness, accessibility, maintainability, design quality, appropriate reuse, and unsupported invention.

**We will challenge this principle by asking:** Can our rubrics evaluate a solution fairly even when the best solution uses less of Clara?

## 7. Humans govern the system

AI can retrieve, generate, inspect, evaluate, and propose. It should not silently turn a single generated outcome into a new Design System rule.

Reusable system decisions remain reviewable and human-owned.

**We will challenge this principle by asking:** What evidence should be required before a repeated agent failure results in a system change?

## 8. Agent-agnostic by design

Clara should describe product and system knowledge in a way that is not dependent on the quirks of one AI provider.

Provider-specific adapters may exist, but they should not become the canonical knowledge model.

**We will challenge this principle by asking:** Under matched tasks and Clara versions, can different capable agents discover and use the system without provider-specific rewrites?

## Principle lifecycle

A principle may be:

- **Proposed** — a working hypothesis;
- **Supported** — evidence currently supports keeping it;
- **Revised** — evidence changed its meaning or boundary;
- **Rejected** — evidence showed it was not useful or was misleading.

Version history should preserve these changes rather than rewriting the project's starting assumptions after the fact.
