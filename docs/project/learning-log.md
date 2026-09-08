# Clara project learning log

This file records observed project learnings that may matter to Clara's architecture, governance, evaluation, or portfolio narrative. It is not a source of product requirements by itself; individual decisions still live in ADRs, foundations, slice docs, component contracts, or Knowledge records as appropriate.

## 2026-09-08 — Button + first Clara Knowledge record (PR #5)

### Context

Vertical Slice 01 produced Clara's first real component (`Button`) and the first experimental structured Knowledge record (`docs/knowledge/button.json`). The goal was not to finalize a universal Knowledge schema, but to learn what becomes necessary when the same Design System knowledge is intended to support both humans and AI agents.

### Observed learnings

1. **Knowledge needs to expose semantic-system relationships, not only component inventory.**
   The first Button record surfaced `semanticTokens` as necessary knowledge. For Clara, knowing that a component consumes semantic roles is more important than exposing resolved brand values.

2. **Knowledge needs epistemic status/provenance.**
   A consumer needs to distinguish existing decisions, implemented behavior, runtime-observed evidence, hypotheses, and unresolved questions. Without this, structured data can make uncertain information look equally authoritative.

3. **Structured field names can cause agents to infer capabilities that do not exist.**
   Fields such as `variants` and `sizes` can be misread as configurable props even when the implementation exposes none. The record therefore needs to state whether a concept is descriptive or executable.

4. **Knowledge must reflect the executable contract, not an idealized contract.**
   The first Button record initially described a narrower API than the TypeScript implementation actually guaranteed. Reviewing the Knowledge record against `ButtonProps` exposed the drift. `children` was then made genuinely required in code, while other native capabilities such as `style`, `aria-label`, and `aria-labelledby` were documented as actually available.

5. **A Knowledge record can contradict itself even when each field looks plausible in isolation.**
   The accessibility description originally implied that visible text was always the accessible name, while the native prop surface allowed an ARIA label override. Cross-field consistency therefore matters in addition to code-vs-document consistency.

6. **Native prop forwarding creates potential component-contract escape hatches.**
   `style` can bypass Clara-owned styling/tokens and ARIA props can alter the accessibility contract. This is now an observed open question, not yet a repository-wide rule. It should become a system decision only if recurring evidence justifies one.

7. **The first record is evidence, not a schema.**
   Button alone is insufficient to formalize Clara Knowledge architecture. A structurally different second component should challenge which fields generalize and which were Button-specific.

### Current interpretation

A Clara component has at least two contract surfaces that can drift:

- **Executable contract:** TypeScript/public API + runtime behavior.
- **Knowledge contract:** what Clara tells humans and agents about that behavior.

A trustworthy Design System for agent consumers needs mechanisms to keep those surfaces aligned and to make uncertainty visible.

### Portfolio evidence sequence

Intent-first slice required a Button
→ Button exposed missing interaction-state semantics
→ first structured Knowledge record was authored
→ Knowledge introduced semantic-token and provenance needs
→ human review compared Knowledge against executable API
→ a real contract mismatch was found
→ implementation and Knowledge were corrected
→ unresolved escape-hatch questions were preserved rather than silently generalized.

This is one observed project sequence. It is not evidence that the same failure pattern will recur across all components or agents.

### Next falsification step

Use a semantically richer second component from Vertical Slice 01 — the intent input/textarea — to test whether the Button Knowledge shape survives requirements such as label relationships, helper text, multiline behavior, validation/error semantics, required/optional behavior, state, and accessibility relationships.
