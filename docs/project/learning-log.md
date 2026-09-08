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

## 2026-09-08 — Input + second Clara Knowledge record

### Context

Built `Input` (`app/src/components/Input.tsx`), Clara's second real component, and `docs/knowledge/input.json`, its second experimental Knowledge record. A human-review step preceded implementation and made one explicit correction to the prior analysis: "an input needs an accessible name" does not imply "Clara Input must own and render Label." That correction shaped the implementation — Input stays a bare native wrapper; the Slice 01 checkpoint (`app/src/App.tsx`) composes a plain `<label htmlFor>` and `<form>` around it, not new Clara components.

### Observed learnings

1. **Button's accessible-name mechanism does not generalize.** Button's required `children` prop guaranteed an accessible name "for free." `<input>` has no content model, so no equivalent free guarantee exists. This is a structural break in the Button Knowledge shape's assumptions, not just new content — it required a component-architecture decision (deferred to human review rather than silently resolved) about whether Clara should ever own label association.

2. **Some Button Knowledge fields generalize in shape but stayed content-empty.** `variants` and `sizes` again resolved to a single descriptive, non-configurable value. Two components in a row now show this — the field shape is unstressed: we still don't know how it behaves once a real component has more than one variant.

3. **`states` does not transfer as a fixed vocabulary.** Button's states (hover/pressed/focus-visible/disabled) don't map onto Input. Input has no "pressed" state, has a weaker case for hover (evaluated and explicitly rejected — a text cursor already signals interactivity, unlike a button), and raises a new question Button never had: whether "populated vs. empty" counts as a component state at all (concluded: no — it's application-level, not implemented as component styling).

4. **A component can have behavior that is real, verifiable, and still not its own.** Enter-to-submit and the accessible-name relationship are both genuinely true of the Slice 01 checkpoint, and both were runtime-verified — but neither is true of Input in isolation; both depend on how a consumer composes it (a wrapping `<form>` with a submit control; a paired `<label>`). Neither `button.json`'s `accessibility` shape nor its `props` shape had a way to say "true only if the consumer also does Y" without either burying the condition in note-prose or making the claim misleadingly unconditional. `input.json` added an experimental `compositionDependencies` field to make this explicit and structured rather than solving it silently.

5. **Value/state ownership is a new knowledge dimension Button never needed.** Button is stateless. Input inherently carries a value that must be owned somewhere. `input.json` added an experimental `valueOwnership` field to record that the checkpoint's controlled usage is product evidence for one usage, not a component guarantee — and to keep visible an unresolved risk (a consumer could pass a contradictory `value`+`defaultValue` pair) rather than silently deciding Clara is controlled-only.

6. **A second component needed real semantic tokens Button never touched.** `token-model.md` documented `surface.*`/`text.*`/`border.*` conceptually; nothing beyond `action.*`/`focus.ring` existed in `panda.config.ts` until Input. Only `surface.default` and `border.default` were implemented (plus one new `neutral.300` primitive) — `text.*` was deliberately deferred; typed value and placeholder color still inherit browser default. This confirms `semanticTokens` as a Knowledge field-shape generalizes, but the specific token vocabulary a component needs does not — each component determines its own subset of the conceptual model, and implementing that subset is a prerequisite step, not just documentation.

7. **The native-prop-forwarding question is now recurring evidence, not a one-off.** `button.json` flagged `style`/`aria-label`/`aria-labelledby` as an unresolved escape hatch. `input.json` hits the identical question a second time, plus a new instance of the same pattern (`type="text"` is a default, not a lock — a consumer can override it via forwarding, same as Button's `type="button"`). Two independent components producing the same open question is more meaningful than either alone, but this record still treats it as surfaced, not decided.

8. **`color.focus.ring` reuse is the first confirmed cross-component token.** Unlike the other findings above, this is a case where Button's specific content — not just its field shape — genuinely transferred. Verified via keyboard-driven computed-style checks in both themes.

### Current interpretation

Two Knowledge records now show a consistent pattern: field *shapes* like `props`, `accessibility`, `semanticTokens`, `knownLimitations`, `unresolved`, and per-field status/provenance generalize reasonably well across two structurally different components. Content and, in Input's case, some field *shapes themselves* (`valueOwnership`, `compositionDependencies`) do not generalize from Button alone — they had to be discovered by building a second, different kind of component. This supports the project's working interpretation (an executable contract and a Knowledge contract are distinct surfaces that can drift) and extends it: a Knowledge record's *shape* can also drift from a prior component's shape, for reasons as legitimate as content drift.

### Next falsification step

Two components is enough to show some fields generalize and some don't, but not enough to formalize a schema — `variants`/`sizes` remain untested for a real multi-value case, and `compositionDependencies`/`valueOwnership` are single-record hypotheses. A third component that either (a) has genuine variants/sizes, or (b) is a compound/multi-part component (exercising `relatedComponents`/`compositionRules`, still empty in both records so far), would be the next meaningful stress test.
