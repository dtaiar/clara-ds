# ADR-004 — Color scheme is part of Theme expression

**Status:** Accepted
**Date:** 2026-09-10
**Decision owner:** Daniel

## Context

ADR-001 made Panda CSS Clara's styling foundation and drew the boundary between Panda's mechanics and Clara's product semantics. ADR-002 decided the *mechanism* by which a Clara Theme resolves a semantic role into a rendered value — Panda's native `themes` key with runtime attribute switching — and stated explicitly that it "decides the mechanism, not the token vocabulary." ADR-003 established that Clara, not Panda's default preset, owns the token vocabulary itself.

None of those decisions says **where color scheme belongs** in Clara's system model. That question had not needed answering, because every surface built so far has been light.

A product-design pass on the Clara Explorer proposed a dark workspace as its visual direction. Attempting to express it exposed that the question is not cosmetic and cannot be deferred:

- `surface.default`, `surface.subtle` and `border.default` are declared once at Core level with fixed light values, and no theme overrides them. `app/panda.config.ts` records the reasoning at the time: they are "neutral UI chrome, not a brand-identity role like `action.primary` — no need demonstrated yet for a theme to override these."
- No `text.*` semantic role exists at all. `docs/foundations/token-model.md` names the vocabulary conceptually but deliberately defers implementing it, so no component or surface sets a text color anywhere and every string inherits `preflight`'s default near-black.

The consequence is concrete rather than theoretical: on a dark canvas, Clara today renders black text on black, and its two existing themes cannot express the difference, because the roles that would carry it are Core constants.

That leaves a boundary question with two incompatible answers, and Clara has to pick one before either can be built against.

## Decision

**Color scheme is part of Theme expression. A Clara Theme resolves it. Clara does not introduce a separate color-scheme mechanism alongside Themes.**

Three things follow.

### 1. The theme contract extends to surface, text and border

A valid Clara Theme must resolve the semantic roles that express visual identity, not only the action/focus roles the two current themes happen to resolve:

```text
action.primary / primaryHover / primaryPressed / onPrimary
focus.ring
surface.default / surface.subtle
border.default
text.primary / text.secondary
```

This does not introduce a new conceptual category into Clara's token model. Surface, text and border mappings were already part of the documented Theme contract; this decision makes the currently demonstrated role set explicit and binding in implementation. `text.primary` and `text.secondary` are nonetheless newly *implemented* roles — the concept existed in the model, the implementation did not. `docs/foundations/token-model.md` already states that a viable Theme needs "semantic surface mappings; semantic text mappings; semantic border mappings" — the implementation was narrower than the documented model. This ADR closes that gap and makes the requirement binding rather than aspirational, in the sense ADR-002 already defined as public contract: "the fact that a Theme must resolve every required role."

The specific role set above is the minimum the current surfaces demonstrate. It is not proposed as complete. Adding to it is a change to this contract and should be decided as one.

### 2. Clara does not add a parallel color-scheme mechanism

Clara will not introduce a `_dark` condition, a `prefers-color-scheme` layer, or any other color-scheme switch that operates independently of the theme layer.

The alternative was available and is the more conventional choice: leave the two existing themes light, and add an orthogonal light/dark condition that both themes resolve under. It is rejected because it would give Clara **two systems that both claim to own visual expression**, and no stated rule for which one wins when they disagree. A consumer — human or agent — asking "what determines how this renders?" would have two answers. Every future role would have to be classified as theme-varying, scheme-varying, or both. That is a larger and more permanent complexity than the problem it solves, and it directly contradicts the "one source, multiple consumers" principle at the level of the system's own configuration.

One expression layer, with color scheme inside it, keeps the answer singular: **a Theme fully determines visual expression.**

### 3. Light and dark are theme expressions, not modes

Under this decision, "dark mode" is not a Clara concept and should not appear in Clara's vocabulary, Knowledge, or documentation as a feature. What exists is themes, each of which has a color scheme as one property of its expression.

For Slice 01 this is demonstrated by the two theme names ADR-002 already approved, with no third name introduced:

- `alternate` — light expression
- `explorer` — dark expression

