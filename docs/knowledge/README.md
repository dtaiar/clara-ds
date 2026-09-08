# Clara Knowledge — experimental records

**Status:** Experimental — first test of Clara Knowledge, not a committed architecture.

`docs/architecture/overview.md` lists "how should Clara Knowledge be structured, and in which data format?" as an open question. This directory does not answer that question. It holds one real record — [`button.json`](./button.json) — written to learn from actual consumption before any schema is proposed as a repository-wide standard.

Do not treat `button.json`'s shape as a template to copy for the next component without re-evaluating it. If a second component's Knowledge needs the same fields, that is evidence worth acting on; if it needs different fields, that is evidence too. Either way, committing to a shared schema is a Knowledge-architecture decision and should be raised for human review — not inferred from one file.

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

`button.json` omits `antiPatterns`, `relatedComponents`, `examples`, and `compositionRules` — not because the schema forgot them, but because Button doesn't yet have real evidence for any of them (no eval loop has run, no second component exists to relate to, no built Explorer surface to draw examples from). Populating them now would be invented content presented as knowledge. See the record's own `unresolved` field.
