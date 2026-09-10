import { useState } from "react";
import type { FormEvent } from "react";
import { css } from "../styled-system/css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import patternKnowledge from "../../docs/knowledge/destructive-confirmation.json";

// Clara Explorer — first real product surface for Vertical Slice 01. See
// docs/slices/01-intent-first-discovery.md for the surface definition and
// docs/foundations/token-model.md for the token model this composes.
//
// `explorer` is applied directly as the shipped visual expression (not a
// dev toggle): it is one of the two theme names ADR-002 approved, and its
// name already matches this product surface. Theme mechanism ownership
// stays with Panda per ADR-002 — this file only sets the attribute.
const SUGGESTED_INTENTS = [
  "Confirm a risky action",
  "Help users recover from an error",
  "Collect payment information",
  "Show that there is no content yet",
];

// Deterministic intent → Pattern mapping for exactly one demonstrated intent
// (docs/slices/01-intent-first-discovery.md, "Example"). This is a fixed
// demonstration, not search, ranking, or AI matching — see
// docs/knowledge/destructive-confirmation.json's knownLimitations. Any other
// intent falls through to the "no confident match" state below.
//
// `patternKnowledge` (imported above) is read directly from that JSON file —
// it is the only source of the matched result's content. Nothing below
// duplicates or paraphrases its field values; the JSX only selects which
// fields to show, in what order, under what disclosure, and how to derive
// presentation labels (e.g. "Available"/"Missing") from structured field
// values. See docs/project/learning-log.md for why the result was
// restructured and for the one Knowledge limitation this pass found but did
// not solve (see the "Needs context" section below).
function normalizeIntent(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

// Presentation label for a structured `composition[].availability` value.
// This reads the field directly — it never inspects `component`'s free text
// to infer availability. See docs/knowledge/README.md, "composition[].availability".
function formatAvailability(availability: string): string {
  return availability === "available" ? "Available" : "Missing";
}

// Standard visually-hidden technique, not a Clara token or component — kept
// local to this one label because Input does not own label association
// (see docs/knowledge/input.json, "unresolved"). The raw CSS values below
// (0, -1px, 1px) are the well-known clip-technique constants, not resolved
// Clara primitives; Panda passes unresolved literal values through
// unchanged (see ADR-003's evidence on unresolved values).
const visuallyHiddenStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: "0",
});

// Suggestions represent product intent (docs/slices/01-intent-first-discovery.md,
// "Suggestion model"), not Clara's component inventory. They are plain
// native <button> elements styled here, not a Clara Button variant and not
// a new reusable component: this is the only place suggestion controls
// exist, so nothing yet demonstrates a shared contract worth extracting.
// See the PR description / learning log for the reasoning this leaves open.
const suggestionStyle = css({
  textStyle: "label",
  display: "inline-flex",
  alignItems: "center",
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  paddingX: "4",
  paddingY: "2",
  cursor: "pointer",
  _hover: {
    bg: "surface.subtle",
  },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

// Result surface styling — reuses the same surface/border/radius tokens as
// suggestionStyle above, not a new visual language.
const resultCardStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  width: "100%",
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  padding: "4",
  textAlign: "left",
});

// Reused for every section label inside the result card — defined once so
// the same visual weight (label / bold) reads consistently across
// Recommendation, Recommended composition, Consider instead and Needs
// context, instead of repeating the same css() call at each call site.
const sectionLabelStyle = css({ textStyle: "label", fontWeight: "bold" });

// A section that follows the first (Recommendation) gets a top rule using
// the existing border.default token — cheap visual separation between
// result sections with no new token or component.
const resultSectionStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  paddingTop: "2",
  borderTop: "1px solid",
  borderColor: "border.default",
});

// One row of the composition tree — role label on the left, structured
// availability on the right. `flexWrap: "nowrap"` plus `minWidth: 0` on the
// role text keeps the two columns on the same visual row at any width: the
// role text wraps internally if it must, but the availability word never
// detaches onto its own orphaned, left-aligned line the way it did under
// `flexWrap: "wrap"` at the 360px evidence viewport (see learning log).
// Availability is communicated by wording ("Available"/"Missing") and
// weight, never by color alone, per this Pattern's own accessibility
// guidance (destructive-confirmation.json, "The destructive signal must not
// rely on color alone").
const compositionRowStyle = css({
  display: "flex",
  flexWrap: "nowrap",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "2",
  width: "100%",
});

