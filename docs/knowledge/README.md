# Clara Knowledge — experimental records

**Status:** Experimental — second test of Clara Knowledge, still not a committed architecture.

`docs/architecture/overview.md` lists "how should Clara Knowledge be structured, and in which data format?" as an open question. This directory does not answer that question. It holds two real records — [`button.json`](./button.json) and [`input.json`](./input.json) — written to learn from actual consumption before any schema is proposed as a repository-wide standard.

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

This is a minimal, single-pass design, not a finalized provenance model. Known gap: `decision` currently collapses decisions that predate this task (e.g. "Button renders a native `<button>`") with decisions made during this task (e.g. "hover/pressed tokens now exist"). A `note` field carries that nuance in free text for now. Whether that collapse is a problem is itself something to evaluate once a second Knowledge record exists.

## What's deliberately not here

Both records omit `antiPatterns`, `relatedComponents`, `examples`, and `compositionRules` — not because the schema forgot them, but because there still isn't real evidence for any of them (no eval loop has run, only two components exist to relate to each other, no built Explorer surface to draw examples from). Populating them now would be invented content presented as knowledge. See each record's own `unresolved` field.

## New field shapes introduced by `input.json`

- **`valueOwnership`** — Button is stateless and has no equivalent concept. Input forwards `value`/`onChange`/`defaultValue` natively and owns no state itself; this field records that a controlled-usage checkpoint is product evidence, not a component guarantee, and flags the unresolved risk of a consumer supplying a contradictory `value`+`defaultValue` pair.
- **`compositionDependencies`** — records behaviors (accessible name, Enter-to-submit) that only exist because of how a consumer composes Input with other elements (a paired `<label>`, a wrapping `<form>`), not because Input implements them itself. Folding this into `accessibility` prose was tried first and judged likely to bury a genuinely different kind of claim: "X is true only if the consumer also does Y" is conditional and structural, not a property of the component alone.

Whether these two fields are reusable beyond Input, or were only useful for this one record, is itself recorded as unresolved in `input.json` — not decided here.
