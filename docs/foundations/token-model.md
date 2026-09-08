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

```text
space.0
space.1
space.2
space.3
space.4
space.6
space.8
space.12
...
```

Exact values are not approved yet.

### Radius

```text
radius.none
radius.sm
radius.md
radius.lg
radius.full
```

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

### Focus

```text
color.focus.ring
```

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
- exact spacing values;
- complete type scale;
- dark mode;
- all status colors;
- motion system;
- elevation system;
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
