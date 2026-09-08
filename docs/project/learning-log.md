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

7. **The native-prop-forwarding question is now recurring evidence, not a one-off.** `button.json` flagged `style`/`aria-label`/`aria-labelledby` as an unresolved escape hatch. `input.json` hit the identical question a second time, plus a new instance of the same pattern (`type="text"` was originally a default, not a lock — a consumer could override it via forwarding, same as Button's `type="button"`). Two independent components producing the same open question is more meaningful than either alone. *(The `type` instance was subsequently closed — see the 2026-09-08 correction entry below. `style`/`aria-*` remain open on both components.)*

8. **`color.focus.ring` reuse is the first confirmed cross-component token.** Unlike the other findings above, this is a case where Button's specific content — not just its field shape — genuinely transferred. Verified via keyboard-driven computed-style checks in both themes.

### Current interpretation

Two Knowledge records now show a consistent pattern: field *shapes* like `props`, `accessibility`, `semanticTokens`, `knownLimitations`, `unresolved`, and per-field status/provenance generalize reasonably well across two structurally different components. Content and, in Input's case, some field *shapes themselves* (`valueOwnership`, `compositionDependencies`) do not generalize from Button alone — they had to be discovered by building a second, different kind of component. This supports the project's working interpretation (an executable contract and a Knowledge contract are distinct surfaces that can drift) and extends it: a Knowledge record's *shape* can also drift from a prior component's shape, for reasons as legitimate as content drift.

### Next falsification step

Two components is enough to show some fields generalize and some don't, but not enough to formalize a schema — `variants`/`sizes` remain untested for a real multi-value case, and `compositionDependencies`/`valueOwnership` are single-record hypotheses. A third component that either (a) has genuine variants/sizes, or (b) is a compound/multi-part component (exercising `relatedComponents`/`compositionRules`, still empty in both records so far), would be the next meaningful stress test.

## 2026-09-08 — Two focused corrections: executable `type` narrowing, and Knowledge provenance (status vs. origin)

### Context

A human-review pass on `input.json` against the executable API found two issues before merging PR #6: (1) `InputProps` forwarded `type` unrestricted, so `<Input type="email" />` compiled — contradicting the approved native-`<input type="text">` decision and leaving it undocumented-only rather than enforced; (2) some Knowledge claims used `status: "decision"` for facts that are not Clara decisions at all (e.g. "placeholder is not an accessible name" — a web-platform/accessibility-semantics fact Clara did not choose).

### What changed

- `InputProps` is now `Omit<ComponentPropsWithoutRef<"input">, "type">`. Verified as a compile error (`@ts-expect-error` on `<Input type="email" />`) and confirmed the rendered element's `type` attribute is still `"text"` at runtime. This narrows exactly one field, for a different reason than Button's `children` narrowing (Button's guaranteed an accessible-name source; Input's makes an already-approved primitive decision executable) — not a repository-wide native-prop policy.
- `input.json` and `docs/knowledge/README.md` gained an experimental `origin` field on select claims (`"clara"` implied by absence, or `"web-platform"` stated explicitly), applied only where a claim's status could otherwise be misread as Clara authorship of a platform fact.
- The "placeholder is not an accessible name" claim went from asserted (`status: "decision"`, no test behind it) to actually verified: a new Playwright check confirms the input's computed accessible name matches the paired `<label>` text and does not match the placeholder text, via `getByRole("textbox", { name })`. Status changed to `observed`, origin `web-platform`.
- `button.json`'s "accessible name equals visible text by default" claim had the identical problem (status `decision` for a platform accessible-name-computation rule). Corrected in place: status → `implemented` (children is required in code; no dedicated accessible-name check was run for Button the way one now has for Input), `origin: "web-platform"` added, with a note pointing to this finding. Button's record was not otherwise re-audited claim-by-claim — that's recorded as a new `unresolved` item rather than assumed clean.

### Observed learning

**`status` and `origin` are separable knowledge dimensions.** `status` answers how established a claim is; it does not answer where the claim's truth comes from. Two records now show the same conflation independently (Input's placeholder claim, Button's accessible-name claim) — a claim inherited unchanged from a prior record's shape doesn't get re-examined for this unless something forces the comparison, which is itself worth noting: Knowledge drift can survive a first review and only surface on a second, differently-shaped component.

This is not being treated as a finalized Knowledge architecture. `origin` was applied narrowly (only where ambiguity was actually found, not blanket across every claim), uses only two values (`clara` / `web-platform`), and several open questions were recorded rather than resolved: whether narrow application is the right call, whether two origin values are enough once a third kind of source appears (an external library, a published guideline distinct from raw platform behavior), and whether `status`+`origin` together are sufficient or still incomplete. See `input.json`'s `unresolved` and `docs/knowledge/README.md`.

### Next falsification step (updated)

Unchanged from above — a third, structurally different component remains the next meaningful stress test. This correction adds one more question for that component to test: does it need a third `origin` value, or do `clara`/`web-platform` continue to cover what's needed?

## 2026-09-08 — First Clara Explorer entry surface (product surface, not a checkpoint)

### Context

`app/src/App.tsx` stopped being a sequence of per-component checkpoints and became the actual first product surface named in `docs/slices/01-intent-first-discovery.md`: the Explorer entry page (Clara identity, heading question, supporting copy, intent Input + submit Button, four intent suggestions), composed with a Google-style centered layout borrowed for its spatial logic only, not its branding. This is the first time Clara's foundations, theme mechanism, and the two existing components (`Button`, `Input`) were composed together into one real screen rather than exercised in isolation.

### What was reused without change

Existing `Button` and `Input` components, all four text styles (`heading`/`body`/`label`/`supporting`), the `action.primary`/`onPrimary`/`primaryHover`/`primaryPressed`, `surface.default`, `border.default`, and `focus.ring` semantic tokens, the `space.2`/`4`/`8` scale, `radii.md`, and the `explorer`/`alternate` Panda theme mechanism from ADR-002 — no component source changed. `data-panda-theme="explorer"` is applied directly as the surface's shipped visual identity (not a dev toggle), since `explorer` is an already-approved theme name that happens to match this product.

### New primitives added, and why

- `colors.neutral.100` and semantic `color.surface.subtle` (Core level, both themes identical) — added for the suggestion controls' hover background, using the same justification already established for Button's hover/pressed tokens: a real, mouse-clickable element needs pointer feedback beyond the resting state. `surface.subtle` was already named conceptually in `docs/foundations/token-model.md`'s Level 2 vocabulary but left unimplemented until now.

### What was deliberately NOT created

- **No Chip/Suggestion component.** Suggestions are plain native `<button>` elements styled locally in `App.tsx`, not a Clara Button variant. `button.json`'s `unresolved` already flagged "whether suggestion chips are a Button variant, a separate component, or unrelated" — this pass answers only that they are not a Button variant; it does not resolve the rest, because one usage site (four buttons, one page) is not evidence of a reusable contract. Extracting a component now would be inventing reuse that hasn't been demonstrated.
- **No Container/Stack/Card primitive.** Layout composition uses Panda's `css()` utility directly at the page level, per the building-clara skill's implementation rules. Nothing in this one page repeats a layout shape often enough yet to justify a named layout primitive.
- **No new spacing or radius values.** The existing `space.2/4/8` and `radii.md` were sufficient for the whole surface.

### Gaps this real layout exposed

1. **No `sizes`/max-width primitive.** The entry surface needs a bounded, readable content width (a "search-box" width), and Clara has no token for it — ADR-003 explicitly removed Panda's default preset's `sizes` category and Clara has not declared its own. `App.tsx` uses a raw `maxWidth: "36rem"` value, which Panda passes through unresolved (consistent with the raw-value behavior ADR-003 already documented), not a Clara-owned decision. This is a candidate for a future `sizes` primitive category once more than one surface demonstrates the same need.
2. **No breakpoint tokens.** ADR-003 already flagged this as a known near-term gap. This surface did not need to close it: the whole layout (heading/copy centering, the input+button row, the suggestion row) uses plain flexbox (`flexWrap: "wrap"`, `flex: "1"` on Input, `justifyContent: "center"`) rather than breakpoint-conditioned styles, and reflows correctly at a 360px viewport with no horizontal overflow (verified, see Verification). Whether fluid/intrinsic layout continues to be sufficient once a surface needs different structure (not just reflow) at different widths — not just decoration — remains open.
3. **No `color.text.*` roles.** Already a known Input limitation; this pass surfaces it again one level up, at the page: the "Clara" identity mark, the heading, and the supporting copy all render in the same inherited default text color, differentiated only by the existing text styles' size/weight. There is currently no token-driven way to visually mute the supporting copy or the identity mark relative to the heading.
4. **Input has no ref-forwarding.** Considered giving the suggestion click handler a "populate and focus the input" behavior; dropped because `Input` (`app/src/components/Input.tsx`) does not forward a ref, and adding one would be a component API change outside this task's scope. Suggestions therefore only populate the field's value, not focus.

### Suggestion interaction decided

Clicking a suggestion sets the intent Input's value to that suggestion's text; it does not submit the form. This keeps the suggestion control single-purpose (populate) and reuses the existing native-form submit path (Submit button or Enter) for the actual submission, rather than giving suggestions a second, independent way to trigger submission.

### Verification performed

`npm run build` and `npm run lint` (`app/`) both pass. Runtime verification via Playwright against the built preview server:

- Both themes resolve correctly on the shipped surface: `explorer` renders `rgb(245, 166, 35)` and `alternate` renders `rgb(91, 91, 214)` on the Submit button with no code change, only the theme attribute.
- Keyboard Tab order: Input → Submit button → suggestion buttons, in DOM/visual order.
- Focus-visible ring verified via keyboard Tab (not `.focus()`) on a suggestion button — `solid 2px rgb(245, 166, 35)`, confirming `color.focus.ring` now generalizes to a third, non-Clara-component element.
- Clicking a suggestion populates the Input; submitting via the Button and via Enter inside the form both produced the expected "Submitted: …" text.
- 360×740 viewport: suggestions wrap to multiple rows, the input+button row stacks, no horizontal overflow (`scrollWidth <= clientWidth`), same content hierarchy preserved as desktop.

Not verified: screen-reader/assistive-technology behavior (same caveat already recorded in `button.json`/`input.json`); no automated accessibility or contrast audit was run.

### Visual evidence

Captured from the built preview (the same Playwright pass used for the verification above), before merge, as inspectable record of this milestone — see `docs/evidence/explorer-entry-surface/`:

- [`desktop-explorer-theme.png`](../evidence/explorer-entry-surface/desktop-explorer-theme.png) — 1280×800, `explorer` theme.
- [`mobile-explorer-theme.png`](../evidence/explorer-entry-surface/mobile-explorer-theme.png) — 360×740, `explorer` theme.
- [`desktop-alternate-theme.png`](../evidence/explorer-entry-surface/desktop-alternate-theme.png) — 1280×800, `alternate` theme, as evidence that the same composition resolves through a second Clara Theme with no component or layout change.

These screenshots demonstrate composition/rendering only. They are not accessibility evidence, not responsive-system validation, and not visual-quality benchmark results — see the verification caveats above for what was and was not independently checked.

### Next falsification step

The next component or surface that needs a bounded width, a breakpoint-dependent structural change (not just reflow), or a muted/secondary text color is the next real test of gaps 1–3 above — they should stay unresolved until then rather than being speculatively designed now.