ADR-002 states that these names are deliberately neutral and temporary and that "the visual values behind them (color choices) are experimental inputs to this slice, not Clara Core decisions." Changing `explorer`'s values is therefore within what ADR-002 already permits and does not require re-opening it.

## What this decision does not change

- **ADR-002 still owns the theme mechanism.** Panda's `themes` key, the `[data-panda-theme]` attribute, `staticCss.themes`, and everything in `styled-system/` remain implementation detail and remain out of Clara's public vocabulary. This ADR adds nothing to that mechanism and changes nothing about it. It decides only what a Theme is *responsible for*.
- **The Core/Theme split itself.** Core continues to define semantic roles; Themes continue to resolve them to values. This decision moves three roles from "declared in Core with a fixed value" to "declared in Core, resolved per Theme." That is the split being applied more consistently, not redrawn.
- **Component contracts.** No component changes. Components continue to consume semantic roles and remain unaware of which theme is active — which is the property this decision is testable against.

## Consequences

### Positive

- Clara gains a materially stronger test of **H4** (`docs/project/foundation.md` — "behavior and brand can be separated") and of `docs/foundations/token-model.md`'s own evaluation question "Can its primary color family change without editing component recipes?". A light↔dark pair switched by one attribute, with zero component edits, is a harder thing for the architecture to survive than two accent colors on an identical white ground.
- Visual expression has exactly one owner, which keeps the system explainable to both consumer types without describing a mechanism.
- `text.*` finally exists, closing a gap that made every text color in Clara an unowned browser default rather than a system decision.

### Trade-offs

- Every future Theme now carries a larger obligation: five more roles, and an implicit commitment to a color scheme. Authoring a Theme is correspondingly less trivial. This is accepted as the honest cost of a Theme being a contract rather than an accent-color override.
- Clara cannot express "the same theme, in light or dark" without authoring two themes. If that need appears — a product wanting its identity in both schemes — this decision will have to be revisited, and that revisit is anticipated below rather than pre-solved.
- No contrast validation exists. Extending the contract increases the number of foreground/background pairs a theme can get wrong, with nothing in the system to catch it. `docs/foundations/token-model.md` already records automated accessibility validation as intentionally open; this decision enlarges that gap without closing it, and says so rather than implying the roles are safe because they are declared.

## Open question — Clara's neutral primitives are light-biased

Recorded as unresolved, deliberately not decided here.

The light expression resolves entirely from Core's existing neutral primitives (`neutral.0/100/300/500/900`). The dark expression cannot, and supplies its own palette values theme-locally — the same way `explorer` already supplies its own `accent`.

That asymmetry is a finding, not an oversight: Clara's neutral ramp was built one value at a time from light-surface needs, and it shows. Whether Clara should own a polarity-neutral ramp that both expressions draw from, or whether themes legitimately supply their own palettes, is a real system-model question with no evidence behind either answer yet. One dark theme is not enough to decide it.

## Evidence that would prompt reconsideration

- If a product needs its own identity in both light and dark and authoring two full themes proves duplicative in practice, the "no parallel mechanism" position should be re-evaluated against a scheme-within-theme model — which is a different decision from the orthogonal-layer alternative rejected above, and should be judged on its own.
- If a second dark theme is authored and duplicates most of the first theme's neutral palette values, that is evidence for the shared-ramp side of the open question above.
- If theme authors repeatedly produce failing foreground/background pairs, that is evidence the contract needs validation attached to it, not merely more roles.
- If Clara Knowledge or a future machine interface ends up needing to describe *how* color scheme is switched in order to explain Clara's behavior, that is evidence this decision's boundary is leaking into vocabulary, in the same way ADR-002 anticipates for its own mechanism.

## What this decision does not claim

This ADR does not claim that the resulting themes are accessible, contrast-validated, or production-ready. It does not claim dark expression was validated against any external visual reference. It decides one boundary question and nothing about the quality of the values chosen within it.

## References

- ADR-001 — Panda/Clara responsibility boundary this decision inherits
- ADR-002 — theme mechanism and the public/implementation-detail split this decision extends
- ADR-003 — Clara's ownership of the token vocabulary these roles belong to
- `docs/foundations/token-model.md` — the semantic role vocabulary and theme contract this decision makes binding
- `docs/project/foundation.md` — H4, the hypothesis this decision creates a stronger test for
