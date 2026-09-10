import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { css } from "../styled-system/css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import patternKnowledge from "../../docs/knowledge/destructive-confirmation.json";

// Clara Explorer — Inspection Console direction (Vertical Slice 01). See
// docs/slices/01-intent-first-discovery.md for the surface definition,
// docs/foundations/token-model.md for the token model this composes, and
// decisions/ADR-004-color-scheme-theme-expression.md for the theme
// contract the dark expression below depends on.
//
// This is a presentation rewrite, not a new architecture. The product
// model — one deterministic intent → one Pattern Knowledge record, read
// directly, never duplicated — is unchanged from the prior surface.
// `data-panda-theme="explorer"` now lives on <html> (index.html), not on
// this component's root, so that html/body (index.css) resolve the same
// theme; nothing in this file sets it.
//
// Nav labels below are visual/navigation affordances for the prototype,
// not working destinations — see NAV_ITEMS. Only "Explorer" is real.
const NAV_ITEMS = [
  { label: "Explorer", active: true },
  { label: "Components", active: false },
  { label: "Patterns", active: false },
  { label: "Tokens", active: false },
  { label: "Knowledge", active: false },
];

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
// it is the only source of the matched result's content, including every
// `composition[].availability` value the capability ledger renders. Nothing
// below infers availability from `component`'s prose, derives it from a
// role-name lookup table, or duplicates/paraphrases any field value — see
// docs/project/learning-log.md, "Constraint carried forward for any
// consumer of this field."
function normalizeIntent(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
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

// ---------------------------------------------------------------------------
// Shell — a lightweight, persistent application silhouette (left rail +
// main workspace). Local presentation layout only: no new Clara component,
// no navigation logic, no Core layout token. The rail's non-Explorer items
// are rendered visibly inert (dimmed, `aria-disabled`, unfocusable) rather
// than implying working destinations.
// ---------------------------------------------------------------------------

const shellStyle = css({
  display: "flex",
  minHeight: "100vh",
  alignItems: "stretch",
  "@media (max-width: 760px)": {
    flexDirection: "column",
    minHeight: "auto",
  },
});

// Local rail width — presentation-specific, not a Clara `sizes` primitive
// (none exists yet; see the existing `maxWidth: "36rem"` precedent below
// for the same reasoning).
const railStyle = css({
  display: "flex",
  flexDirection: "column",
  width: "13.5rem",
  flexShrink: 0,
  borderRight: "1px solid",
  borderColor: "border.default",
  paddingX: "4",
  paddingY: "1.5rem",
  gap: "8",
  "@media (max-width: 760px)": {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRight: "none",
    borderBottom: "1px solid",
    borderColor: "border.default",
    paddingY: "0.75rem",
    gap: "4",
  },
});

const wordmarkStyle = css({
  textStyle: "label",
  fontWeight: "bold",
  letterSpacing: "0.02em",
});

const navListStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  "@media (max-width: 760px)": {
    display: "none",
  },
});

// Active state carries the accent's first of exactly two jobs (see
// `inspectedMarkStyle` below for the second — no other use of `accent`
// exists in this file). Inert items are dimmed and removed from the tab
// order — visible as a destination that exists conceptually, not one
// that works.
function navItemStyle(active: boolean) {
  return css({
    textStyle: "supporting",
    display: "flex",
    alignItems: "center",
    height: "2rem",
    paddingLeft: "3",
    borderLeft: "2px solid",
    borderColor: active ? "action.primary" : "transparent",
    color: active ? "text.primary" : "text.secondary",
    fontWeight: active ? "medium" : "regular",
    opacity: active ? "1" : "0.55",
    cursor: active ? "default" : "not-allowed",
  });
}

const honestyMarkerStyle = css({
  marginTop: "auto",
  fontFamily: "mono",
  fontSize: "0.6875rem",
  color: "text.secondary",
  opacity: "0.8",
  "@media (max-width: 760px)": {
    marginTop: "0",
  },
});

const workspaceStyle = css({
  flex: "1",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
});

// ---------------------------------------------------------------------------
// Context bar — the intent input as working context, not a hero. Suggestion
// intents live here as a small inline row, not landing-page chips.
// ---------------------------------------------------------------------------

const contextBarStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  borderBottom: "1px solid",
  borderColor: "border.default",
  paddingX: "1.5rem",
  paddingY: "4",
});

