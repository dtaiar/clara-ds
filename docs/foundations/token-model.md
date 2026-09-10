# Clara DS — Minimum Token Model

**Status:** Proposed for Vertical Slice 01  
**Version:** 0.1  
**Owner:** Daniel  
**Date:** 2026-09-08

## Decision to test

For the first vertical slice, Clara will use three conceptual levels:

```text
Primitive tokens
      ↓
Semantic tokens
      ↓
Component recipes
```

A Theme resolves semantic roles to visual values. Components consume semantic roles rather than brand-specific primitive names whenever the value expresses product meaning.

This model is deliberately small. It should grow only when the Intent-first Discovery product surface exposes a real need.

## Why this maps well to Panda CSS

Panda distinguishes raw design tokens from semantic tokens. Semantic tokens can reference raw tokens and can resolve conditionally. Panda recipes provide type-safe multi-variant styling APIs for components.

That gives Clara a useful implementation mapping:

```text
Clara concept             Panda capability
------------------------------------------------
Primitive value        →  token
Semantic role          →  semantic token
Component styling API  →  recipe
Interaction/state      →  condition + recipe
```

The mapping is convenient, but Clara's product language should not be defined only by what Panda happens to support. Panda is implementation infrastructure; Clara owns the semantic model.

## Level 1 — Primitive tokens

Primitive tokens describe reusable visual values without product intent.

For Slice 01, Clara is expected to need primitives in these categories:

### Color

Neutral ramps plus a theme-provided accent/brand ramp.

Examples:

```text
color.neutral.0
color.neutral.50
color.neutral.100
...
color.neutral.900
color.neutral.1000

color.accent.50
...
color.accent.900
```

The names above describe the proposed conceptual model, not final Panda syntax.

Clara Core should not define `blue` as synonymous with `primary`. A Theme may choose any appropriate accent family.

### Spacing

Use a small consistent scale rather than values named for individual components.

### Decision — smallest demonstrated scale, Clara-owned

**Decided (implementation decision, not an ADR — see `.claude/skills/building-clara/SKILL.md`, decision threshold):** Slice 01 implements only the spacing values the checkpoint (`app/src/App.tsx`) actually demonstrates: `space.2` (`0.5rem`), `space.4` (`1rem`), `space.8` (`2rem`), used for container gap/padding and button `paddingX`/`paddingY`. No other values (`0`, `1`, `3`, `6`, `12`, …) are declared. Adding them ahead of a demonstrated need was considered and rejected as anticipatory, conflicting with rule 6 (smallest testable implementation).

These are declared under `theme.extend.tokens.spacing` in `app/panda.config.ts`, the same pattern already used for color and typography primitives.

This decision depends on a broader one: **ADR-003** (`decisions/ADR-003-panda-token-vocabulary-ownership.md`) stops Clara from inheriting `@pandacss/preset-panda`'s default theme, so that `space.2/4/8` are genuinely the only spacing tokens in the generated system — not three named values sitting inside Panda's much larger inherited scale. Read ADR-003 first; this entry only records the specific values chosen within the boundary it sets.

Semantic spacing roles (e.g. `spacing.stack.sm`) are not introduced at this stage. Spacing values don't yet carry the kind of theme-resolved product meaning that justified a semantic layer for color (`action.primary`) or typography (`textStyle: "heading"`) — a semantic spacing vocabulary should wait for a pattern or recipe layer to demonstrate a recurring, named relationship worth abstracting.

