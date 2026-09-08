# Clara Knowledge — experimental records

**Status:** Experimental — third test of Clara Knowledge, still not a committed architecture.

`docs/architecture/overview.md` lists "how should Clara Knowledge be structured, and in which data format?" as an open question. This directory does not answer that question. It holds three real records — [`button.json`](./button.json), [`input.json`](./input.json), and [`destructive-confirmation.json`](./destructive-confirmation.json) — written to learn from actual consumption before any schema is proposed as a repository-wide standard.

Do not treat either record's shape as a template to copy for the next component without re-evaluating it. `input.json` reused most of `button.json`'s field shapes but also added two experimental fields with no Button equivalent — `valueOwnership` and `compositionDependencies` — because Input has real state ownership and context-dependent behavior (accessible name, Enter-to-submit) that Button's shape had no way to express honestly. See `docs/project/learning-log.md` for the full comparison. Two records show some fields generalize and some don't; that is evidence worth acting on, not yet enough to commit to a shared schema. Any such decision should be raised for human review.

## Status / provenance values

Each significant field in a record carries a `status`, so a human or agent consumer can tell what kind of claim they're reading:

| Status | Meaning |
|---|---|
| `decision` | Traces to an existing Clara decision — a project document, an ADR, or an explicit approval recorded in this task. Not independently tested here. |
| `implemented` | Exists in code (component, config, generated types) and the build succeeds, but was not separately runtime-verified in this pass. |
| `observed` | Runtime-verified in this implementation pass — e.g. a computed-style check against the built app. |
| `hypothesis` | A reasoned guess, not sourced from a decision and not tested. |
| `unresolved` | An explicitly open question, deliberately left unanswered rather than guessed at. |

This is a minimal, single-pass design, not a finalized provenance model. Known gap: `decision` currently collapses decisions that predate this task (e.g. "Button renders a native `<button>`") with decisions made during this task (e.g. "hover/pressed tokens now exist"). A `note` field carries that nuance in free text for now.

## `status` vs. `origin`

The second Knowledge record surfaced a real instance of the gap above: `input.json` originally marked "Placeholder text is not an accessible name" as `status: "decision"`, but that is not a Clara decision — it comes from web/accessibility semantics Clara did not choose and cannot change. `button.json` had the same problem for "Accessible name equals the visible text label by default": the *mapping* from text content to accessible name is a web-platform rule, even though Clara's own decision (requiring `children`) sits just upstream of it.

`status` answers *how established* a claim is (decided / implemented / observed / hypothesis / unresolved). It does not answer *where the claim's truth comes from*. Conflating the two let a platform fact read as if Clara had authored or chosen it.

Both records now carry an experimental `origin` field on the specific claims where this ambiguity was found — currently two values, `"clara"` (implied by the field's absence — the default) or `"web-platform"` (stated explicitly). It is applied narrowly, only to claims where a reader could otherwise mistake a platform fact for a Clara decision — not blanket-applied across every claim in either record. This is the smallest correction that fixed the specific misrepresentation found; it is not a proposal for a general provenance/origin taxonomy (external reference, product/slice, implementation, etc.), and whether two values are enough, or whether `origin` deserves the same treatment on claims where it wasn't applied, is left unresolved in `input.json`.

## What's deliberately not here

Both records omit `antiPatterns`, `relatedComponents`, `examples`, and `compositionRules` — not because the schema forgot them, but because there still isn't real evidence for any of them (no eval loop has run, only two components exist to relate to each other, no built Explorer surface to draw examples from). Populating them now would be invented content presented as knowledge. See each record's own `unresolved` field.

## New field shapes introduced by `input.json`

- **`valueOwnership`** — Button is stateless and has no equivalent concept. Input forwards `value`/`onChange`/`defaultValue` natively and owns no state itself; this field records that a controlled-usage checkpoint is product evidence, not a component guarantee, and flags the unresolved risk of a consumer supplying a contradictory `value`+`defaultValue` pair.
- **`compositionDependencies`** — records behaviors (accessible name, Enter-to-submit) that only exist because of how a consumer composes Input with other elements (a paired `<label>`, a wrapping `<form>`), not because Input implements them itself. Folding this into `accessibility` prose was tried first and judged likely to bury a genuinely different kind of claim: "X is true only if the consumer also does Y" is conditional and structural, not a property of the component alone.

Whether these two fields are reusable beyond Input, or were only useful for this one record, is itself recorded as unresolved in `input.json` — not decided here.

## A third record introduces a different kind of Knowledge: Pattern

`destructive-confirmation.json` is Clara's first **Pattern** Knowledge record, produced for Vertical Slice 01's demonstrated intent ("I need users to confirm before deleting something.") — see `docs/slices/01-intent-first-discovery.md`. It reuses `button.json`/`input.json`'s per-claim `status`/`note` shape wherever it applied cleanly, but it is not the same kind of record, for a structural reason rather than a stylistic one: a component record documents an executable artifact that already exists (`app/src/components/*.tsx`); a Pattern record, at this stage, documents product/UX judgment with **no executable artifact behind it at all**. That difference shows up in three concrete ways:

- **No `props`, `variants`, `sizes`, `semanticTokens`, or single-file `sourceOfTruth.implementation`.** These fields all assume something was built and can be inspected; nothing was, so they don't apply and were dropped rather than left empty.
- **A structurally new field, `composition`, describing relationships between entities.** `relatedComponents` existed by name in both prior records but stayed empty in both — this is the first record to actually populate a field like it, and it needed a richer shape (`role` + `component` + its own `status`) than a flat name list, because a Pattern's core content *is* the relationship between a confirmation surface, its copy, and two required actions — not a property of one component.
- **A lower epistemic ceiling.** `button.json`/`input.json` earned `"observed"` through runtime checks (Playwright against a built app). Nothing in `destructive-confirmation.json` can reach `"observed"` yet, because there is no confirmation surface to run a check against — every claim in it tops out at `"hypothesis"`, except the one line quoted directly from the slice doc (`demonstratedIntent`, `status: "decision"`) and the scoping choices made in this implementation pass (`knownLimitations`, `status: "decision"`).

One more finding worth flagging explicitly: `origin` (see below) is not applied anywhere in `destructive-confirmation.json`, because no claim in it traces to a web-platform fact the way Input's placeholder/label claims did — its claims trace to product/UX reasoning instead. Whether that means `origin` needs a third value (e.g. distinguishing product/UX convention from web-platform fact), or Pattern records simply don't need `origin` at all, is recorded as unresolved in the record itself rather than decided here.

None of this is proposed as a Pattern schema. It is one record, evaluated the same way Input was evaluated against Button: which fields generalized, which didn't, and what genuinely new shape was required.