const contextFormRowStyle = css({
  display: "flex",
  gap: "2",
  width: "100%",
  // Wide enough that the demonstrated intent doesn't visibly truncate in
  // the input (34rem cut it off mid-word) — still a bounded query-bar
  // width, not a full-bleed row, so it keeps reading as working context
  // rather than a hero element.
  maxWidth: "46rem",
});

const suggestionRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "2",
});

const suggestionCaptionStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
});

// Compact tag, not a landing-page pill: smaller type, tighter padding than
// the prior entry surface's suggestion control.
const suggestionStyle = css({
  textStyle: "supporting",
  display: "inline-flex",
  alignItems: "center",
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  paddingX: "2",
  paddingY: "0.25rem",
  cursor: "pointer",
  _hover: { bg: "surface.subtle" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

// ---------------------------------------------------------------------------
// Canvas — the inspected Pattern (left, dominant) and a quiet annotation
// rail (right). Asymmetric on purpose: the composition ledger, not the
// Pattern name, is the page's primary object.
// ---------------------------------------------------------------------------

const canvasStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 19rem",
  gap: "2.5rem",
  padding: "1.5rem",
  alignItems: "start",
  "@media (max-width: 900px)": {
    gridTemplateColumns: "1fr",
    gap: "8",
  },
});

const patternHeaderStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  marginBottom: "1.5rem",
});

// The accent's second and last job: a small spine marking the Pattern as
// the object under inspection — not decoration, a locator. Every other
// occurrence of orange on this page is the nav's active-state edge above,
// or Clara's existing Button contract (inherited, unchanged by this pass).
const inspectedMarkStyle = css({
  display: "block",
  width: "1.5rem",
  height: "2px",
  bg: "action.primary",
  marginBottom: "0.25rem",
});

const metaLabelStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  fontSize: "0.6875rem",
});

// Compact by design (see the approved art direction's "Pattern header"
// section): reuses the existing `heading` textStyle (24px) rather than
// introducing a larger display size. The ledger below carries more visual
// weight than this title.
const patternNameStyle = css({ textStyle: "heading" });

const purposeTextStyle = css({
  fontFamily: "sans",
  fontSize: "0.9375rem",
  lineHeight: "1.6",
  color: "text.primary",
  maxWidth: "38rem",
});

// ---------------------------------------------------------------------------
// Capability ledger — the primary information object. An operational
// ledger of composition roles, not a diagram, not cards, not a tree
// illustration: aligned rows, hairline dividers, one indentation level for
// containment. `availability` is read directly from
// `composition[].availability` for every row rendered here — no lookup
// table keyed on `role`, no inference from `component`'s prose.
//
// Availability is distinguished by three independent signals — shape,
// weight/color, and the literal mono word itself — never by color alone
// (per the Pattern's own `accessibility` guidance), and never by the
// accent color: orange is reserved for exactly two jobs elsewhere on this
// page (active nav state; the inspected-object rule below), not for a
// status system.
// ---------------------------------------------------------------------------

const ledgerStyle = css({
  display: "flex",
  flexDirection: "column",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
});

function ledgerRowStyle(isLast: boolean) {
  return css({
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "4",
    paddingX: "4",
    paddingY: "0.75rem",
    borderBottom: isLast ? "none" : "1px solid",
    borderColor: "border.default",
  });
}

const ledgerChildrenListStyle = css({
  display: "flex",
  flexDirection: "column",
  marginLeft: "1.5rem",
  borderLeft: "1px solid",
  borderColor: "border.default",
});

const ledgerRoleWrapStyle = css({
  display: "flex",
  alignItems: "baseline",
  gap: "2",
  minWidth: "0",
});

function ledgerRoleLabelStyle(emphasized: boolean) {
  return css({
    fontFamily: "sans",
    fontSize: "0.875rem",
    fontWeight: emphasized ? "bold" : "regular",
    color: "text.primary",
  });
}

// The glyph is `aria-hidden`: the row's own text already states
// availability in words, so the shape is a redundant visual reinforcement,
// not the only signal.
function ledgerShapeStyle(available: boolean) {
  return css({
    fontFamily: "mono",
    fontSize: "0.875rem",
    lineHeight: "1",
    color: available ? "text.secondary" : "text.primary",
    flexShrink: 0,
  });
}

