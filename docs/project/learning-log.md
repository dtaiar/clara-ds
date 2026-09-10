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

## 2026-09-08 — First Pattern Knowledge record and Clara's first intent-to-pattern result

### Context

Vertical Slice 01 named an example intent that the Explorer should resolve without the consumer already knowing Clara's vocabulary: "I need users to confirm before deleting something." Before building anything, a product-design and Knowledge-model analysis was done and reviewed with the human owner (see PR description for the full write-up: product-problem decomposition, whether Pattern or a Dialog component is the right abstraction, a proposed minimum Pattern contract, composition, and an explicit ADR-threshold check). The reviewed conclusion: Pattern, not a Dialog component, should be the result Clara returns for this intent — resolving straight to "Dialog" would require the consumer to already know Clara's inventory, which is the exact discoverability failure this slice tests.

Approved and built: `docs/knowledge/destructive-confirmation.json` (Clara's first Pattern Knowledge record) and a deterministic intent → Pattern result in the Explorer (`app/src/App.tsx`). Deliberately not built: a Dialog/overlay component, a destructive/danger semantic token or Button variant, and any real search/ranking/matching — the Explorer resolves exactly one intent string via exact (normalized) match, and says so in the UI.

### Observed learnings

1. **A Pattern record is not a smaller version of a component record — it documents judgment with no executable artifact behind it.** `button.json`/`input.json` document code that exists (`app/src/components/*.tsx`). `destructive-confirmation.json` documents product/UX reasoning with nothing built yet. `props`, `variants`, `sizes`, `semanticTokens`, and a single-file `sourceOfTruth.implementation` all assume an inspectable artifact and don't apply — they were dropped, not left empty.

2. **Composition is a first-class, structurally different kind of field.** Both prior records carried an empty `relatedComponents` field. This is the first record to actually populate a relationship field, and a flat name list wasn't enough — `composition` needed `role` + `component` + its own `status` per row, because the pattern's real content is the relationship between a confirmation surface, its copy, and two required actions, not a property of one thing in isolation.

3. **The epistemic ceiling is lower for a Pattern record than for a component record.** `button.json`/`input.json` earned `"observed"` through Playwright checks against a real build. Nothing in `destructive-confirmation.json` can reach `"observed"` — there is no confirmation surface to check anything against. Every claim tops out at `"hypothesis"`, except the one line quoted verbatim from the slice doc and the scoping choices made in this pass, both `"decision"`.

4. **`origin` (clara / web-platform) doesn't fit this record at all.** Input's and Button's `origin`-tagged claims traced to web-platform accessible-name-computation facts. Nothing in the Pattern record traces to a web-platform fact — its claims trace to product/UX reasoning instead. `origin` is not applied anywhere in `destructive-confirmation.json`, and whether Pattern records need a third `origin` value (or don't need `origin` at all) is left unresolved rather than guessed at.