Observed evidence (built and verified in `app/`, per the evidence model in `docs/project/foundation.md`): after regenerating (`panda codegen`), the generated `SpacingToken` TypeScript union is exactly `"2" | "4" | "8" | "-2" | "-4" | "-8"` (the negative variants are Panda's own auto-derived margin counterparts, not separately declared). `npm run build` passes. At runtime (Playwright, built preview), the container's computed `gap` and `padding` and the button's computed `padding-left`/`padding-top` matched `space.4`/`space.8`/`space.4`/`space.2` exactly, unchanged from before the vocabulary-ownership change — confirming this was a source-of-truth change, not a visual one.

### Radius

```text
radius.none
radius.sm
radius.md
radius.lg
radius.full
```

### Decision — one migration value only, not a radius model

**Decided (implementation decision, not an ADR):** Only `radius.md` (`0.375rem`) is declared, under `theme.extend.tokens.radii`. This exists solely because ADR-003 dropping `@pandacss/preset-panda` would otherwise silently break the checkpoint's button (`borderRadius: "md"`) — verified before implementing: with no `radii` category defined at all, Panda generated `border-radius: md` (invalid CSS, silently ignored by browsers, no build error). `md`'s value was set to match what Panda's default preset previously resolved for that key, so this is a migration requirement, not a new design decision — a full radius scale (`none`/`sm`/`lg`/`full`, and whether radius needs semantic roles) remains open and undecided, to be designed when a real need demonstrates it, consistent with this document's evaluation question about unused/unjustified tokens.

### Typography primitives

```text
font.family.sans
font.family.mono

font.size.*
font.weight.*
font.lineHeight.*
font.letterSpacing.*
```

The final scale should be driven by the Explorer's typography needs rather than copied wholesale from another system.

### Decision — `fonts.mono` primitive, for a human-interface distinction

**Decided (implementation decision, not an ADR — see `.claude/skills/building-clara/SKILL.md`, decision threshold):** `fonts.mono` (a system monospace stack) is now declared under `theme.extend.tokens.fonts` in `app/panda.config.ts`, alongside `fonts.sans`.

The demonstrated need: the Explorer's Inspection Console direction distinguishes human-facing interface language from literal machine-readable facts surfaced from Clara Knowledge — `composition[].availability` values, the Pattern's source file path, and structured field names. Rendering both in the same sans typeface left no visual signal that some of what's on screen is a direct, unmodified read of a JSON file and some is authored interface copy. This is a **human-interface representation choice**, not a claim that AI agents themselves need or benefit from monospace typography — agents consume the underlying JSON directly, not its rendered typography.

Primitive-level only, matching how `fonts.sans` was introduced: no `textStyle` role is declared for `mono`, and no broad family of mono text styles was created. Consuming code applies `fontFamily: "mono"` directly at the few call sites that render a literal Knowledge value, the same way early call sites referenced `fonts.sans` primitives directly before any text style existed.

### Other primitives only when needed

Possible future categories include shadow, duration, easing, size, border width, and breakpoint. They should not be added to v0.1 until the slice requires them.

## Level 2 — Semantic tokens

Semantic tokens describe **role or intent**, not a particular color value.

The initial semantic color vocabulary should be small enough to understand and broad enough to theme the Explorer.

### Surface

```text
color.surface.default
color.surface.subtle
color.surface.raised
```

### Text / foreground

```text
color.text.primary
color.text.secondary
color.text.muted
color.text.inverse
```

### Border

```text
color.border.default
color.border.subtle
color.border.strong
```

### Action

```text
color.action.primary
color.action.primaryHover
color.action.primaryPressed
color.action.onPrimary
```

### Decision — Button interaction states demonstrate the need for hover/pressed

**Decided (implementation decision, not an ADR — see `.claude/skills/building-clara/SKILL.md`, decision threshold):** `color.action.primaryHover` and `color.action.primaryPressed` are now implemented as semantic tokens, declared under `theme.extend.semanticTokens` (Core default, neutral, overridden per theme) in `app/panda.config.ts`, matching the pattern already used for `action.primary`/`action.onPrimary`.

This vocabulary was already named above but left unimplemented until Clara had a real interactive element that demonstrated the need. The Slice 01 checkpoint's original button (`app/src/App.tsx`, before this decision) was a static theme-toggle proof and only exercised `focus-visible`, which is keyboard-only. Extracting a real `Button` component (`app/src/components/Button.tsx`) that a mouse user actually clicks exposed the gap: without hover/pressed feedback, a filled primary action gives no visual response to a pointer user at all. That is the demonstrated need — not convention. No other action-color roles (e.g. secondary, disabled) were added; nothing beyond what Button's own click/hover/press interaction requires.

Values chosen: each theme's `primaryHover`/`primaryPressed` are the theme's own `accent` primitive, uniformly darkened (~15% / ~30% RGB scaling) — `explorer`: `#D08D1E` / `#AC7419` from `#F5A623`; `alternate`: `#4D4DB6` / `#404096` from `#5B5BD6`. This is a placeholder methodology, not a validated contrast pair, consistent with this document's existing position that exact color values are not yet approved (see "What remains intentionally open"). Revisit when Clara defines a real contrast-validation step for themes.

Observed evidence (built and verified in `app/`, per the evidence model in `docs/project/foundation.md`): after `panda codegen`, the generated `ColorPalette`/token vocabulary includes `action.primaryHover` and `action.primaryPressed` alongside the existing `action.primary`/`action.onPrimary`. `npm run build` and `npm run lint` both pass. At runtime (Playwright, built preview), the Button's computed `background-color` changed correctly on `:hover` and `:active` in both `explorer` and `alternate` themes, matching each theme's declared hover/pressed values, with no change to `focus-visible` behavior (still `color.focus.ring`, unchanged from the ADR-002 checkpoint).

### Focus

```text
color.focus.ring
```

### Decision — surface, text and border are theme-resolved (ADR-004)

**Decided (ADR-004 — `decisions/ADR-004-color-scheme-theme-expression.md`):** color scheme is part of Theme expression. A Clara Theme resolves it; Clara does not add a parallel `_dark`/`prefers-color-scheme` mechanism alongside Themes. That ADR owns the boundary reasoning and the rejected alternative; this entry records only what was implemented within it.

`surface.default`, `surface.subtle` and `border.default` were previously declared once at Core level with fixed light values, on the reasoning that they are neutral UI chrome rather than brand-identity roles. Expressing a dark theme showed that reasoning was wrong — surface, border and text are exactly what a color scheme varies. They remain **declared** in Core (Core still owns the role names, and the Core values are the neutral default before any theme applies); both themes now **resolve** them.

Implemented:

- **One new primitive.** `neutral.500` (`#6b6b6b`), for light-mode secondary text. No existing stop could serve it: `300` (`#d4d4d4`) is a boundary color, unreadable as text, and `900` is the primary foreground. Same category of one-value-at-a-time addition as `300` (Input's border) and `100` (the suggestion control's hover fill).
- **Two new semantic roles.** `text.primary` and `text.secondary`. Before this, Clara declared no text color at all and every string inherited `preflight`'s browser default — text color was the one visual property no Clara decision owned. `text.muted` and `text.inverse` were **not** added: nothing consumes a third tier, and Button already covers foreground-on-accent via `action.onPrimary`.
- **Both themes resolve the extended set.** `alternate` is the light expression and needs no theme-local palette values — Core's existing neutrals cover it, and its values reproduce exactly what Core previously declared as fixed defaults, so light rendering is unchanged. `explorer` is the dark expression and supplies five theme-local palette values (`ground`, `groundRaised`, `line`, `ink`, `inkMuted`), declared the same way it already declares `accent`.

Deliberately **not** changed by this pass: the typography scale, the spacing scale, the radius vocabulary, the neutral ramp beyond the single demonstrated primitive, the text roles beyond primary/secondary, and the surface/border role sets. Values are placeholder-quality and not validated contrast pairs, consistent with this document's existing position.

**Open question (ADR-004):** the light expression resolves entirely from Core's neutrals; the dark expression cannot, because Clara's neutral ramp was built one value at a time from light-surface needs and is light-biased as a result. Whether Clara should own a polarity-neutral ramp both expressions draw from is unresolved. One dark theme is not enough to decide it.

Observed evidence (built and runtime-verified in `app/`, per the evidence model in `docs/project/foundation.md`): after `panda codegen`, the generated `ColorToken` union is exactly the 21 entries above — no accidental vocabulary growth. `npm run build` and `npm run lint` both pass. At runtime (Playwright, against the built preview server), toggling only `data-panda-theme` between `explorer` and `alternate` on the existing surface — with no component or recipe edit — changed the root background (`#0D0E10` ↔ `#ffffff`), primary text (`#E8EAED` ↔ `#111111`), secondary text (`#8B9096` ↔ `#6b6b6b`), the Input's background/border, and the Button's accent, while `textStyle: "heading"` stayed 24px in both. This is the strongest evidence produced so far for H4 (`docs/project/foundation.md` — behavior and brand can be separated) and for this document's own evaluation question 1.

### Status

Status roles such as danger, success, warning, and info are intentionally deferred unless Slice 01 needs them. We should not create a complete status palette simply because Design Systems commonly have one.

## Why `action.primary` is not a color

`primary` is a role in the interaction hierarchy.

A Theme might resolve it as:

```text
Theme A
color.action.primary → yellow primitive
color.action.onPrimary → near-black

Theme B
color.action.primary → orange primitive
color.action.onPrimary → near-black or white, depending on validated contrast

Theme C
color.action.primary → blue primitive
color.action.onPrimary → white
```

This means a product does not merely choose a `primary hex`. A viable Theme must resolve a coherent semantic set, including foreground and interaction states.

## Level 3 — Component recipes

Components consume semantic tokens and expose a constrained styling/variant API.

For example, the Button recipe might eventually express:

```text
Button
  visual: primary | secondary | ghost
  size: sm | md | lg
  state behavior: hover | pressed | focus-visible | disabled
```

A primary Button should consume roles such as:

```text
background → color.action.primary
foreground → color.action.onPrimary
hover      → color.action.primaryHover
pressed    → color.action.primaryPressed
focus      → color.focus.ring
```

The component should not need to know whether the current Theme is yellow, orange, blue, or another validated visual expression.

## Typography: semantic styles, not only sizes

The Explorer already gives us evidence that typography has roles above raw font values.

Candidate roles for Slice 01:

```text
typography.display
typography.heading
typography.body
typography.label
typography.supporting
```

### Decision — Panda text styles, not semantic tokens

**Decided (implementation decision, not an ADR — see `.claude/skills/building-clara/SKILL.md`, decision threshold):** Clara's semantic typography roles are implemented as Panda **text styles** (`theme.extend.textStyles` in `app/panda.config.ts`), each composed from primitive typography tokens (`fonts`, `fontSizes`, `fontWeights`, `lineHeights`). A text style bundles the CSS properties a role needs (family, size, weight, line-height) into one named, atomic contract — `textStyle: "heading"` — rather than requiring components to assemble several separate semantic tokens. This gave the clearest shared contract for a role that is inherently a composite of several properties, versus semantic *tokens*, which resolve a single value.

Implemented for Slice 01: `heading`, `body`, `label`, `supporting` — the four roles named in the entry surface (`docs/slices/01-intent-first-discovery.md`). `display` is deferred; nothing in Slice 01's scope currently needs it, and it should only be added when a real surface demonstrates the need (rule 6).

Declared once at Core level (`theme.extend`, not inside a `themes.<name>` block): both `explorer` and `alternate` resolve the same four roles identically. Slice 01 has not demonstrated a need for per-theme typefaces, so no font primitive is theme-specific yet — unlike color, where `action.primary` etc. are deliberately theme-resolved. If a later slice needs per-theme typography, that would extend this decision, not contradict it.

`letterSpacings` primitives were not added — no role in this scale needed letter-spacing variation, so the token would have been unused and unjustifiable (see this document's own evaluation question: "Did we create tokens that are unused or impossible to justify from the slice?").

Observed evidence (built and verified in `app/`, per the evidence model in `docs/project/foundation.md`): `npm run build` and `npm run lint` both pass. The generated stylesheet contains one atomic class per role (`.textStyle_heading`, `.textStyle_body`, `.textStyle_label`, `.textStyle_supporting`), each resolving to CSS custom properties that trace back to the primitive tokens above — confirmed by inspecting `dist/assets/*.css` after build. At runtime (Playwright, against the built preview server), computed styles matched the configured values exactly (`heading`: 24px / 700 / 28.8px line-height; `body`: 16px / 400 / 24px; `label`: 14px / 500 / 21px; `supporting`: 14px / 400 / 21px), and were identical after toggling between the `explorer` and `alternate` themes — only the button's theme-resolved color changed, confirming typography stayed Core-level and brand-neutral as intended.

The exact scale values (`xl`/`md`/`sm` sizes; `regular`/`medium`/`bold` weights; `tight`/`normal` line-heights) are an implementation choice for this checkpoint, not a validated type scale — consistent with this document's existing position that spacing and color primitive values are not yet approved either.

## Theme contract

A Clara Theme should eventually be treated as a contract rather than an arbitrary style override.

For Slice 01, a valid Theme will likely need to provide at least:

- neutral primitives;
- accent primitives;
- semantic surface mappings;
- semantic text mappings;
- semantic border mappings;
- primary action background/foreground/states;
- focus treatment;
- typography family values.

A future validator may check whether a Theme supplies required roles and whether relevant foreground/background combinations meet defined contrast requirements. This is a hypothesis, not an implemented capability.

## What remains intentionally open

We are **not** deciding yet:

- Clara's own permanent brand primary;
- exact color values;
- a complete spacing scale beyond the three values Slice 01 demonstrates (`space.2/4/8` — see decision above);
- a radius scale beyond the single migration value (`radius.md` — see decision above);
- complete type scale;
- a second visual expression of the *same* theme identity in both color schemes (ADR-004 decided that color scheme belongs to Theme expression, so this would currently mean authoring two themes — see that ADR's trade-offs);
- all status colors;
- motion system;
- elevation system;
- breakpoints;
- token enforcement (`strictTokens`/`strictPropertyValues` — see ADR-003);
- whether Style Dictionary is necessary;
- a public theme configuration API;
- automated accessibility validation.

Those decisions should emerge from product/system needs or experiments.

## First implementation target

Use this model to support only the initial Explorer entry surface:

```text
Heading
Supporting text
Intent input / textarea
Primary action Button
Suggestion chip
Responsive layout
```

If that surface can be built without brand values leaking into component contracts, the token model has passed its first architectural test.

## Evaluation questions

When the first surface exists, inspect:

1. Can its primary color family change without editing component recipes?
2. Does changing the Theme preserve readable foreground/background relationships?
3. Are components consuming semantic roles rather than arbitrary primitives?
4. Did we create tokens that are unused or impossible to justify from the slice?
5. Are semantic names understandable without seeing their resolved values?
6. Can Clara expose the relationship `semantic role → primitive → resolved value` to both Docs and agents?

## Next step

Translate this conceptual model into the smallest Panda configuration/preset needed to build Slice 01, then inspect Panda's generated spec artifacts as a possible machine-readable input for Clara Knowledge.