// Literal render of `composition[].availability`'s own string value
// ("available" / "missing"), in mono, lower-case, unmodified — this is a
// machine-readable fact from Clara Knowledge, not human-authored copy.
// `missing` is bolder and full-contrast; `available` is regular weight and
// secondary — greyscale weight carries the emphasis a status color would
// otherwise carry, on purpose.
function ledgerAvailabilityStyle(available: boolean) {
  return css({
    fontFamily: "mono",
    fontSize: "0.75rem",
    fontWeight: available ? "regular" : "medium",
    color: available ? "text.secondary" : "text.primary",
    flexShrink: 0,
  });
}

type CompositionRow = { role: string; availability: string };

function CompositionRowContent({
  row,
  emphasized,
}: {
  row: CompositionRow;
  emphasized: boolean;
}) {
  const available = row.availability === "available";
  return (
    <>
      <span className={ledgerRoleWrapStyle}>
        <span aria-hidden className={ledgerShapeStyle(available)}>
          {available ? "●" : "○"}
        </span>
        <span className={ledgerRoleLabelStyle(emphasized)}>{row.role}</span>
      </span>
      <span className={ledgerAvailabilityStyle(available)}>
        {row.availability}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Secondary rail — quieter treatment by weight and size, not a smaller
// card. `relatedPatterns` is rendered verbatim, never paraphrased (see
// docs/project/learning-log.md). `unresolved` is represented only by its
// structural count here — Clara Knowledge cannot yet distinguish
// product-relevant uncertainty from Clara-internal uncertainty without
// parsing prose, and this file does not attempt that classification; the
// full, unfiltered list is available in "Full guidance" below.
// ---------------------------------------------------------------------------

const secondaryRailStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

const secondaryBlockStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
});

const secondaryLabelStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  fontSize: "0.6875rem",
  marginBottom: "0.25rem",
});

const secondaryBodyStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  lineHeight: "1.6",
});

const sourcePathStyle = css({
  fontFamily: "mono",
  fontSize: "0.75rem",
  color: "text.secondary",
  wordBreak: "break-word",
});

// ---------------------------------------------------------------------------
// Full guidance — native <details>/<summary>, redesigned so opening it is a
// set of labeled sections rather than an unstyled text dump. No Clara
// Accordion/Disclosure component: native element semantics (including
// keyboard behavior) are used as-is, per the existing decision.
// ---------------------------------------------------------------------------

const detailsStyle = css({
  marginTop: "1.5rem",
  borderTop: "1px solid",
  borderColor: "border.default",
  paddingTop: "4",
});

const summaryStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  cursor: "pointer",
  _hover: { color: "text.primary" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "focus.ring",
    outlineOffset: "2px",
  },
});

const detailSectionsStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  marginTop: "1.25rem",
  maxWidth: "38rem",
});

const detailSectionStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  paddingTop: "4",
  borderTop: "1px solid",
  borderColor: "border.default",
});

const detailLabelStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  fontSize: "0.6875rem",
});

const detailListStyle = css({
  textStyle: "body",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  paddingLeft: "4",
});

function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={detailSectionStyle}>
      <span className={detailLabelStyle}>{label}</span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result surfaces — no match / initial states, quiet and honest.
// ---------------------------------------------------------------------------

const stateMessageStyle = css({
  textStyle: "body",
  color: "text.primary",
  maxWidth: "34rem",
});

const stateSupportingStyle = css({
  textStyle: "supporting",
  color: "text.secondary",
  maxWidth: "34rem",
  marginTop: "2",
});