5. **The Explorer result duplicates Knowledge content rather than importing it, and that's a recorded limitation, not a silent shortcut.** `app/src/App.tsx`'s TypeScript project (`tsconfig.app.json`) scopes `include` to `src`, so importing `docs/knowledge/destructive-confirmation.json` directly from `App.tsx` would sit outside the TS project's file list. Rather than restructure the TS project boundary for this one experiment, the Explorer keeps a local constant that mirrors the JSON record's rendered fields, with a comment pointing back at the JSON as the source of truth. This is the same manual-sync relationship Button.tsx/Input.tsx already have with their own Knowledge records, applied in the opposite direction (there, code is the source and JSON documents it; here, JSON is the source and the Explorer's rendering constant documents it). A future machine interface reading the JSON directly, instead of a UI-side duplicate, remains open — see the JSON record's own `unresolved`.

6. **Deliberately not built, and why that held up under implementation, not just in the write-up.** A destructive Button variant was not created: the composition guidance names the gap explicitly in the rendered result ("Clara does not yet have a dedicated 'danger' treatment") instead of inventing one to make the mockup look finished. No Dialog component was built: the result's "Confirmation surface" composition row says `not built` and names the real alternatives (modal, inline replacement, undo-after) instead of picking one. Both held through actual implementation, not only through the pre-implementation analysis.

### Verification performed

`npm run build` and `npm run lint` (`app/`) both pass. Runtime verification via Playwright against the built preview server:

- Submitting the exact demonstrated intent renders the matched Pattern card: heading "Destructive Confirmation," the "fixed demonstration — not search" disclosure line, guidance bullets, the composition list (including the explicit "not built" / "no destructive variant" lines), the unresolved list, and the JSON source path.
- The match is normalized (trim, case-insensitive, tolerant of a missing/extra trailing period) — submitting `"  i need users to confirm before deleting something  "` (no final period, extra whitespace, lowercase) still matches.
- Submitting an unrelated intent ("Help me design a pricing table") renders the "no confident match" fallback state instead, and no stale matched-pattern heading remains from a prior submission.
- Clicking the existing "Confirm a risky action" suggestion chip and submitting does **not** trigger the pattern match — confirmed deliberately narrow, since that chip is a different, more generic demonstrated intent from `docs/slices/01-intent-first-discovery.md`'s "Suggestion model" list, not the same string as this pattern's demonstrated intent.
- Keyboard tab order is unchanged: Input → Submit button → suggestion buttons, same as the existing Explorer surface.

Not verified: screen-reader/assistive-technology behavior on the new result region (`role="status" aria-live="polite"` was added on the same reasoning as the rest of the Explorer's accessibility choices, but not independently tested with a screen reader) — same caveat already recorded for the rest of the Explorer surface.

### Visual evidence

Captured from the built preview (same Playwright pass used for verification above) — see `docs/evidence/destructive-confirmation-result/`:

- [`matched-pattern-result.png`](../evidence/destructive-confirmation-result/matched-pattern-result.png) — the demonstrated intent submitted, rendering the matched Pattern result.
- [`no-match-fallback.png`](../evidence/destructive-confirmation-result/no-match-fallback.png) — an unrelated intent submitted, rendering the "no confident match" fallback state.

### Current interpretation

Two Knowledge records were enough to show that some component-record fields generalize and some don't. A third record of a genuinely different *kind* — Pattern instead of Component — shows something stronger: the record shape itself needs to change, not just its content, once the thing being documented has no executable artifact and its real content is a relationship between parts rather than a property of one part. This is consistent with the project's working interpretation that an executable contract and a Knowledge contract are distinct surfaces that can drift, and extends it: Pattern Knowledge appears to be documenting a third surface — product/UX judgment — that doesn't reduce to either of the other two.

### Explicitly not decided by this pass

Per the pre-implementation ADR-threshold review: this pass does not establish Pattern as a formal Clara system entity, does not define a repository-wide Pattern schema, does not establish destructive/danger semantics for Clara, does not establish a Dialog component contract, and does not change source-of-truth or governance boundaries. One experimental Pattern record and one deterministic Explorer result exist; none of the above were decided to build it.

### Next falsification step

A second Pattern record — ideally one that is NOT destructive/irreversible-action-shaped (e.g. an empty-state or error-recovery pattern already present as Explorer suggestions) — would be the next real test of whether `composition`, `requiredActions`, `actionHierarchy`, and the rest of this record's new field shapes generalize across Patterns the way `accessibility`/`knownLimitations`/`unresolved` generalized across Button and Input, or whether they were specific to a two-action, cancel/confirm shape.

## 2026-09-08 — Explorer reads Clara Knowledge directly: observed evidence for H1 ("one source, multiple consumers")

### Context

The previous entry's Explorer result rendered from `DESTRUCTIVE_CONFIRMATION_RESULT`, a hand-authored TypeScript constant in `app/src/App.tsx` that paraphrased `docs/knowledge/destructive-confirmation.json` and had to be kept in sync manually. That was a recorded limitation, not an accepted end state — it meant the human-facing surface and the "source of truth" Knowledge record were, in practice, two documents.

Before changing anything, this was investigated rather than assumed. The original decision to duplicate rather than import had rested on an assumption that `tsconfig.app.json`'s `"include": ["src"]` would block `tsc -b` from resolving a JSON import that lives outside `src` (`docs/knowledge/`). That assumption was tested directly — a throwaway import was added, built, and reverted before any real change was made — and it was wrong:

- `tsc -b --force` succeeded with the cross-boundary import, and gave real structural type-checking (confirmed by intentionally accessing a nonexistent field and getting a precise `TS2339` naming the record's actual 15+ fields) — `include` bounds a project's root file set, not files reached transitively through an import.
- `vite build` bundled the JSON's actual content into `dist/assets/*.js` — confirmed by grepping the built output for literal strings from the JSON.
- `vite dev` served the file too, at `/@fs/home/user/clara-ds/docs/knowledge/destructive-confirmation.json?import`, returning `200`. Vite's default `server.fs.allow` walks up looking for a workspace root (it stops at the nearest `.git`, which is `/home/user/clara-ds`), so anything under the repo — `docs/` included — was already inside the allowed serving boundary. No config change was needed anywhere.

### What changed

`app/src/App.tsx` now imports `docs/knowledge/destructive-confirmation.json` directly (`import patternKnowledge from "../../docs/knowledge/destructive-confirmation.json"`) and renders its real fields — `pattern`, `purpose.value`, `whenToUse.value`, `requiredContent.value`, `actionHierarchy.value`, `cancellationBehavior.value`, `composition` (role/component pairs), `unresolved`, and `demonstratedIntent.value` (now also the single source for the deterministic match string, replacing a second local constant that duplicated it). `DESTRUCTIVE_CONFIRMATION_RESULT` was deleted entirely. No config changes, no generated-artifact/codegen step, no schema, no CLI, no API, no runtime fetch — this is a build-time ES module import, the same mechanism already used for every other import in the file.

`patternKnowledge.sourceOfTruth.explorerResult` in the JSON record itself was updated to describe this relationship instead of the retired constant.

### The boundary this draws

The Knowledge record (`docs/knowledge/destructive-confirmation.json`) is the only source of the result's *content* — every sentence and list item rendered comes from a field that already existed in that file for its own sake (Knowledge authoring), not one written to read well in a UI. `app/src/App.tsx` owns only *presentation*: which fields to show, in what order, under what heading, and how to loop over arrays. No new sentence was authored in App.tsx to summarize or introduce a section — section headings name the JSON field being shown ("Purpose", "When to use", "Required content", "Action hierarchy", "Cancellation", "Recommended composition", "Explicitly unresolved") rather than paraphrasing its content.

One consequence of holding that boundary strictly: the earlier hand-authored version had a shorter, curated "Key guidance" list (4 sentences, paraphrased from several fields) and a synthesized "why Clara recommends this" sentence that did not exist verbatim anywhere in the JSON. Neither survived — a paraphrase or a synthesized sentence would itself be new content authored in App.tsx, which is exactly the duplication this change was meant to remove. The rendered card is now longer (it shows the record's full `unresolved` list verbatim, six items, rather than three curated ones) and reads more like a rendered document than a designed summary. That is a real, observed tradeoff of sourcing directly rather than curating — not a bug — and is worth returning to once more than one Pattern record exists and it's clearer which fields are meant for a human reader versus which are internal Knowledge-authoring bookkeeping.

Per-field `status`/`note` metadata (e.g. that `purpose` is `"hypothesis"`, not `"decision"`) is present in the imported JSON but is not yet rendered anywhere in the UI — the Explorer shows only `.value`/`.component` content. Whether a human-facing surface should ever surface epistemic status inline (vs. status staying a Knowledge-authoring/agent-facing concern) is left open, not decided here.

### Verification performed

`npm run build` and `npm run lint` (`app/`) both pass. Runtime verification via Playwright against the built preview server, repeating and extending the prior pass's checks:

- The matched-pattern card now shows content pulled live from the JSON: purpose text, both `whenToUse` items, both `requiredContent` items, the `actionHierarchy` paragraph, both `cancellationBehavior` items, all four `composition` role/component pairs, all six `unresolved` items, and the literal source path.
- Normalized matching (trim/case/trailing-period tolerance) still works, now comparing against `patternKnowledge.demonstratedIntent.value` instead of a separate local constant.
- The "no confident match" fallback still renders for an unrelated intent, and now quotes the demonstrated intent pulled from the same imported JSON rather than a duplicated string; no stale matched-pattern content remains from a prior submission.
- The existing "Confirm a risky action" suggestion chip still does not trigger this match — unchanged behavior.
- Keyboard tab order (Input → Submit → suggestions) is unchanged.

Visual evidence updated: [`matched-pattern-result.png`](../evidence/destructive-confirmation-result/matched-pattern-result.png) was recaptured to reflect the fuller, directly-sourced result card. [`no-match-fallback.png`](../evidence/destructive-confirmation-result/no-match-fallback.png) is unchanged (its content didn't change).

### Observed evidence for H1 ("one source, multiple consumers")

This is the first concrete instance in Clara of a human-facing surface reading structured Knowledge directly rather than through a hand-maintained duplicate — a small, real test of H1 rather than an inference from architecture docs. It does not yet test the "multiple consumers" half of H1 (only one consumer, the Explorer, reads this file so far) — a second consumer (e.g. a future CLI or a second Pattern record's result) reading the same file without modification would be the next real test of that half. It also does not establish that JSON-in-`docs/` is Clara's permanent Knowledge storage/access mechanism — it demonstrates that the mechanism already available (a build-time ES module import, zero new infrastructure) is sufficient for this one experiment. Both are recorded as open, not concluded.

### Explicitly not decided by this pass

No configuration was changed (`tsconfig.app.json`, `vite.config.ts` were not touched — both already permitted this). No generated-artifact/codegen step, schema, CLI, API, or runtime-fetch mechanism was introduced. This is an implementation mechanism, not an architecture decision: it doesn't change Clara's public contract, a system boundary, governance, or source-of-truth ownership — `docs/knowledge/*.json` was already the established source-of-truth location; this change stops a UI-side duplicate of it from existing, it doesn't relocate or redefine it.

### Next falsification step

Unchanged from the prior entry (a second, non-destructive-shaped Pattern record is the next real stress test of the field shapes) — with one addition: that second record, if built, should also be read directly by whatever renders it, rather than reintroducing a duplicated rendering constant, to see whether this import approach continues to hold as a general pattern or was easy only because of this one record's shape.

## 2026-09-10 — Second Pattern: Empty State / First Use

### Task, scope and hypothesis

Daniel authorized continuing with a second, structurally different Pattern after reviewing the repository state at `a2183ef` (PR #8). This pass used Codex in ChatGPT Work to implement that experiment. The model version is not recorded. Inputs were the project foundation, principles, architecture, Slice 01, ADR-001/002/003, existing component and Pattern code/Knowledge, and the prior learning log.

The experiment challenges the first Pattern's shape (H3 composition knowledge, with a limited H1 direct-source check). It does not evaluate an agent as an independent consumer. Product guidance remains hypothetical pending review and use in a real flow.

### Product-design analysis and implemented scope

The existing suggestion “Show that there is no content yet” does not explain why content is absent. The record therefore explicitly assumes an accessible, successfully loaded, unfiltered collection with no items created yet. The Explorer displays that assumption before the guidance. It does not silently treat a load failure, filtered result, or access restriction as an empty collection.

Added `docs/knowledge/empty-state.json`, directly imported by `app/src/App.tsx`. The existing suggestion now gets its text from that record and resolves to its result on submission. Exact normalized matching is preserved; the fallback lists both supported phrases. No new token, component, dependency in the app, public schema, CLI, or discovery service was introduced. The current destructive-confirmation behavior remains unchanged.

### What the authoring/implementation exercise exposed

| Field or assumption | Finding in this second Pattern |
| --- | --- |
| Purpose, usage/exclusions, required content, composition, unresolved questions | Useful shapes in both authored records; not yet validated with an independent consumer. |
| Fixed cancel/confirm actions and cancellation/destructive behavior | Do not describe the selected empty-collection scenario; omitted rather than filled with unrelated content. |
| `actionAvailability` | A new experimental field: one creation action only when the product supports and authorizes it; no action is a valid outcome. |
| `scopedScenario` and `stateDistinctions` | New experimental fields expose missing context and nearby states. A generic phrase alone cannot select a product state reliably. |
| One generic renderer/schema | Not established. Each result selects its own fields; the JSX shares existing styles only. |
| Direct Knowledge import | Works for a second, different record in the production bundle, without a hand-maintained prose copy in the app. |

This is observed authoring and implementation evidence, not a finding that users understand the pattern or that agents compose better interfaces with it. None of the new pattern's product recommendations is marked `observed` merely because the Explorer renders its text.

### Verification and limitations

- `npm run build` and `npm run lint` passed in `app/`.
- Nine DOM smoke checks passed against the production bundle using temporary, pinned jsdom 26.1.0: initial state, existing suggestion population, scoped guidance and conditional action text, normalization, switching to the destructive result, unsupported input with both examples, deliberately unmatched generic risky action, whitespace reset, and captured runtime errors.
- Reproducible script and raw results: `docs/evidence/empty-state-result/verify-dom.cjs` and `dom-results.json`. The temporary harness dependency is not an app dependency.
- Vite preview runs at `127.0.0.1:4173`. The available cloud browser refused that URL with `net::ERR_BLOCKED_BY_CLIENT`. No visual, mobile layout, keyboard/Enter-to-submit, screen-reader, contrast, or assistive-technology validation was completed in this pass. The DOM harness is not a substitute for those checks. A draft PR remains the review boundary.

### Reviewable trade-offs and next evidence

The new result is still a lengthy rendered document. It labels the whole new record as experimental, but a complete per-claim status presentation remains undecided. Showing an explicitly scoped example is the smallest current demonstration; whether the generic intent should first ask a clarifying question needs a product decision informed by consumer testing.

The case now has a comparison between two different kinds of Pattern guidance. That is not a second consumer: H1's human/agent parity remains untested. The next useful experiment is a minimal machine consumer of the same records, with predefined checks for supported intents, missing context, unsupported requests, and preservation of hypothesis/decision status. Its interface contract still needs to be scoped before implementation.
