# ADR-002 — Theme architecture for Slice 01

**Status:** Accepted
**Date:** 2026-09-08
**Decision owner:** Daniel

## Context

ADR-001 adopted Panda CSS as Clara's styling foundation and drew a boundary: Panda owns styling mechanics, Clara owns product semantics. Vertical Slice 01 needs a concrete answer to a question ADR-001 left open — how a Clara Theme actually resolves a semantic role like `action.primary` into a rendered value, and how that mechanism is implemented in Panda without becoming Clara's public vocabulary.

`docs/foundations/token-model.md` already proposes the semantic role vocabulary this decision must support (surface, text, border, action, focus) and states the theme contract's shape conceptually. This ADR decides the *mechanism*, not the token vocabulary.

Panda offers more than one way to implement multiple themes (see the research summary this decision is based on): a single config using Panda's built-in `themes` key with runtime attribute switching, the same runtime approach built from hand-rolled custom conditions instead of Panda's dedicated feature, or fully separate configs/builds per theme with no runtime switching. These were evaluated directly against Slice 01's evaluation questions (docs/slices/01-intent-first-discovery.md) before choosing.

## Decision

Slice 01 will use **Panda's native multi-theme mechanism** (the `themes` key in `panda.config.ts`) with **runtime theme switching** via Panda's scoped theme selector.

Two theme names are approved for this experiment only:

- `explorer`
- `alternate`

These are deliberately neutral, temporary identifiers, not brand names. The visual values behind them (color choices) are experimental inputs to this slice, not Clara Core decisions. Naming a theme after a color (`yellow`, `orange`) would have implied a visual commitment ADR-001 and `docs/slices/01-intent-first-discovery.md` both explicitly say has not been made.

### Clara owns the contract; Panda owns the mechanism

This is the boundary this ADR exists to state clearly:

```text
Clara semantic theme contract   (public Clara system knowledge)
        ↓
Panda theme implementation      (implementation detail)
        ↓
CSS variables
        ↓
component recipes
```

**Public Clara system knowledge** (what a human or agent consumer should know about):
- the semantic role names Clara components consume (`color.action.primary`, `color.action.onPrimary`, `color.focus.ring`, and the rest of the vocabulary in `docs/foundations/token-model.md`);
- the fact that a Theme must resolve every required role;
- the requirement that components consume roles, never brand-specific primitives directly.

