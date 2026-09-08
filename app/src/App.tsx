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

export function App() {
  const [intent, setIntent] = useState("");
  const [submittedIntent, setSubmittedIntent] = useState<string | null>(null);

  function handleIntentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedIntent(intent);
  }

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
          {submittedIntent !== null && (
            <p className={css({ textStyle: "supporting" })}>
              Submitted: {submittedIntent}
            </p>
          )}
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
