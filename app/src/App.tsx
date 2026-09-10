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
// STRUCTURAL REDESIGN (this pass): the matched result is no longer four
// equal, identically-templated sections stacked in one centered column.
// It is one asymmetric editorial composition — intent (the question) and
// recommendation (the answer) on a narrow left axis, the composition
// diagram dominating a wide right axis, with two deliberately
// mismatched annotations beside it. There is exactly one repeated
// structural element on the page (the composition diagram's rail), and
// it is intentional, not a template. Every raw value below is a local
// Explorer presentation decision, not a Clara Core token — see the prior
// pass's note on `docs/foundations/token-model.md`'s open gaps.
const SUGGESTED_INTENTS = [
  "Confirm a risky action",
  "Help users recover from an error",
  "Collect payment information",
  "Show that there is no content yet",
];

// Deterministic intent → Pattern mapping for exactly one demonstrated intent
// (docs/slices/01-intent-first-discovery.md, "Example"). This is a fixed
// demonstration, not search, ranking, or AI matching — see
// docs/knowledge/destructive-confirmation.json's knownLimitations.
//
// `patternKnowledge` is read directly from that JSON file — the only
// source of the matched result's content. Nothing below duplicates or
// paraphrases its field values; the JSX only selects which fields to
// show, where to place them, and how to derive presentation labels (e.g.
// "Available"/"Missing") from structured field values.
function normalizeIntent(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

// Presentation label for a structured `composition[].availability` value.
// Reads the field directly — never inspects `component`'s free text to
// infer availability. See docs/knowledge/README.md, "composition[].availability".
function formatAvailability(availability: string): string {
  return availability === "available" ? "Available" : "Missing";
}

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
  _hover: { bg: "surface.subtle" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

const wordmarkStyle = css({
  textStyle: "label",
  fontWeight: "bold",
  color: "action.primary",
});

// The compact "revise" utility — the live Input/Button stay fully
// functional (same state, same handlers), but once a result exists they
// are deliberately narrow and quiet: a small tool, not the page's
// content.
const compactFormRowStyle = css({
  display: "flex",
  gap: "2",
  width: "100%",
  // Wide enough that the demonstrated intent doesn't visibly truncate
  // inside the input (24rem cut it off mid-word in the first structural
  // pass) — still narrower than the full-width entry state, so it still
  // reads as a small utility, not the page's content.
  maxWidth: "36rem",
});

// A short accent rule marking the intent statement as "the question," not
// body copy — the one other place the accent line appears, tying it to
// the diagram's spine without repeating a label+heading template.
const intentMarkStyle = css({
  display: "block",
  width: "2rem",
  height: "2px",
  bg: "action.primary",
  marginBottom: "0.75rem",
});

const intentStatementStyle = css({
  fontFamily: "sans",
  fontSize: "1.375rem",
  fontWeight: "regular",
  lineHeight: "1.4",
  opacity: "0.8",
});

// The recommendation: the strongest typographic moment on the page.
// Scale, weight and negative tracking do the work here — no eyebrow, no
// card. 3.5rem is well under Hallmark's ~5.5rem display ceiling; tight
// line-height and slightly negative letter-spacing push the existing
// system sans toward a genuine display register without adding a second
// typeface. `clamp()` scales the size down on narrow viewports — a plain
// CSS function, not a Panda breakpoint condition (Clara has none
// declared) — because a fixed 3.5rem broke "Destructive" mid-word at
// 360px (caught during mobile verification of this pass).
const heroNameStyle = css({
  fontFamily: "sans",
  fontSize: "clamp(2rem, 8vw, 3.5rem)",
  fontWeight: "bold",
  lineHeight: "1.04",
  letterSpacing: "-0.02em",
});

const purposeStyle = css({
  textStyle: "body",
  opacity: "0.85",
});

// The "fixed demonstration" disclosure is required content, but it is
// metadata, not a section header — it now trails the recommendation as a
// small caption instead of introducing it, so it never reads as another
// instance of the eyebrow template.
const disclosureCaptionStyle = css({
  textStyle: "supporting",
  opacity: "0.5",
});

const leftColumnStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  flex: "1 1 20rem",
  minWidth: "0",
});

const recommendationBlockStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const rightColumnStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem",
  flex: "2 1 30rem",
  minWidth: "0",
});

// The composition diagram. No fill, no card — a single accent-colored
// spine (the one deliberately repeated structural element on the page,
// used exactly once, for exactly this reason) carries the eye from the
// root role down through its parts. Depth comes from marker size and
// type weight, never from a shadowed box.
const diagramRootRowStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

const rootMarkerStyle = css({
  width: "0.875rem",
  height: "0.875rem",
  borderRadius: "9999px",
  bg: "action.primary",
  flexShrink: "0",
});

const rootRoleTextStyle = css({
  fontFamily: "sans",
  fontSize: "1.375rem",
  fontWeight: "bold",
  textTransform: "capitalize",
  flex: "1",
  minWidth: "0",
});

const diagramRailStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  marginLeft: "0.375rem",
  marginTop: "1.5rem",
  paddingLeft: "1.5rem",
  borderLeft: "2px solid",
  borderColor: "action.primary",
});

const childRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "2",
});

const childRoleGroupStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
  flex: "1",
  minWidth: "0",
});

const childMarkerStyle = css({
  width: "0.375rem",
  height: "0.375rem",
  borderRadius: "9999px",
  bg: "action.primary",
  flexShrink: "0",
  marginTop: "0.5rem",
});

const childRoleTextStyle = css({ textStyle: "body", textTransform: "capitalize" });

// Availability, in text alone: weight and opacity, never a fill or a
// hue. "Missing" is bold and full-opacity so it holds attention;
// "Available" recedes.
const tagMissingStyle = css({
  textStyle: "label",
  fontWeight: "bold",
  flexShrink: "0",
  whiteSpace: "nowrap",
});

const tagAvailableStyle = css({
  textStyle: "label",
  opacity: "0.5",
  flexShrink: "0",
  whiteSpace: "nowrap",
});

// Supporting insight — deliberately mismatched shapes, not two instances
// of one template. "Consider instead" is a bordered marginal note with
// its label folded into the sentence; "Needs context" is a short marked
// caption with no border and a different width and vertical offset.
const annotationsRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: "3rem",
});

const considerInsteadStyle = css({
  display: "flex",
  flexDirection: "column",
  flex: "3 1 16rem",
  minWidth: "0",
  paddingLeft: "1rem",
  borderLeft: "2px solid",
  borderColor: "border.default",
});

const considerInsteadTextStyle = css({ textStyle: "body", opacity: "0.8" });
const considerInsteadLeadStyle = css({ fontWeight: "bold" });

const needsContextStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
  flex: "2 1 12rem",
  minWidth: "0",
  // Staggered lower than "Consider instead" — asymmetric vertical offset,
  // not a matching column.
  marginTop: "1.5rem",
});

const needsContextDotStyle = css({
  width: "0.375rem",
  height: "0.375rem",
  borderRadius: "9999px",
  bg: "action.primary",
  flexShrink: "0",
  marginTop: "0.5rem",
});

const needsContextTextStyle = css({ textStyle: "supporting", opacity: "0.6" });

// Full detail — an exit into documentation, marked by the page's one
// other divider (a plain top rule, used nowhere else) and pushed well
// away from the primary composition with the largest gap on the page.
const detailWrapperStyle = css({
  marginTop: "4rem",
  paddingTop: "1.5rem",
  borderTop: "1px solid",
  borderColor: "border.default",
});

