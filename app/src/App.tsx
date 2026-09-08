import { useState } from "react";
import type { FormEvent } from "react";
import { css } from "../styled-system/css";
import { Button } from "./components/Button";
import { Input } from "./components/Input";

// Slice 01 checkpoint only — not the Explorer UI. Proves that a single
// element can switch between two Panda themes at runtime while resolving
// the same Clara semantic roles, with no theme name or brand color
// referenced by the component itself. See ADR-002.
const THEME_NAMES = ["explorer", "alternate"] as const;
type ThemeName = (typeof THEME_NAMES)[number];

export function App() {
  const [theme, setTheme] = useState<ThemeName>("explorer");
  const [intent, setIntent] = useState("");
  const [submittedIntent, setSubmittedIntent] = useState<string | null>(null);

  function handleIntentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedIntent(intent);
  }

  return (
    <div
      data-panda-theme={theme}
      className={css({
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4",
        padding: "8",
      })}
    >
      <p>Active theme: {theme}</p>

      {/* Typography checkpoint only — not the Explorer UI. Proves the four
          Slice 01 text styles (heading, body, label, supporting) render
          distinct, composed typography from Core-level primitives, with
          no per-theme override. See docs/foundations/token-model.md. */}
      <h1 className={css({ textStyle: "heading" })}>Heading text style</h1>
      <p className={css({ textStyle: "body" })}>
        Body text style — the default reading size for Slice 01 content.
      </p>
      <span className={css({ textStyle: "label" })}>Label text style</span>
      <p className={css({ textStyle: "supporting" })}>
        Supporting text style — smaller, for helper or secondary copy.
      </p>

      {/* Button checkpoint — still not the Explorer UI. Now the real Clara
          Button component (app/src/components/Button.tsx) instead of an
          ad hoc styled <button>, reused for the same theme-toggle proof
          ADR-002 established. See docs/knowledge/button.json. */}
      <Button
        onClick={() =>
          setTheme((current) => (current === "explorer" ? "alternate" : "explorer"))
        }
      >
        Sample element — toggle theme
      </Button>

      {/* Input checkpoint — still not the Explorer UI. Tests the second
          Clara Knowledge experiment (docs/knowledge/input.json). Input
          itself owns no label and no submit behavior; both are composed
          here with plain native elements (label/form), not new Clara
          components — see input.json's `unresolved` for the open
          Field/Label ownership question this checkpoint deliberately does
          not resolve. */}
      <form
        onSubmit={handleIntentSubmit}
        className={css({ display: "flex", flexDirection: "column", gap: "2" })}
      >
        <label htmlFor="intent-input" className={css({ textStyle: "label" })}>
          Describe what you need
        </label>
        <Input
          id="intent-input"
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          placeholder="I need users to confirm before deleting something"
        />
        <Button type="submit">Submit intent</Button>
        {submittedIntent !== null && (
          <p className={css({ textStyle: "supporting" })}>
            Submitted: {submittedIntent}
          </p>
        )}
      </form>
    </div>
  );
}
