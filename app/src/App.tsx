import { useState } from "react";
import type { FormEvent } from "react";
import { css } from "../styled-system/css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import patternKnowledge from "../../docs/knowledge/destructive-confirmation.json";
import emptyStateKnowledge from "../../docs/knowledge/empty-state.json";

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
  emptyStateKnowledge.demonstratedIntent.value,
];

// Two fixed demonstrations, not search, ranking, or AI matching. Both
// intents and result content come directly from their Knowledge records.
// Unmatched input falls through explicitly. Each result keeps its own field
// shape: this does not establish a universal Pattern schema or renderer.
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
  gap: "2",
  width: "100%",
  bg: "surface.default",
  border: "1px solid",
  borderColor: "border.default",
  borderRadius: "md",
  padding: "4",
  textAlign: "left",
});

export function App() {
  const [intent, setIntent] = useState("");
  const [submittedIntent, setSubmittedIntent] = useState<string | null>(null);

  function handleIntentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedIntent(intent);
  }

  const trimmedSubmittedIntent = submittedIntent?.trim() ?? "";
  const isDestructiveIntent =
    trimmedSubmittedIntent.length > 0 &&
    normalizeIntent(trimmedSubmittedIntent) ===
      normalizeIntent(patternKnowledge.demonstratedIntent.value);

  const isEmptyStateIntent =
    trimmedSubmittedIntent.length > 0 &&
    normalizeIntent(trimmedSubmittedIntent) ===
      normalizeIntent(emptyStateKnowledge.demonstratedIntent.value);

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
          gap: "8",
          width: "100%",
          // Raw value, not a Clara token: no `sizes` primitive category
          // exists yet (ADR-003 — dropping Panda's default preset removed
          // it, and Clara has not declared its own). This bounds the
          // entry surface to a readable, search-box-like width the way a
          // `sizes.contentMax`-style token would if one existed. Flagged
          // as a candidate gap in the PR description.
          maxWidth: "36rem",
        })}
      >
        <span className={css({ textStyle: "label", fontWeight: "bold" })}>
          Clara
        </span>

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
            {isDestructiveIntent && (
              <div className={resultCardStyle}>
                <span className={css({ textStyle: "supporting" })}>
                  Matched Pattern (fixed demonstration — not search)
                </span>
                <h2 className={css({ textStyle: "heading" })}>
                  {patternKnowledge.pattern}
                </h2>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Purpose
                </span>
                <p className={css({ textStyle: "body" })}>
                  {patternKnowledge.purpose.value}
                </p>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  When to use
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {patternKnowledge.whenToUse.value.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Required content
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {patternKnowledge.requiredContent.value.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Action hierarchy
                </span>
                <p className={css({ textStyle: "body" })}>
                  {patternKnowledge.actionHierarchy.value}
                </p>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Cancellation
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {patternKnowledge.cancellationBehavior.value.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Recommended composition
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {patternKnowledge.composition.map((item) => (
                    <li key={item.role}>
                      <strong>{item.role}:</strong> {item.component}
                    </li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
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
            )}

            {isEmptyStateIntent && (
              <div className={resultCardStyle}>
                <span className={css({ textStyle: "supporting" })}>
                  Matched Pattern (fixed demonstration — not search)
                </span>
                <h2 className={css({ textStyle: "heading" })}>
                  {emptyStateKnowledge.pattern}
                </h2>
                <p className={css({ textStyle: "supporting" })}>
                  {emptyStateKnowledge.recordStatus}
                </p>
                <p className={css({ textStyle: "body" })}>
                  {emptyStateKnowledge.purpose.value}
                </p>
                <strong className={css({ textStyle: "label" })}>
                  Example context — assumption
                </strong>
                <p className={css({ textStyle: "body" })}>
                  {emptyStateKnowledge.scopedScenario.value}
                </p>
                {[
                  { heading: "When to use", field: emptyStateKnowledge.whenToUse },
                  { heading: "When not to use", field: emptyStateKnowledge.whenNotToUse },
                  { heading: "Required content", field: emptyStateKnowledge.requiredContent },
                  { heading: "Available action", field: emptyStateKnowledge.actionAvailability },
                ].map(({ heading, field }) => (
                  <section key={heading}>
                    <h3 className={css({ textStyle: "label", fontWeight: "bold" })}>
                      {heading}
                    </h3>
                    <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                      {field.value.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  </section>
                ))}
                <h3 className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Distinguish from
                </h3>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {emptyStateKnowledge.stateDistinctions.map((item) => (
                    <li key={item.state}><strong>{item.state}:</strong> {item.guidance}</li>
                  ))}
                </ul>
                <h3 className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Recommended composition
                </h3>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {emptyStateKnowledge.composition.map((item) => (
                    <li key={item.role}><strong>{item.role}:</strong> {item.component}</li>
                  ))}
                </ul>
                <h3 className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Explicitly unresolved
                </h3>
                <ul className={css({ textStyle: "supporting", paddingLeft: "4" })}>
                  {emptyStateKnowledge.unresolved.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <span className={css({ textStyle: "supporting" })}>
                  Source: docs/knowledge/empty-state.json
                </span>
              </div>
            )}

            {submittedIntent !== null && trimmedSubmittedIntent.length > 0 && !isDestructiveIntent && !isEmptyStateIntent && (
              <div className={resultCardStyle}>
                <p className={css({ textStyle: "body" })}>
                  Clara doesn't have a confident match for "{submittedIntent}" yet.
                </p>
                <p className={css({ textStyle: "supporting" })}>
                  This experiment only resolves these demonstrated intents:
                </p>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {[patternKnowledge.demonstratedIntent.value, emptyStateKnowledge.demonstratedIntent.value].map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
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
