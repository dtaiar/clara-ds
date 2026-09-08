# ADR-003 — Clara owns the design-token vocabulary; Panda supplies styling infrastructure only

**Status:** Accepted
**Date:** 2026-09-08
**Decision owner:** Daniel

## Context

ADR-001 already stated the intended boundary: *"Panda provides infrastructure for defining tokens, semantic tokens, patterns, and recipes without requiring Clara to inherit an existing visual vocabulary."*

`app/panda.config.ts` did not implement that sentence. It declared no `presets` key, and Panda's config resolver (`@pandacss/config`) auto-adds `@pandacss/preset-panda` whenever `presets` is left undefined. That preset ships its own complete, opinionated theme — a 26-family color palette, a 0–96 spacing scale (plus negatives), a 9-step radii scale, a 14-step font-size scale, breakpoints, `textStyles`, `keyframes` — merged in underneath whatever Clara declared under `theme.extend`.

This was investigated directly (local package inspection plus an isolated experiment, not documentation alone) before this decision, with concrete findings:

- **Silent collisions on shared key names.** Clara's `colors.neutral` declares only `{0, 900}`; Panda's preset already ships a full `neutral` ramp (`50…950`). Clara's `900` (`#111111`) overrides Panda's `900` (`#171717`); the other nine keys remained live, unedited, under the same family name. The same pattern held for `fonts.sans` (overridden; `serif`/`mono` left untouched), `fontSizes` (Clara's `sm`/`md`/`xl` overrode 3 of Panda's 14 keys; the other 11 remained), `fontWeights` (`regular`, new, sat next to Panda's pre-existing `normal` — both `400`), and `lineHeights` (`tight`/`normal` overridden; `none`/`snug`/`relaxed`/`loose` remained).
- **A live proof that unresolved values pass through silently.** `App.tsx` already used a raw, non-token value (`outlineOffset: "2px"`) with no warning — evidence that Panda does not validate token references by default.
- **A concrete regression risk.** In an isolated experiment (outside the repository), dropping `preset-panda` while the checkpoint still referenced `borderRadius: "md"` with no `radii` category defined at all produced `border-radius: md` in the generated CSS — invalid CSS, silently ignored by the browser, with `panda codegen`/`cssgen` reporting no error.
- **A verified, supported mechanism to fix this.** `@pandacss/config`'s `resolve-config.ts` adds `@pandacss/preset-base` unconditionally (unless `eject: true`) and adds `@pandacss/preset-panda` only when `presets` is left undefined. Setting `presets: ["@pandacss/preset-base"]` is a documented, first-class config field — not `eject`, not a hack.

Full findings are recorded in this session's conversation; this ADR states the decision and the evidence that supports it, not the full investigation transcript.

## Decision

`app/panda.config.ts` sets:

```ts
presets: ["@pandacss/preset-base"],
```

Panda now supplies styling infrastructure only — utilities, conditions, layout patterns. Clara supplies every design-token value in use, entirely through the `theme.extend` pattern already established for colors and typography in ADR-002's implementation.

This change adds two primitive categories that did not previously exist as Clara-owned tokens:

- **Spacing** — `space.2` (`0.5rem`), `space.4` (`1rem`), `space.8` (`2rem`). These are the only three values the Slice 01 checkpoint demonstrates (container gap/padding, button `paddingX`/`paddingY` in `App.tsx`). Values are unchanged from what Panda's default preset previously resolved for these same keys — this is a vocabulary-ownership change, not a visual one.
- **Radius** — `radii.md` (`0.375rem`) only. This exists solely to prevent the checkpoint's button (`borderRadius: "md"`) from regressing once `preset-panda` is dropped. **It is a migration requirement, not a Clara radius model.** A real radius scale (`none`/`sm`/`lg`/`full`, semantic roles, etc.) remains undecided and out of scope for this ADR.

Everything else — semantic color roles (`action.primary`, `action.onPrimary`, `focus.ring`), the `explorer`/`alternate` theme mechanism, and the four typography text styles (`heading`/`body`/`label`/`supporting`) — is unchanged in value and mechanism. Those were already Clara-owned under `theme.extend`; this decision does not touch them beyond removing the unrelated Panda defaults that previously sat alongside them under the same category names.

## What Panda's base preset still provides (infrastructure, not vocabulary)

- 357 utility property definitions (the CSS-property-to-token-category mappings: `padding` → look up `spacing`, `borderRadius` → look up `radii`, etc.)
- 107 conditions (state/pseudo-class selectors: `_hover`, `_focus`, `_disabled`, etc.)
- 19 layout patterns (`stack`, `hstack`, `vstack`, `grid`, `center`, etc.), which work independently of any declared token theme

## Explicitly out of scope for this decision

- **Breakpoints.** Panda's default preset supplied `sm`/`md`/`lg`/`xl`/`2xl`; dropping it removes them with nothing to replace them yet. Slice 01's entry surface calls for "responsive behavior," so this is a near-term gap, not a resolved one — Clara has not yet declared its own breakpoints.
- **`strictTokens` / `strictPropertyValues`.** These are the actual compile-time enforcement levers (documented in `@pandacss/types`) that would make an unresolved or arbitrary value a build failure. They are not enabled. See "What this decision does not claim" below.
- **Semantic spacing roles.** Only primitives are declared. No `spacing.stack.*` / `spacing.inset.*` style roles.
- **Any scale expansion beyond demonstrated need.** No additional spacing values, no radius scale beyond the one migration value, no new components or Explorer UI.

## What this decision does not claim

Narrowing the token vocabulary is not the same as enforcing it. Verified directly: before this change, an unresolved utility value (`borderRadius: "md"` with no matching token) built and shipped as invalid CSS with no error at any stage. Removing `preset-panda` shrinks what's *offered* — it does not add validation. A future value like `padding: "17px"` would still build silently today; catching that requires `strictTokens`, which this decision deliberately leaves undecided. Enforcement remains an open question, not a resolved one.

## Observed evidence

Recorded from this implementation pass, per the evidence model in `docs/project/foundation.md`.

**Generated token vocabulary** (`app/styled-system/tokens/index.mjs`, after `panda codegen`), queried directly:

- `spacing`: only `2` (`0.5rem`), `4` (`1rem`), `8` (`2rem`) resolve. `0`, `1`, `3`, `5`, `6`, `7`, `12`, `96`, and the rest of Panda's former 0–96 scale all resolve to `undefined`.
- `colors`: `blue.500`, `red.500`, `rose.500`, `gray.500` (Panda's other 25 default families) all resolve to `undefined`. `neutral.0`/`neutral.900` still resolve to Clara's values; `neutral.50`/`neutral.950` (Panda's ramp) now resolve to `undefined`.
- `fonts`: `serif`/`mono` (Panda defaults) resolve to `undefined`; `sans` still resolves to Clara's stack.
- `fontSizes`/`fontWeights`/`lineHeights`: only Clara's declared keys resolve (`sm`/`md`/`xl`; `regular`/`medium`/`bold`; `tight`/`normal`); every other previously-inherited key (`2xs`, `lg`, `2xl`…`9xl`, `thin`, `normal` (weight), `none`, `snug`, `relaxed`, `loose`) resolves to `undefined`.
- `radii`: only `md` (`0.375rem`) resolves; `none`, `sm`, `lg`, `xl`, `full`, etc. all resolve to `undefined`.
- No `breakpoints` export exists in the generated tokens module.

**Generated TypeScript vocabulary** (`app/styled-system/tokens/tokens.d.ts`) — this is what a consumer (human or agent) actually sees when discovering available tokens:

```ts
export type SpacingToken = "2" | "4" | "8" | "-2" | "-4" | "-8"
export type RadiusToken = "md"
export type FontSizeToken = "sm" | "md" | "xl"
export type FontWeightToken = "regular" | "medium" | "bold"
export type LineHeightToken = "tight" | "normal"
export type ColorPalette = "neutral" | "action" | "focus"
```

The `Token` union no longer lists categories that were never populated by Clara (`aspectRatios`, `borders`, `easings`, `durations`, `letterSpacings`, `shadows`, `blurs`, `sizes`, `animations`, `breakpoints`) — they are absent, not merely empty. (The `-2`/`-4`/`-8` entries are Panda's own negative-margin variants, automatically derived from the same `spacing` values for margin-family utilities — not separately declared.)

**Build:** `npm run build` (`tsc -b && vite build`) succeeds with no errors or warnings.

**Runtime** (Playwright against the built `vite preview` output, Chromium), computed styles:

- Button (`explorer` theme, before toggle): `border-radius: 6px` (`= 0.375rem`, matches the pre-existing value — no visual regression on the exact risk the pre-implementation experiment identified), `padding-left: 16px` (`space.4`), `padding-top: 8px` (`space.2`), `background: rgb(245, 166, 35)` (`explorer` accent).
- Button (`alternate` theme, after toggle): `border-radius: 6px` (unchanged, correctly theme-independent), `background: rgb(91, 91, 214)` (`alternate` accent) — theme switching still resolves correctly.
- Container: `gap: 16px` (`space.4`), `padding: 32px` (`space.8`).
- Heading (`textStyle: "heading"`): `font-size: 24px`, `font-weight: 700`, `line-height: 28.8px` — unchanged from before this decision, confirming typography stayed untouched.

## Evidence that would prompt reconsideration

- If Slice 01's Explorer surface needs responsive layout before Clara has defined its own breakpoints, that is expected — not evidence against this decision, just the next gap to close.
- If repeated silent unresolved-value failures (like the `border-radius: md` case this decision fixed) recur elsewhere, that is evidence `strictTokens`/`strictPropertyValues` should be evaluated soon, not evidence this decision was wrong.
- If Clara's own radius model, once designed, turns out to conflict with the single `md` migration value kept here, that value should be revisited as part of that design work, not preserved for its own sake.

## References

- ADR-001 — Panda/Clara responsibility boundary this decision enforces
- ADR-002 — `theme.extend` ownership pattern this decision extends to spacing and radius
- `docs/foundations/token-model.md` — primitive scale this decision implements
- Panda CSS — Presets: https://panda-css.com/docs/customization/presets
- Panda CSS — Writing a plugin / config resolution behavior confirmed via local inspection of `@pandacss/config`, `@pandacss/preset-base`, and `@pandacss/preset-panda` source (installed versions, `app/node_modules/@pandacss/*`)