const detailSummaryStyle = css({
  textStyle: "label",
  opacity: "0.55",
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

function CompositionAvailability({ availability }: { availability: string }) {
  const isMissing = availability === "missing";
  return (
    <span className={isMissing ? tagMissingStyle : tagAvailableStyle}>
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
  // containing role and the remaining rows as the parts composed inside
  // it — a rendering/grouping decision based on the array's existing
  // order, not new content. See docs/knowledge/destructive-confirmation.json.
  const [surfaceRow, ...compositionParts] = patternKnowledge.composition;
  const unresolvedCount = patternKnowledge.unresolved.length;

  return (
    <main
      data-panda-theme="explorer"
      className={css({
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: hasSubmitted ? "stretch" : "center",
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
          gap: hasSubmitted ? "2rem" : "8",
          width: "100%",
          marginX: "auto",
          // Raw value, not a Clara token: no `sizes` primitive exists yet
          // (ADR-003). 36rem bounds the entry surface to a readable
          // search-box width; 70rem once a result exists gives the
          // asymmetric two-axis layout room — a narrow ~20rem text
          // column plus a ~30rem+ diagram column, side by side.
          maxWidth: hasSubmitted ? "70rem" : "36rem",
        })}
      >
        <span className={wordmarkStyle}>Clara</span>

        {!hasSubmitted && (
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
            className={
              hasSubmitted
                ? compactFormRowStyle
                : css({
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "2",
                    width: "100%",
                  })
            }
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
                  width: "100%",
                  paddingTop: "2rem",
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4rem",
                  })}
                >
                  {/* Left axis: the question, then the answer. One
                      authored block, not label→heading→body. */}
                  <div className={leftColumnStyle}>
                    <div>
                      <span className={intentMarkStyle} aria-hidden="true" />
                      <p className={intentStatementStyle}>
                        &ldquo;{trimmedSubmittedIntent}&rdquo;
                      </p>
                    </div>

                    <div className={recommendationBlockStyle}>
                      <h2 className={heroNameStyle}>{patternKnowledge.pattern}</h2>
                      <p className={purposeStyle}>{patternKnowledge.purpose.value}</p>
                      <span className={disclosureCaptionStyle}>
                        Matched Pattern (fixed demonstration — not search)
                      </span>
                    </div>
                  </div>

                  {/* Right axis: the composition diagram dominates, with
                      two deliberately mismatched annotations beside it. */}
                  <div className={rightColumnStyle}>
                    <div>
                      <div className={diagramRootRowStyle}>
                        <span className={rootMarkerStyle} aria-hidden="true" />
                        <span className={rootRoleTextStyle}>{surfaceRow.role}</span>
                        <CompositionAvailability availability={surfaceRow.availability} />
                      </div>

                      <div className={diagramRailStyle}>
                        {compositionParts.map((part) => (
                          <div key={part.role} className={childRowStyle}>
                            <div className={childRoleGroupStyle}>
                              <span className={childMarkerStyle} aria-hidden="true" />
                              <span className={childRoleTextStyle}>{part.role}</span>
                            </div>
                            <CompositionAvailability availability={part.availability} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={annotationsRowStyle}>
                      <div className={considerInsteadStyle}>
                        {patternKnowledge.relatedPatterns.value.map((line, index) => (
                          <p key={line} className={considerInsteadTextStyle}>
                            {index === 0 && (
                              <span className={considerInsteadLeadStyle}>
                                Consider instead —{" "}
                              </span>
                            )}
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className={needsContextStyle}>
                        <span className={needsContextDotStyle} aria-hidden="true" />
                        <p className={needsContextTextStyle}>
                          {unresolvedCount} open question
                          {unresolvedCount === 1 ? "" : "s"} recorded — see
                          &ldquo;Full detail&rdquo; below.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <details className={detailWrapperStyle}>
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

                    <span className={css({ textStyle: "supporting", opacity: "0.6" })}>
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
                  flexWrap: "wrap",
                  gap: "4rem",
                  paddingTop: "2rem",
                })}
              >
                <div className={leftColumnStyle}>
                  <span className={intentMarkStyle} aria-hidden="true" />
                  <p className={intentStatementStyle}>
                    &ldquo;{submittedIntent}&rdquo;
                  </p>
                </div>
                <div className={rightColumnStyle}>
                  <p className={css({ textStyle: "body" })}>
                    Clara doesn't have a confident match for this yet.
                  </p>
                  <p className={css({ textStyle: "supporting", opacity: "0.7" })}>
                    This experiment only resolves one demonstrated intent:
                    &nbsp;&ldquo;{patternKnowledge.demonstratedIntent.value}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

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