**Implementation detail** (Panda-specific, not part of Clara's documented API or Knowledge vocabulary):
- the `themes` key's shape in `panda.config.ts`;
- the `[data-panda-theme="…"]` attribute and selector Panda generates;
- `staticCss.themes`, Panda's static-analysis/codegen mechanics, and anything else in `styled-system/` (generated output, per rule 9 — not hand-maintained, not Clara Knowledge).

Concretely: Clara components and Clara Knowledge should never reference `data-panda-theme` or a Panda theme name as if it were a Clara concept. If Clara's independence from Panda ever requires hiding that attribute behind Clara's own naming (e.g. a `data-clara-theme` wrapper), that is a valid future evolution of this decision — see "Evidence that would prompt reconsideration" below. For Slice 01, the attribute is used directly, as infrastructure, without being surfaced as a Clara-authored concept.

### Scope for Slice 01

- Use Panda's native multi-theme capability (the `themes` config key).
- Use runtime switching (attribute-based), not a build-time-only split.
- Demonstrate two visually different theme expressions under the `explorer` / `alternate` names.
- Both themes must resolve the same Clara semantic roles — no role exists in one theme and not the other.
- No component or recipe code changes between themes — only the active theme attribute changes.

## Why runtime multi-theme, for this experiment

- It gives the strongest available evidence for the "behavior before brand" hypothesis (principle 4, H4): a live, in-browser toggle between two visually distinct themes with zero component edits is more convincing than a rebuild-per-theme split would be.
- It directly answers `docs/foundations/token-model.md`'s own evaluation question — "Can its primary color family change without editing component recipes?" — with an observable, repeatable action rather than an inferred claim.
- It is Panda's documented, purpose-built mechanism for this problem, which keeps Slice 01's implementation surface small (rule 6: avoid unnecessary abstractions) rather than reimplementing theme-switching by hand.
- Both themes shipping in one CSS bundle is an acceptable trade-off at this scale (one small Explorer surface, two themes) — not evaluated as acceptable at unknown future scale.

## What Panda is NOT responsible for (extends ADR-001)

Consistent with ADR-001, this decision does not make Panda's theme mechanism part of Clara's system knowledge, discovery model, or public API. Panda's `themes` key, `staticCss`, and generated `styled-system/themes` module are styling infrastructure Clara consumes — not vocabulary Clara Docs, Clara CLI, or any future Knowledge representation should expose as if Clara defined it.

## Panda implementation detail worth recording

Declaring a theme under the `themes` key in `panda.config.ts` makes it available as a module under the generated `styled-system/themes` (tree-shaken if unused), but **does not by itself cause that theme's CSS to be emitted into the generated stylesheet**. Panda's static analysis only includes a theme's CSS in the build output when that theme is also listed in `staticCss.themes` (an explicit array of theme names, or `['*']` for all declared themes). Declaring a theme without listing it there results in a theme that exists in code but produces no usable CSS at runtime — a failure mode that looks like a config bug rather than a missing opt-in. Both `explorer` and `alternate` must be listed under `staticCss.themes` for this slice's runtime switch to work.

## Evidence that would prompt reconsideration

- If maintaining Clara's semantic contract independently of Panda's `themes` key/attribute proves impractical (e.g. Clara Docs or CLI output ends up needing to describe Panda's mechanism to explain Clara's own behavior), that would be evidence the boundary in this ADR is not holding and needs revision.
- If more than two themes, or themes needing independent deployment/versioning, become necessary, the "all themes in one CSS bundle" trade-off should be re-evaluated against a build-time-separated approach.
- If Panda's static-inclusion behavior (`staticCss.themes`) changes in a future Panda version, or proves fragile in practice, this ADR's implementation note should be revisited and Panda's current documentation re-checked before assuming this decision still holds.
- If evidence from Slice 01 shows agents or humans conflating Clara's theme contract with Panda's mechanism despite this boundary, that is evidence the separation needs to be enforced more explicitly (e.g. a wrapping abstraction), not just documented.

## Observed implementation evidence

Recorded from building the Slice 01 checkpoint (`app/`), per the evidence model in `docs/project/foundation.md`. These are observations from this one implementation pass, not generalized claims about Panda, about agent behavior, or about future config changes.

- A `themes` block nested inside `theme` (i.e. `theme: { extend: {...}, themes: {...} }`) produced no theme artifacts: no `styled-system/themes` output, no `[data-panda-theme]` selectors in the generated CSS.
- With that nesting, `npm run build` still succeeded — no error or warning was produced.
- Moving `themes` to a top-level key, a sibling of `theme` in `panda.config.ts`, produced the expected `styled-system/themes` output and `[data-panda-theme="explorer"]` / `[data-panda-theme="alternate"]` blocks in the generated CSS.
- Both theme expressions were verified at runtime in a browser (Playwright, against the built output): toggling the sample element's `data-panda-theme` attribute between `explorer` and `alternate` changed its rendered background and text color to the values each theme's semantic tokens resolve to.
- The sample component's own generated CSS rules (`.bg_action\.primary`, `.c_action\.onPrimary`, the focus-ring utilities) referenced only CSS custom properties (e.g. `var(--colors-action-primary)`); the raw theme color values appeared only inside the two `[data-panda-theme="…"]` blocks that define those properties.

## References

- Panda CSS — Multi-Theme Tokens: https://panda-css.com/docs/guides/multiple-themes
- Panda CSS — Building a Multi-Brand Design System (blog): https://panda-css.com/blog/building-a-multi-brand-design-system-with-panda-css
- Panda CSS — Using Vite: https://panda-css.com/docs/installation/vite
- `docs/foundations/token-model.md` — semantic role vocabulary this decision implements
- `docs/slices/01-intent-first-discovery.md` — evaluation questions this decision is answerable against
- ADR-001 — Panda/Clara responsibility boundary this decision extends