export function App() {
  const [intent, setIntent] = useState("");
  const [submittedIntent, setSubmittedIntent] = useState<string | null>(null);

  function handleIntentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedIntent(intent);
  }

  const trimmedSubmittedIntent = submittedIntent?.trim() ?? "";
  const isKnownIntent =
    trimmedSubmittedIntent.length > 0 &&
    normalizeIntent(trimmedSubmittedIntent) ===
      normalizeIntent(patternKnowledge.demonstratedIntent.value);
  const hasFallback =
    submittedIntent !== null && trimmedSubmittedIntent.length > 0 && !isKnownIntent;

  const composition: CompositionRow[] = patternKnowledge.composition;
  const [groupRow, ...childRows] = composition;
  const missingCount = composition.filter((row) => row.availability === "missing").length;
  const unresolvedCount = patternKnowledge.unresolved.length;

  return (
    <div className={shellStyle}>
      <nav aria-label="Clara" className={railStyle}>
        <span className={wordmarkStyle}>Clara</span>

        <ul className={navListStyle}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.active ? (
                <span aria-current="page" className={navItemStyle(true)}>
                  {item.label}
                </span>
              ) : (
                <span aria-disabled="true" className={navItemStyle(false)}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>

        <span className={honestyMarkerStyle}>slice 01 · deterministic demo</span>
      </nav>

      <main className={workspaceStyle}>
        <header className={contextBarStyle}>
          <form onSubmit={handleIntentSubmit} className={contextFormRowStyle}>
            <label htmlFor="intent-input" className={visuallyHiddenStyle}>
              Describe what you need
            </label>
            <Input
              id="intent-input"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="Describe what you need..."
              className={css({ flex: "1" })}
            />
            <Button type="submit">Submit intent</Button>
          </form>

          <div role="group" aria-label="Example intents" className={suggestionRowStyle}>
            <span className={suggestionCaptionStyle}>Try:</span>
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
        </header>

        <div role="status" aria-live="polite">
          {isKnownIntent && (
            <div className={canvasStyle}>
              <section aria-label="Inspected Pattern">
                <div className={patternHeaderStyle}>
                  <span aria-hidden className={inspectedMarkStyle} />
                  <span className={metaLabelStyle}>
                    Pattern · fixed demonstration — not search
                  </span>
                  <h1 className={patternNameStyle}>{patternKnowledge.pattern}</h1>
                  <p className={purposeTextStyle}>{patternKnowledge.purpose.value}</p>
                </div>

                <p className={css({ textStyle: "supporting", color: "text.secondary", marginBottom: "0.75rem" })}>
                  {missingCount} of {composition.length} required capabilities are
                  currently missing in Clara.
                </p>

                <div className={ledgerStyle}>
                  <div className={ledgerRowStyle(childRows.length === 0)}>
                    <CompositionRowContent row={groupRow} emphasized />
                  </div>
                  <ul className={ledgerChildrenListStyle}>
                    {childRows.map((row, index) => (
                      <li key={row.role} className={ledgerRowStyle(index === childRows.length - 1)}>
                        <CompositionRowContent row={row} emphasized={false} />
                      </li>
                    ))}
                  </ul>
                </div>

                <details className={detailsStyle}>
                  <summary className={summaryStyle}>Full guidance</summary>
                  <div className={detailSectionsStyle}>
                    <DetailSection label="When to use">
                      <ul className={detailListStyle}>
                        {patternKnowledge.whenToUse.value.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label="Required content">
                      <ul className={detailListStyle}>
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
                      <ul className={detailListStyle}>
                        {patternKnowledge.cancellationBehavior.value.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label={`Explicitly unresolved (${unresolvedCount})`}>
                      <ul className={css({ textStyle: "supporting", color: "text.secondary", display: "flex", flexDirection: "column", gap: "0.25rem", paddingLeft: "4" })}>
                        {patternKnowledge.unresolved.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </DetailSection>

                    <DetailSection label="Source">
                      <span className={sourcePathStyle}>
                        docs/knowledge/destructive-confirmation.json
                      </span>
                    </DetailSection>
                  </div>
                </details>
              </section>

              <aside aria-label="Supporting information" className={secondaryRailStyle}>
                <div className={secondaryBlockStyle}>
                  <span className={secondaryLabelStyle}>Consider instead</span>
                  <p className={secondaryBodyStyle}>
                    {patternKnowledge.relatedPatterns.value.join(" ")}
                  </p>
                </div>

                <div className={secondaryBlockStyle}>
                  <span className={secondaryLabelStyle}>Needs context</span>
                  <p className={secondaryBodyStyle}>
                    {unresolvedCount} open question{unresolvedCount === 1 ? "" : "s"} recorded
                    for this Pattern — see Full guidance.
                  </p>
                </div>

                <div className={secondaryBlockStyle}>
                  <span className={secondaryLabelStyle}>Source</span>
                  <span className={sourcePathStyle}>
                    docs/knowledge/destructive-confirmation.json
                  </span>
                </div>
              </aside>
            </div>
          )}

          {hasFallback && (
            <div className={css({ padding: "1.5rem" })}>
              <p className={stateMessageStyle}>
                Clara doesn't have a confident match for "{submittedIntent}" yet.
              </p>
              <p className={stateSupportingStyle}>
                This experiment only resolves one demonstrated intent:
                &nbsp;"{patternKnowledge.demonstratedIntent.value}"
              </p>
            </div>
          )}

          {submittedIntent === null && (
            <div className={css({ padding: "1.5rem" })}>
              <p className={stateSupportingStyle}>
                Submit an intent above to see what Clara currently knows.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
