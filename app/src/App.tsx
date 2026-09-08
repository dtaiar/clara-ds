import { useState } from "react";
import type { FormEvent } from "react";
import { css } from "../styled-system/css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";

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
const DESTRUCTIVE_CONFIRMATION_INTENT =
  "I need users to confirm before deleting something.";

function normalizeIntent(value: string): string {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

// Mirrors docs/knowledge/destructive-confirmation.json — that JSON file is
// the source of truth for this content; this constant duplicates only the
// fields the Explorer renders. Keeping them in sync is a manual discipline
// for this experiment, the same relationship Button.tsx/Input.tsx already
// have with their own Knowledge records, applied in the other direction
// (here the JSON is the source, not the code). See that record's own
// `unresolved` for whether this should instead be read directly by a future
// machine interface rather than duplicated.
const DESTRUCTIVE_CONFIRMATION_RESULT = {
  pattern: "Destructive Confirmation",
  whyRecommended:
    "Your intent describes a destructive, likely irreversible action (deleting something) that a user could trigger with a single click — the exact problem this pattern addresses.",
  guidance: [
    "Name what will be affected, and state that it can't be undone — a generic \"Are you sure?\" isn't enough.",
    "Always give an easy way to cancel (keyboard-reachable, no consequence).",
    "Make the confirming action require its own deliberate step — never automatic, never triggered by a habitual keypress.",
    "Visually distinguish the destructive action from an ordinary action — Clara does not yet have a dedicated \"danger\" treatment for this (see unresolved).",
  ],
  composition: [
    { role: "Confirmation surface", detail: "not built — could be a modal, an inline replacement, or an undo-after-the-fact pattern instead" },
    { role: "Heading + consequence copy", detail: "existing Clara text styles — no new typography needed" },
    { role: "Cancel action", detail: "Clara Button — no secondary/ghost variant exists yet" },
    { role: "Confirm action", detail: "Clara Button — no destructive variant exists yet; shown here with the same styling as any other action" },
  ],
  unresolved: [
    "Whether a destructive action needs its own semantic color role, distinct from Clara's primary action color.",
    "Whether Clara needs a real Dialog/overlay component, or this stays guidance until a real surface needs one.",
    "Whether \"confirm before\" and \"undo after\" should be separate patterns.",
  ],
  source: "docs/knowledge/destructive-confirmation.json",
};

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
  const isKnownIntent =
    trimmedSubmittedIntent.length > 0 &&
    normalizeIntent(trimmedSubmittedIntent) ===
      normalizeIntent(DESTRUCTIVE_CONFIRMATION_INTENT);

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
            {isKnownIntent && (
              <div className={resultCardStyle}>
                <span className={css({ textStyle: "supporting" })}>
                  Matched Pattern (fixed demonstration — not search)
                </span>
                <h2 className={css({ textStyle: "heading" })}>
                  {DESTRUCTIVE_CONFIRMATION_RESULT.pattern}
                </h2>
                <p className={css({ textStyle: "body" })}>
                  {DESTRUCTIVE_CONFIRMATION_RESULT.whyRecommended}
                </p>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Key guidance
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {DESTRUCTIVE_CONFIRMATION_RESULT.guidance.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Recommended composition
                </span>
                <ul className={css({ textStyle: "body", paddingLeft: "4" })}>
                  {DESTRUCTIVE_CONFIRMATION_RESULT.composition.map((item) => (
                    <li key={item.role}>
                      <strong>{item.role}:</strong> {item.detail}
                    </li>
                  ))}
                </ul>

                <span className={css({ textStyle: "label", fontWeight: "bold" })}>
                  Explicitly unresolved
                </span>
                <ul className={css({ textStyle: "supporting", paddingLeft: "4" })}>
                  {DESTRUCTIVE_CONFIRMATION_RESULT.unresolved.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>

                <span className={css({ textStyle: "supporting" })}>
                  Source: {DESTRUCTIVE_CONFIRMATION_RESULT.source}
                </span>
              </div>
            )}

            {submittedIntent !== null && trimmedSubmittedIntent.length > 0 && !isKnownIntent && (
              <div className={resultCardStyle}>
                <p className={css({ textStyle: "body" })}>
                  Clara doesn't have a confident match for "{submittedIntent}" yet.
                </p>
                <p className={css({ textStyle: "supporting" })}>
                  This experiment only resolves one demonstrated intent:
                  &nbsp;"{DESTRUCTIVE_CONFIRMATION_INTENT}"
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