// Child rows (the parts composed inside the confirmation surface) are
// indented under the parent row. The "├─"/"└─" markers are plain text
// glyphs, not an icon system — a tree shape drawn the same way it would be
// in a text-based file listing, requiring no new Clara component.
const compositionChildRowStyle = css({
  display: "flex",
  flexWrap: "nowrap",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: "2",
  width: "100%",
  paddingLeft: "4",
});

const compositionRoleStyle = css({ flex: "1", minWidth: "0" });
const compositionAvailabilityStyle = css({ flexShrink: "0", whiteSpace: "nowrap" });

// Progressive disclosure for the long-form guidance uses native <details>,
// not a Clara Accordion/Disclosure component — the browser already provides
// the toggle behavior, keyboard support (Tab to focus, Enter/Space to
// toggle) and semantics for free.
const detailStyle = css({
  borderTop: "1px solid",
  borderColor: "border.default",
  paddingTop: "2",
});

const detailSummaryStyle = css({
  textStyle: "label",
  fontWeight: "bold",
  cursor: "pointer",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

const detailBodyStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  paddingTop: "2",
});

export function App() {
  const [intent, setIntent] = useState("");
  const [submittedIntent, setSubmittedIntent] = useState<string | null>(null);

  function handleIntentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedIntent(intent);
  }

  const trimmedSubmittedIntent = submittedIntent?.trim() ?? "";
  const hasSubmitted = trimmedSubmittedIntent.length > 0;
  const isKnownIntent =
    hasSubmitted &&
    normalizeIntent(trimmedSubmittedIntent) ===
      normalizeIntent(patternKnowledge.demonstratedIntent.value);

  // `composition[0]` (the confirmation surface) is treated as the
  // containing role and the remaining rows as the parts composed inside it
  // — a rendering/grouping decision based on the array's existing order,
  // not new content. See docs/knowledge/destructive-confirmation.json.
  const [surfaceRow, ...compositionParts] = patternKnowledge.composition;
  const unresolvedCount = patternKnowledge.unresolved.length;

  return (
    <main
      data-panda-theme="explorer"
      className={css({
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingX: "4",
        paddingY: "8",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: hasSubmitted ? "4" : "8",
          width: "100%",
          // Raw value, not a Clara token: no `sizes` primitive category
          // exists yet (ADR-003 — dropping Panda's default preset removed
          // it, and Clara has not declared its own). 36rem bounds the entry
          // surface to a readable, search-box-like width; 42rem once a
          // result exists gives the composition tree and detail disclosure
          // enough room. Both are the same documented gap, not two new
          // decisions — see docs/foundations/token-model.md.
          maxWidth: hasSubmitted ? "42rem" : "36rem",
        })}
      >
        <span className={css({ textStyle: "label", fontWeight: "bold" })}>
          Clara
        </span>

        {hasSubmitted ? (
          <p className={css({ textStyle: "supporting", textAlign: "center" })}>
            Showing results for &ldquo;{trimmedSubmittedIntent}&rdquo;
          </p>
        ) : (
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2",
              textAlign: "center",
            })}
          >
            <h1 className={css({ textStyle: "heading" })}>
              What are you trying to build?
            </h1>
            <p className={css({ textStyle: "supporting" })}>
              Describe what you need, and Clara will help you find the right
              components, patterns and guidance.
            </p>
          </div>
        )}

        <form
          onSubmit={handleIntentSubmit}
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4",
            width: "100%",
          })}
        >
          <label htmlFor="intent-input" className={visuallyHiddenStyle}>
            Describe what you need
          </label>
          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "2",
              width: "100%",
            })}
          >
            <Input
              id="intent-input"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="Describe what you need..."
              className={css({ flex: "1" })}
            />
            <Button type="submit">Submit intent</Button>
          </div>

          <div role="status" aria-live="polite" className={css({ width: "100%" })}>
            {isKnownIntent && (
              <div className={resultCardStyle}>
                <span className={css({ textStyle: "supporting" })}>
                  Matched Pattern (fixed demonstration — not search)
                </span>

                {/* 1. Recommendation */}
                <h2 className={css({ textStyle: "heading" })}>
                  {patternKnowledge.pattern}
                </h2>
                <p className={css({ textStyle: "body" })}>
                  {patternKnowledge.purpose.value}
                </p>

                {/* 2. Recommended composition — the visual center of the
                    result. Each role's availability is read directly from
                    composition[].availability; nothing here parses
                    `component`'s prose. */}
                <div className={resultSectionStyle}>
                  <span className={sectionLabelStyle}>
                    Recommended composition
                  </span>

                  <div className={compositionRowStyle}>
                    <span
                      className={`${compositionRoleStyle} ${css({ textStyle: "body", fontWeight: "bold" })}`}
                    >
                      {surfaceRow.role}
                    </span>
                    <span
                      className={`${compositionAvailabilityStyle} ${css({
                        textStyle: "body",
                        fontWeight:
                          surfaceRow.availability === "missing" ? "bold" : "normal",
                      })}`}
                    >
                      {formatAvailability(surfaceRow.availability)}
                    </span>
                  </div>

                  {compositionParts.map((part, index) => (
                    <div key={part.role} className={compositionChildRowStyle}>
                      <span
                        className={`${compositionRoleStyle} ${css({ textStyle: "body" })}`}
                      >
                        {index === compositionParts.length - 1 ? "└─ " : "├─ "}
                        {part.role}
                      </span>
                      <span
                        className={`${compositionAvailabilityStyle} ${css({
                          textStyle: "body",
                          fontWeight:
                            part.availability === "missing" ? "bold" : "normal",
                        })}`}
                      >
                        {formatAvailability(part.availability)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 3. Consider instead — the existing relatedPatterns
                    content, rendered verbatim. */}
                <div className={resultSectionStyle}>
                  <span className={sectionLabelStyle}>Consider instead</span>
                  {patternKnowledge.relatedPatterns.value.map((line) => (
                    <p key={line} className={css({ textStyle: "body" })}>
                      {line}
                    </p>
                  ))}
                </div>

                {/* 4. Needs context. Knowledge limitation: `unresolved` mixes
                    product-relevant uncertainty with Clara-internal
                    schema/governance questions, and nothing in the record
                    lets this be split reliably without parsing prose — doing
                    that would reintroduce the exact problem `availability`
                    was added to avoid. Rather than invent a classifier, this
                    surfaces only a structural fact (the count) and points to
                    the unfiltered list in "Full detail" below. See
                    docs/project/learning-log.md, 2026-09-10 entry. */}
                <div className={resultSectionStyle}>
                  <span className={sectionLabelStyle}>Needs context</span>
                  <p className={css({ textStyle: "supporting" })}>
                    Clara has {unresolvedCount} open question
                    {unresolvedCount === 1 ? "" : "s"} recorded about this
                    recommendation — see &ldquo;Full detail&rdquo; below.
                  </p>
                </div>

                {/* Detail — the rest of the long-form guidance, behind a
                    native disclosure rather than a Clara component. */}
                <details className={detailStyle}>
                  <summary className={detailSummaryStyle}>Full detail</summary>
                  <div className={detailBodyStyle}>
                    <span className={sectionLabelStyle}>When to use</span>
                    <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                      {patternKnowledge.whenToUse.value.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <span className={sectionLabelStyle}>Required content</span>
                    <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                      {patternKnowledge.requiredContent.value.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <span className={sectionLabelStyle}>Action hierarchy</span>
                    <p className={css({ textStyle: "body" })}>
                      {patternKnowledge.actionHierarchy.value}
                    </p>

                    <span className={sectionLabelStyle}>Cancellation</span>
                    <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                      {patternKnowledge.cancellationBehavior.value.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <span className={sectionLabelStyle}>
                      Explicitly unresolved
                    </span>
                    <ul className={css({ textStyle: "supporting", paddingLeft: "4" })}>
                      {patternKnowledge.unresolved.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>

                    <span className={css({ textStyle: "supporting" })}>
                      Source: docs/knowledge/destructive-confirmation.json
                    </span>
                  </div>
                </details>
              </div>
            )}

            {hasSubmitted && !isKnownIntent && (
              <div className={resultCardStyle}>
                <p className={css({ textStyle: "body" })}>
                  Clara doesn't have a confident match for &ldquo;
                  {submittedIntent}&rdquo; yet.
                </p>
                <p className={css({ textStyle: "supporting" })}>
                  This experiment only resolves one demonstrated intent:
                  &nbsp;&ldquo;{patternKnowledge.demonstratedIntent.value}&rdquo;
                </p>
              </div>
            )}
          </div>
        </form>

        <div
          role="group"
          aria-label="Example intents"
          className={css({
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2",
          })}
        >
          {SUGGESTED_INTENTS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setIntent(suggestion)}
              className={suggestionStyle}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
