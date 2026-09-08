# ADR-001 — Adopt Panda CSS as Clara's styling foundation

**Status:** Accepted  
**Date:** 2026-09-08  
**Decision owner:** Daniel

## Context

Clara is exploring how a Design System should be structured when both humans and AI agents are first-class consumers.

The styling foundation therefore needs to do more than make UI implementation convenient. It should make system decisions explicit enough that we can observe whether an agent is using Clara's product language or bypassing it through generic styling knowledge.

Tailwind CSS was considered first because of its mature ecosystem, strong developer experience, and broad familiarity among coding agents. That familiarity is also a potential confounding factor for Clara's experiments: an agent can produce a plausible Tailwind interface from prior model knowledge without demonstrating that Clara itself was discoverable or useful.

Panda CSS provides a different experimental foundation. Its documented model includes raw tokens, semantic tokens, conditions, patterns, recipes, and typed generated styling artifacts. Panda can also generate readable JSON specifications for tokens, semantic tokens, recipes, patterns, and related theme structures.

## Decision

Clara v0.1 will use **Panda CSS** as its styling foundation.

The initial web implementation direction is:

- React
- TypeScript
- Panda CSS

Style Dictionary remains an open hypothesis rather than an accepted dependency. Clara will first determine whether Panda's token model and generated specifications are sufficient for the initial vertical slice.

## Why Panda fits the experiment

### 1. Clara can own the language

Panda provides infrastructure for defining tokens, semantic tokens, patterns, and recipes without requiring Clara to inherit an existing visual vocabulary.

This allows us to investigate whether an agent can discover and use concepts defined by Clara rather than merely reproduce a framework vocabulary it already knows.

### 2. Semantic intent can be explicit

Clara can distinguish primitive values from semantic product decisions and component recipes.

Conceptually:

```text
primitive token
    ↓
semantic token
    ↓
recipe / component contract
    ↓
pattern / product composition
```

### 3. System structure can be inspected

Panda's generated artifacts and specification output create an opportunity to expose parts of the styling system to documentation and machine consumers without manually recreating the same information.

Whether Panda's spec output becomes part of Clara's canonical knowledge architecture is still a hypothesis to test.

### 4. It keeps the styling engine separate from Clara intelligence

Panda can own styling mechanics while Clara owns product semantics, component guidance, composition knowledge, discoverability, evaluation, and governance.

## What Panda is responsible for

Panda may provide:

- styling generation;
- raw and semantic token infrastructure;
- conditions;
- styling patterns;
- component recipes and variants;
- generated styling types and artifacts;
- design-system specification output where useful.

## What Panda is NOT responsible for

Panda does not define:

- Clara's product semantics;
- component purpose;
- when a component should or should not be used;
- interaction decisions;
- accessibility requirements beyond what Clara explicitly implements and documents;
- product-level composition guidance;
- Clara patterns in the UX/product sense unless Clara deliberately maps them to Panda primitives;
- agent discovery strategy;
- agent context strategy;
- evaluation criteria;
- governance;
- system decisions.

This boundary is important. Future evaluations must not attribute Panda capabilities to Clara or Clara decisions to Panda.

## Consequences

### Positive

- Clara gets a typed and explicit styling vocabulary.
- Semantic tokens and recipes can become observable system contracts.
- We reduce dependence on an agent's memorized Tailwind vocabulary as part of the experiment.
- Panda's generated specs may provide useful machine-readable inputs for Clara Knowledge and Clara Docs.

### Trade-offs

- Panda is an additional technology that contributors and agents may need to discover.
- Some agent failures may initially reflect unfamiliarity with Panda rather than weaknesses in Clara.
- The experiment will need to distinguish styling-framework discoverability from Design System discoverability.
- Clara must avoid simply exposing Panda's model and calling it Clara Knowledge.

## Evidence needed later

This decision should be revisited if experiments show that:

- Panda creates substantial agent friction unrelated to Clara;
- its generated artifacts cannot support the knowledge architecture we need;
- the distinction between Panda and Clara becomes difficult to maintain;
- another foundation produces a materially cleaner test of Clara's hypotheses.

## References

- Panda CSS — Getting started: https://panda-css.com/docs/overview/getting-started
- Panda CSS — Tokens: https://panda-css.com/docs/theming/tokens
- Panda CSS — Recipes: https://panda-css.com/docs/concepts/recipes
- Panda CSS — Patterns: https://panda-css.com/docs/concepts/patterns
- Panda CSS — Spec: https://panda-css.com/docs/theming/spec
