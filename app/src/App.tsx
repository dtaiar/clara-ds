import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
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
//
// VISUAL DESIGN PASS (this file): every raw pixel/rem value, shadow,
// opacity, and grid technique below is a local Explorer presentation
// decision, not a Clara Core token or component. Clara Core has no
// `sizes`, elevation, muted-text, or breakpoint vocabulary yet (see
// docs/foundations/token-model.md, "What remains intentionally open", and
// ADR-003) — this file works within that gap rather than inventing Core
// tokens to fill it. If a value here recurs, that is evidence for a future
// Core decision, not one made here.
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
// values.
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

// Clara wordmark — accent-colored (color.action.primary) so the same
// identity mark carries through from the entry surface into the result,
// instead of the result feeling like a different screen. A restrained,
// single use of the accent for brand identity.
const wordmarkStyle = css({
  textStyle: "label",
  fontWeight: "bold",
  color: "action.primary",
});

// Shared "eyebrow" treatment for every small metadata/section label in the
// result (the fixed-demonstration disclosure, and each section heading).
// Local opacity reduction — not a new text color role — is how secondary
// text recedes without inventing color.text.secondary/muted (a named,
// still-open Core gap; see token-model.md).
const metaLabelStyle = css({
  textStyle: "label",
  opacity: "0.55",
  letterSpacing: "0.01em",
});

// The recommendation is the headline of the result — sized well beyond
// textStyle heading's 24px so it reads as Clara's answer, not another
// section label. A one-off local scale adjustment for this one hero
// moment, per this task's explicit allowance for local typography scale
// adjustments — not a new Clara type role.
const heroPatternNameStyle = css({
  fontFamily: "sans",
  fontSize: "2rem",
  fontWeight: "bold",
  lineHeight: "1.15",
});

// Small accent-colored marker beside the pattern name — the same role
// color.action.primary already used for the wordmark, reused here for
// visual cohesion rather than decoration for its own sake.
const accentMarkStyle = css({
  display: "inline-block",
  width: "0.3rem",
  height: "1.75rem",
  borderRadius: "md",
  bg: "action.primary",
  flexShrink: "0",
});

const purposeTextStyle = css({
  textStyle: "body",
  maxWidth: "38rem",
  opacity: "0.85",
});

// The composition diagram's canvas — the one deliberately bounded surface
// in the whole result, so it reads as a distinct object (a diagram) rather
// than another paragraph. Every other section sits directly on the page.
const compositionCanvasStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  bg: "surface.subtle",
  borderRadius: "md",
  // "8" (2rem) reuses the declared spacing scale rather than a new raw
  // value — Clara's spacing scale only declares 2/4/8 (ADR-003); any other
  // bare numeral silently resolves as a raw pixel value, not a token (e.g.
  // an earlier "6" here rendered as `padding: 6px`, not 1.5rem).
  padding: "8",
});

// The "confirmation surface" role rendered as its own nested white card —
// a second layer of depth inside the gray canvas, communicating
// containment (the rest of the tree lives inside this role) before any
// label is read.
const surfaceNodeCardStyle = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "2",
  bg: "surface.default",
  borderRadius: "md",
  padding: "4",
  boxShadow: "0 1px 2px rgba(17, 17, 17, 0.06)",
});

// `textTransform: "capitalize"` is presentation only — it changes how the
// browser renders `composition[].role`, not the underlying string. The
// Knowledge record's role values are deliberately lowercase, freeform
// prose-style strings; rendering them as "Confirmation Surface" here reads
// as a product label instead of a raw field dump, without editing the
// record itself.
const surfaceRoleTextStyle = css({
  textStyle: "body",
  fontWeight: "bold",
  textTransform: "capitalize",
  flex: "1",
  minWidth: "0",
});

// The connecting rail — a single vertical rule under the surface card,
// carrying the eye down into its parts. Indentation + a continuous line
// reads as "contained by" before any of the row labels are read.
const railStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  marginLeft: "4",
  // Raw value: 2/4/8 are the only declared spacing tokens, and none reads
  // right here — an explicit unit-bearing value is the documented ADR-003
  // fallback, not an accidental bare numeral (which would silently resolve
  // to a stray pixel value instead of a token).
  paddingLeft: "1.25rem",
  borderLeft: "2px solid",
  borderColor: "border.default",
});

const childRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "2",
  paddingY: "2",
});

const childRoleGroupStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
  flex: "1",
  minWidth: "0",
});

// Small accent dot marking each composed part — ties back to the same
// accent used for the wordmark and the recommendation's accent mark,
// rather than introducing a separate marker convention.
const nodeDotStyle = css({
  width: "0.375rem",
  height: "0.375rem",
  borderRadius: "md",
  bg: "action.primary",
  flexShrink: "0",
  marginTop: "2",
});

const childRoleTextStyle = css({ textStyle: "body", textTransform: "capitalize" });

// Availability tags. "Missing" is a filled, bordered pill that stands out
// against the gray canvas; "Available" is plain, reduced-opacity text with
// no container, so it recedes. The distinction is weight/fill/opacity —
// never hue — per this Pattern's own accessibility guidance ("must not
// rely on color alone") and this task's constraint against inventing
// red/green semantics. The word itself ("Available"/"Missing") always
// carries the meaning.
const tagBaseStyle = css({
  textStyle: "label",
  display: "inline-flex",
  alignItems: "center",
  flexShrink: "0",
  whiteSpace: "nowrap",
});

const tagMissingStyle = css({
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  paddingX: "2",
  paddingY: "0.25rem",
  fontWeight: "bold",
});

const tagAvailableStyle = css({
  opacity: "0.55",
});

// Secondary insights sit directly on the page, with no card — deliberately
// quieter than the composition canvas. `repeat(auto-fit, minmax(...))` is a
// plain CSS responsive technique that needs no Panda breakpoint condition:
// Clara has not declared breakpoint tokens yet (see ADR-003's "What remains
// intentionally open"), so a `md:`-style condition would silently no-op —
// this avoids that failure mode entirely, per its own documented lesson
// about undefined Panda keys producing invalid or missing CSS with no
// build error.
const secondaryGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
  gap: "8",
});

const secondaryColumnStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
});

const secondaryBodyStyle = css({ textStyle: "body", opacity: "0.85" });
const secondarySupportingStyle = css({ textStyle: "supporting", opacity: "0.7" });

// Progressive disclosure for the long-form guidance uses native <details>,
// not a Clara Accordion/Disclosure component — styled quietly, as
// supporting material rather than another major section.
const detailStyle = css({
  paddingTop: "2",
});

const detailSummaryStyle = css({
  textStyle: "label",
  opacity: "0.6",
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
  gap: "4",
  paddingTop: "4",
});

const detailSectionLabelStyle = css({ textStyle: "label", fontWeight: "bold" });

function CompositionTag({ availability }: { availability: string }) {
  return (
    <span
      className={`${tagBaseStyle} ${availability === "missing" ? tagMissingStyle : tagAvailableStyle}`}
    >
      {formatAvailability(availability)}
    </span>
  );
}

function DetailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
      <span className={detailSectionLabelStyle}>{label}</span>
      {children}
    </div>
  );
}

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
        justifyContent: hasSubmitted ? "flex-start" : "center",
        paddingX: "4",
        paddingY: "8",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: hasSubmitted ? "stretch" : "center",
          gap: hasSubmitted ? "1.5rem" : "8",
          width: "100%",
          // Raw value, not a Clara token: no `sizes` primitive category
          // exists yet (ADR-003 — dropping Panda's default preset removed
          // it, and Clara has not declared its own). 36rem bounds the entry
          // surface to a readable, search-box-like width; 44rem once a
          // result exists gives the composition diagram and the two-column
          // secondary area room to breathe.
          maxWidth: hasSubmitted ? "44rem" : "36rem",
        })}
      >
        <span className={wordmarkStyle}>Clara</span>

        {hasSubmitted ? (
          <p className={css({ textStyle: "supporting", opacity: "0.6" })}>
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
            alignItems: hasSubmitted ? "stretch" : "center",
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
              justifyContent: hasSubmitted ? "flex-start" : "center",
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
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  // Raw value: 2/4/8 are the only declared spacing tokens
                  // and none is generous enough for major zone separation;
                  // an explicit unit-bearing value avoids the bare-numeral
                  // pitfall (a prior "10" here silently resolved to 10px,
                  // not 2.5rem — see ADR-003).
                  gap: "3rem",
                  width: "100%",
                  paddingTop: "4",
                })}
              >
                {/* 1. Recommendation — the headline. No card, no border:
                    typography and the accent mark carry it. */}
                <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                  <span className={metaLabelStyle}>
                    Matched Pattern (fixed demonstration — not search)
                  </span>
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    })}
                  >
                    <span className={accentMarkStyle} aria-hidden="true" />
                    <h2 className={heroPatternNameStyle}>{patternKnowledge.pattern}</h2>
                  </div>
                  <p className={purposeTextStyle}>{patternKnowledge.purpose.value}</p>
                </div>

                {/* 2. Recommended composition — the visual center. A
                    bounded canvas containing a nested "surface" card and a
                    connected rail of its parts, so the relationship reads
                    spatially before any label is read. Availability is read
                    directly from composition[].availability. */}
                <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                  <span className={metaLabelStyle}>Recommended composition</span>
                  <div className={compositionCanvasStyle}>
                    <div className={surfaceNodeCardStyle}>
                      <span className={surfaceRoleTextStyle}>{surfaceRow.role}</span>
                      <CompositionTag availability={surfaceRow.availability} />
                    </div>

                    <div className={railStyle}>
                      {compositionParts.map((part) => (
                        <div key={part.role} className={childRowStyle}>
                          <div className={childRoleGroupStyle}>
                            <span className={nodeDotStyle} aria-hidden="true" />
                            <span className={childRoleTextStyle}>{part.role}</span>
                          </div>
                          <CompositionTag availability={part.availability} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3 & 4. Secondary insights — deliberately quiet, side by
                    side on wide viewports, stacking naturally on narrow
                    ones via CSS auto-fit (no breakpoint token needed). */}
                <div className={secondaryGridStyle}>
                  <div className={secondaryColumnStyle}>
                    <span className={metaLabelStyle}>Consider instead</span>
                    {patternKnowledge.relatedPatterns.value.map((line) => (
                      <p key={line} className={secondaryBodyStyle}>
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className={secondaryColumnStyle}>
                    <span className={metaLabelStyle}>Needs context</span>
                    <p className={secondaryBodyStyle}>
                      Clara has {unresolvedCount} open question
                      {unresolvedCount === 1 ? "" : "s"} recorded about this
                      recommendation — see &ldquo;Full detail&rdquo; below.
                    </p>
                  </div>
                </div>

                {/* Detail — supporting material, not a major section. */}
                <details className={detailStyle}>
                  <summary className={detailSummaryStyle}>Full detail</summary>
                  <div className={detailBodyStyle}>
                    <DetailSection label="When to use">
                      <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                        {patternKnowledge.whenToUse.value.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label="Required content">
                      <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                        {patternKnowledge.requiredContent.value.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label="Action hierarchy">
                      <p className={css({ textStyle: "body" })}>
                        {patternKnowledge.actionHierarchy.value}
                      </p>
                    </DetailSection>

                    <DetailSection label="Cancellation">
                      <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                        {patternKnowledge.cancellationBehavior.value.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label="Explicitly unresolved">
                      <ul className={css({ textStyle: "supporting", paddingLeft: "4" })}>
                        {patternKnowledge.unresolved.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <span className={secondarySupportingStyle}>
                      Source: docs/knowledge/destructive-confirmation.json
                    </span>
                  </div>
                </details>
              </div>
            )}

            {hasSubmitted && !isKnownIntent && (
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "2",
                  paddingTop: "4",
                })}
              >
                <p className={css({ textStyle: "body" })}>
                  Clara doesn't have a confident match for &ldquo;
                  {submittedIntent}&rdquo; yet.
                </p>
                <p className={css({ textStyle: "supporting", opacity: "0.7" })}>
                  This experiment only resolves one demonstrated intent:
                  &nbsp;&ldquo;{patternKnowledge.demonstratedIntent.value}&rdquo;
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Once a result exists, the page should end on the result, not on
            generic navigation — the suggestions stay reachable but are
            pushed further away and visually quieted rather than competing
            with the recommendation above them for the page's last word. */}
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2",
            width: "100%",
            marginTop: hasSubmitted ? "3rem" : "0",
            opacity: hasSubmitted ? "0.7" : "1",
          })}
        >
          {hasSubmitted && (
            <span className={css({ textStyle: "supporting", opacity: "0.7" })}>
              Try another intent
            </span>
          )}
          <div
            role="group"
            aria-label="Example intents"
            className={css({
              display: "flex",
              flexWrap: "wrap",
              justifyContent: hasSubmitted ? "flex-start" : "center",
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
      </div>
    </main>
  );
}
